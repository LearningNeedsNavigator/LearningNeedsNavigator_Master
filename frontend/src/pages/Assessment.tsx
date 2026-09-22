import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Users,
  Target,
  Sparkles,
  ArrowRight,
  BarChart3,
  Check,
  Search,
  Wrench,
  ClipboardList,
} from "lucide-react";
import SegmentAssessment from "@/components/assessment/SegmentAssessment";
import { segments } from "@/data/sampleData";
import { UserResponse } from "@/types/assessment";
import { calculateResults } from "@/utils/assessmentUtils";
import { toast } from "@/components/ui/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Assessment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    trackButtonClick,
    trackSegmentStart,
    trackSegmentComplete,
    trackAssessmentStart,
    updateAssessmentProgress,
    getTimeSpent,
  } = useAnalytics();

  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [completedSegments, setCompletedSegments] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [assessmentAnalyticsId, setAssessmentAnalyticsId] = useState<string | null>(null);

  // Effect to refresh the component when segments change
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, []);

  const handleSegmentClick = async (segmentId: string) => {
    console.log("Segment clicked:", segmentId);

    // First, set the active segment regardless of analytics
    setActiveSegmentId(segmentId);

    // Then try to track analytics, but don't let failures block the UI
    try {
      await trackButtonClick("segment_card", segmentId);
      await trackSegmentStart(segmentId);

      // Start assessment analytics tracking
      const segment = segments.find((s) => s.id === segmentId);
      if (segment) {
        const analyticsId = await trackAssessmentStart(segmentId, segment.questions.length);
        setAssessmentAnalyticsId(analyticsId);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error("Analytics tracking failed:", error);
    }
  };

  const handleResponseChange = async (response: UserResponse) => {
    setResponses((prev) => {
      const existing = prev.findIndex((r) => r.questionId === response.questionId);
      const newResponses = existing >= 0 ? prev.map((r, i) => (i === existing ? response : r)) : [...prev, response];

      // Try to update assessment progress, but don't block on failure
      try {
        if (activeSegmentId && assessmentAnalyticsId) {
          const segment = segments.find((s) => s.id === activeSegmentId);
          if (segment) {
            const segmentQuestionIds = segment.questions.map((q) => q.id);
            const answeredCount = newResponses.filter(
              (r) =>
                segmentQuestionIds.includes(r.questionId) &&
                (r.selectedOptionId || (r.customText && r.customText.trim() !== "")),
            ).length;

            updateAssessmentProgress(assessmentAnalyticsId, answeredCount, getTimeSpent());
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error("Progress tracking failed:", error);
      }

      return newResponses;
    });
  };

  const handleSegmentComplete = async () => {
    if (activeSegmentId) {
      const segmentQuestions = segments.find((s) => s.id === activeSegmentId)?.questions || [];

      // Validation for multiple choice "Other" options
      const missingOtherText = responses.some(
        (r) =>
          r.selectedOptionId === "other" &&
          (!r.customText || r.customText.trim() === "") &&
          segmentQuestions.some((q) => q.id === r.questionId),
      );

      if (missingOtherText) {
        toast({
          title: "Missing information",
          description: "Please provide text for any 'Other' options you've selected.",
          variant: "destructive",
        });
        return;
      }

      // Validation for text input questions
      const textInputQuestions = segmentQuestions.filter((q) => q.type === "textInput");
      const unansweredTextQuestions = textInputQuestions.filter((q) => {
        const response = responses.find((r) => r.questionId === q.id);
        return !response || !response.customText || response.customText.trim() === "";
      });

      if (unansweredTextQuestions.length > 0) {
        toast({
          title: "Incomplete responses",
          description: `Please answer all text input questions before completing this segment.`,
          variant: "destructive",
        });
        return;
      }

      // Try to track segment completion, but don't block on failure
      try {
        await trackSegmentComplete(activeSegmentId);
        await trackButtonClick("complete_segment", activeSegmentId);
      } catch (error) {
        if (import.meta.env.DEV) console.error("Completion tracking failed:", error);
      }

      setCompletedSegments((prev) => {
        if (!prev.includes(activeSegmentId)) {
          return [...prev, activeSegmentId];
        }
        return prev;
      });

      const segmentName = segments.find((s) => s.id === activeSegmentId)?.title || "Segment";
      toast({
        title: `${segmentName} Completed`,
        description: "Your responses have been recorded. Continue with other segments or view recommendations.",
      });

      setActiveSegmentId(null);
      setAssessmentAnalyticsId(null);
    }
  };

  const handleBack = async () => {
    try {
      await trackButtonClick("back_from_segment", activeSegmentId || "unknown");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Back button tracking failed:", error);
    }
    setActiveSegmentId(null);
    setAssessmentAnalyticsId(null);
  };

  const handleViewResults = async () => {
    try {
      await trackButtonClick("view_results");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Results button tracking failed:", error);
    }

    if (completedSegments.length < segments.length) {
      toast({
        title: "Assessment incomplete",
        description: "Please complete all assessment segments to view recommendations.",
        variant: "destructive",
      });
      return;
    }

    const results = calculateResults(responses);

    // Persist the generated report so it survives refresh/navigation
    let reportId: string | undefined;
    if (user) {
      try {
        const { data, error } = await supabase
          .from("reports")
          .insert({
            user_id: user.id,
            title: "Learning Needs Navigator Report",
            problem_summary: `Primary recommended theory: ${results.primaryRecommendedTheory}`,
            metrics: results.metrics as any,
            results: results as any,
          })
          .select("id")
          .single();
        if (error) throw error;
        reportId = data?.id;
      } catch (err) {
        if (import.meta.env.DEV) console.error("Failed to save report:", err);
        toast({
          title: "Could not save report",
          description: "Showing your recommendations, but saving failed.",
          variant: "destructive",
        });
      }
    }

    navigate(reportId ? `/results?id=${reportId}` : "/results", { state: { results } });
  };

  const allSegmentsCompleted = completedSegments.length === segments.length;
  const canViewResults = allSegmentsCompleted;

  const activeSegment = segments.find((s) => s.id === activeSegmentId);

  const segmentIcons: Record<string, typeof Briefcase> = {
    "performance-challenge": ClipboardList,
    "business-analysis": Briefcase,
    "skill-gap-assessment": Target,
    "root-cause-analysis": Search,
    "workforce-readiness": Users,
    "intervention-strategy": Wrench,
  };

  const getSegmentProgress = (segmentId: string) => {
    const segment = segments.find((s) => s.id === segmentId);
    if (!segment) return 0;

    // Filter out conditional questions whose dependency isn't met yet
    const visibleQuestions = segment.questions.filter((q) => {
      if (!q.conditional) return true;
      const dep = responses.find((r) => r.questionId === q.conditional!.dependsOn);
      if (!dep) return false;
      const threshold = q.conditional.showWhenValueGte ?? 1;
      return (dep.value ?? 0) >= threshold;
    });
    if (visibleQuestions.length === 0) return 0;

    const segmentQuestionIds = visibleQuestions.map((q) => q.id);
    const answeredCount = responses.filter((r) => {
      // For multiple choice questions
      if (r.selectedOptionId) {
        return segmentQuestionIds.includes(r.questionId);
      }
      // For text input questions
      return segmentQuestionIds.includes(r.questionId) && r.customText && r.customText.trim() !== "";
    }).length;

    return Math.round((answeredCount / segmentQuestionIds.length) * 100);
  };

  if (activeSegment) {
    return (
      <PageLayout>
        <SegmentAssessment
          segment={activeSegment}
          responses={responses}
          onResponseChange={handleResponseChange}
          onComplete={handleSegmentComplete}
          onBack={handleBack}
        />
      </PageLayout>
    );
  }

  const overallPercent = Math.round((completedSegments.length / segments.length) * 100);
  const segmentTooltips: Record<string, { why: string; what: string }> = {
    "performance-challenge": {
      why: "Define the problem, desired employee capability, and expected business outcome.",
      what: "Problem statement, learning objective (enabling goal), and business outcome (terminal goal).",
    },
    "business-analysis": {
      why: "Assess business impact, KPIs, risks, and success criteria.",
      what: "KPI impact, baseline vs target, business risk, timeline, and how success is reported.",
    },
    "skill-gap-assessment": {
      why: "Identify current performance levels and required capability improvements.",
      what: "Observable behaviours, workflow breakdowns, and capability evidence.",
    },
    "root-cause-analysis": {
      why: "Determine the underlying causes of the performance issue.",
      what: "Root drivers across skill, motivation, environment, and systems.",
    },
    "workforce-readiness": {
      why: "Assess workforce characteristics and implementation readiness.",
      what: "Audience profile, change readiness, and stakeholder alignment.",
    },
    "intervention-strategy": {
      why: "Identify the most effective mix of training and non-training solutions.",
      what: "Solution mix, performance support, and stakeholder reporting cadence.",
    },
  };
  const journeySteps = [
    ...segments.map((s) => ({
      id: s.id,
      label: s.title.replace(" Analysis", "").replace(" Assessment", "").replace(" Interview", ""),
      fullTitle: s.title,
      completed: completedSegments.includes(s.id),
      inProgress: getSegmentProgress(s.id) > 0 && !completedSegments.includes(s.id),
      progress: getSegmentProgress(s.id),
      tooltip: segmentTooltips[s.id],
    })),
    {
      id: "results",
      label: "Results",
      fullTitle: "Recommendations & Results",
      completed: false,
      inProgress: canViewResults,
      progress: canViewResults ? 100 : 0,
      tooltip: {
        why: "View your tailored recommendations once all segments are completed.",
        what: "Maturity score, root-cause heatmap, and intervention plan.",
      },
    },
  ];


  return (
    <PageLayout key={`assessment-page-${forceUpdate}`}>
      <div className="mx-auto w-full max-w-6xl px-2 sm:px-4 py-8 sm:py-12 space-y-14">
        {/* Header */}
        <section className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-12 -z-10 mx-auto h-48 max-w-2xl rounded-full bg-gradient-to-br from-primary/15 via-secondary/10 to-transparent blur-3xl"
          />
          <div className="space-y-5 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI-guided assessment
            </span>
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground leading-[1.1]">
              Learning Needs{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Navigator
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Complete each segment to receive personalised training design recommendations grounded in established
              learning theories. Progress is saved as you go.
            </p>
          </div>
        </section>

        {/* Guided Journey */}
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Your assessment journey</h2>
              <p className="text-sm text-muted-foreground/85">
                Click any step to start, resume, or revisit. Hover for details.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 sm:p-7">
            <div className="relative">
              {/* Connector line (desktop only) */}
              <div className="hidden md:block absolute left-0 right-0 top-5 h-px bg-border/70" aria-hidden />
              <div
                className="hidden md:block absolute left-0 top-5 h-px bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{
                  width: `${(journeySteps.filter((s) => s.completed).length / (journeySteps.length - 1)) * 100}%`,
                }}
                aria-hidden
              />
              <TooltipProvider delayDuration={120}>
                <ol
                  className="relative flex flex-col gap-3 md:grid md:gap-2"
                  style={{ gridTemplateColumns: `repeat(${journeySteps.length}, minmax(0, 1fr))` }}
                >
                  {journeySteps.map((step, idx) => {
                    const isResults = step.id === "results";
                    const active = step.completed || step.inProgress;
                    const disabled = isResults && !canViewResults;
                    const isStartHere = idx === 0 && !step.completed && !step.inProgress;
                    const onActivate = () => {
                      if (isResults) {
                        if (canViewResults) handleViewResults();
                      } else {
                        handleSegmentClick(step.id);
                      }
                    };
                    return (
                      <li key={step.id} className="flex md:flex-col md:items-center md:text-center">
                        {isStartHere && (
                          <div className="hidden md:flex mb-2 flex-col items-center animate-bounce">
                            <span className="rounded-full bg-gradient-to-r from-primary to-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm shadow-primary/30">
                              Start here
                            </span>
                          </div>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={onActivate}
                              disabled={disabled}
                              aria-label={`${step.fullTitle}${step.completed ? " (completed)" : step.inProgress ? " (in progress)" : ""}`}
                              className={cn(
                                "group w-full flex flex-row items-center gap-3 md:flex-col md:items-center md:gap-0 md:w-auto rounded-lg p-3 md:px-1 md:py-1 md:bg-transparent bg-background border md:border-0 border-border/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all text-left md:text-center",
                                disabled
                                  ? "cursor-not-allowed opacity-60"
                                  : "cursor-pointer md:hover:-translate-y-0.5 md:hover:scale-[1.02] hover:border-primary/40",
                              )}
                            >
                              <div
                                className={cn(
                                  "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background text-xs font-semibold transition-all",
                                  step.completed
                                    ? "border-primary bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-md shadow-primary/20"
                                    : step.inProgress
                                      ? "border-primary text-primary ring-4 ring-primary/10"
                                      : isStartHere
                                        ? "border-primary text-primary ring-4 ring-primary/20 animate-pulse shadow-md shadow-primary/30"
                                        : "border-border text-muted-foreground/70 group-hover:border-primary/50 group-hover:text-foreground",
                                )}
                              >
                                {step.completed ? (
                                  <Check className="h-4 w-4" />
                                ) : isResults ? (
                                  <BarChart3 className="h-4 w-4" />
                                ) : (
                                  idx + 1
                                )}
                              </div>
                              <div className="flex-1 min-w-0 md:contents">
                              <span
                                className={cn(
                                  "block md:mt-3 text-sm md:text-xs font-medium leading-tight md:text-center",
                                  active || isStartHere
                                    ? "text-foreground"
                                    : "text-muted-foreground/75 group-hover:text-foreground",
                                )}
                              >
                                <span className="md:hidden">{idx + 1}. {step.fullTitle}</span>
                                <span className="hidden md:inline">{step.label}</span>
                              </span>
                              {!isResults && step.progress > 0 && !step.completed && (
                                <span className="block md:mt-1 text-[11px] md:text-[10px] text-primary/80">{step.progress}%</span>
                              )}
                              {isStartHere && (
                                <span className="md:hidden inline-block mt-1 rounded-full bg-gradient-to-r from-primary to-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                                  Start here
                                </span>
                              )}
                              </div>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-[240px] text-left">
                            <p className="font-semibold text-xs mb-1">{step.fullTitle}</p>
                            <p className="text-xs leading-relaxed text-muted-foreground">{step.tooltip.why}</p>
                            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground/80">
                              <span className="font-medium text-foreground/80">You'll provide:</span>{" "}
                              {step.tooltip.what}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    );
                  })}
                </ol>
              </TooltipProvider>
            </div>

            {/* Progress summary */}
            <div className="mt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border/50 pt-5">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-semibold tracking-tight text-foreground">{overallPercent}%</div>
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-foreground">Overall progress</div>
                  <div className="text-xs text-muted-foreground/85">
                    {completedSegments.length} of {segments.length} segments completed
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-64">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className={cn(
            "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border backdrop-blur-sm p-6 sm:p-7 transition-all duration-500",
            allSegmentsCompleted
              ? "border-primary/30 bg-gradient-to-br from-primary/[0.06] via-secondary/[0.04] to-transparent shadow-md shadow-primary/10"
              : "border-border/60 bg-card/60",
          )}
        >
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight">
              {allSegmentsCompleted ? "You're ready for your recommendations" : "Ready for your recommendations?"}
            </h3>
            <p className="text-sm text-muted-foreground/85">
              {allSegmentsCompleted
                ? "View tailored learning design guidance based on your responses."
                : `Complete all assessment segments to unlock recommendations (${completedSegments.length}/${segments.length} done).`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleViewResults}
              disabled={!canViewResults}
              size="lg"
              aria-disabled={!canViewResults}
              className={cn(
                "gap-2 h-11 px-6 transition-all duration-500 bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#EAB308] text-slate-900 shadow-[0_10px_30px_rgba(245,158,11,0.35)]",
                canViewResults && "hover:-translate-y-0.5 hover:brightness-105",
                !canViewResults && "opacity-60 cursor-not-allowed",
              )}
            >
              View Recommendations
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default Assessment;
