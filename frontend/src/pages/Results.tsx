import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import TheoryRecommendation from "@/components/assessment/TheoryRecommendation";
import ResultsChart from "@/components/assessment/ResultsChart";
import InstructionalDesignModel from "@/components/assessment/InstructionalDesignModel";
import { Info, ArrowRight, GraduationCap, Wrench, AlertTriangle, AlertCircle, Lightbulb, MessageSquare, FileText, Download, ExternalLink, Target, Search, ClipboardCheck, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AssessmentResult } from "@/types/assessment";
import {
  getTheoryDescription,
  getSegmentById,
  getRecommendedIDModels,
  calculateConsultingScore,
  getMaturityLevel,
  getTrainingDiagnosis,
  getRiskSeverity,
  generateImplementationStrategy,
  buildExecutiveSummary,
} from "@/utils/assessmentUtils";
import {
  getBusinessRecommendation,
  getDesignConsiderations,
} from "@/utils/businessTranslation";
import { buildSection5Plan } from "@/utils/measurementPlan";
import { useAnalytics } from "@/hooks/useAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const InfoHint = ({ text }: { text: string }) => (
  <TooltipProvider delayDuration={150}>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="What does this mean?"
          className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-primary"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Color palette for charts
const THEORY_COLORS = {
  Behaviorism: "#2563eb",
  Cognitivism: "#7c3aed",
  Constructivism: "#db2777",
  "Social Learning": "#ea580c",
  "Experiential Learning": "#16a34a",
  "Adult Learning": "#0891b2",
};

const NOT_PROVIDED_BM = "Not provided — confirm with the business";



const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { trackButtonClick, trackEvent } = useAnalytics();
  const [results, setResults] = useState<AssessmentResult | null>(
    (location.state?.results as AssessmentResult) ?? null,
  );
  const [loadingReport, setLoadingReport] = useState(!location.state?.results);
  const [tabValue, setTabValue] = useState<string>("overview");
  const [exporting, setExporting] = useState(false);
  const commonRef = useRef<HTMLDivElement>(null);
  const tabsContentRef = useRef<HTMLDivElement>(null);

  // Load persisted report when we don't have it in navigation state
  useEffect(() => {
    if (results || authLoading) return;
    if (!user) {
      setLoadingReport(false);
      return;
    }
    const reportId = searchParams.get("id");
    let cancelled = false;
    (async () => {
      try {
        let query = supabase.from("reports").select("results").eq("user_id", user.id);
        const { data, error } = reportId
          ? await query.eq("id", reportId).maybeSingle()
          : await query.order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (error) throw error;
        if (!cancelled && data?.results) {
          setResults(data.results as unknown as AssessmentResult);
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error("Failed to load report:", err);
      } finally {
        if (!cancelled) setLoadingReport(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [results, user, authLoading, searchParams]);

  useEffect(() => {
    if (results) {
      // Track results view
      trackEvent("results_viewed", {
        overall_percentage: results.overallPercentage,
        primary_theory: results.primaryRecommendedTheory,
        segments_completed: results.segmentResults.length,
      });
    }
  }, [results, trackEvent]);

  if (loadingReport || authLoading) {
    return (
      <PageLayout>
        <div className="max-w-6xl mx-auto py-20 text-center text-muted-foreground">Loading your recommendations…</div>
      </PageLayout>
    );
  }

  if (!results) {
    navigate("/assessment");
    return null;
  }

  const primaryTheory = results.primaryRecommendedTheory;
  const primaryTheoryDescription = getTheoryDescription(primaryTheory);

  if (!primaryTheoryDescription) {
    return <div>Error: Theory description not found</div>;
  }

  const handleStartNew = async () => {
    await trackButtonClick("start_new_assessment", "results_page");
    navigate("/");
  };

  const handleDownloadPdf = async () => {
    await trackButtonClick("download_pdf_report", "results_page");
    if (exporting) return;
    setExporting(true);
    const previousTab = tabValue;
    try {
      const [{ default: jsPDF }, html2canvasModule] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const html2canvas = html2canvasModule.default;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const marginX = 15;
      const marginTop = 18;
      const marginBottom = 15;
      const contentW = pageW - marginX * 2;
      let y = marginTop;

      const displayName =
        (user?.user_metadata as any)?.display_name ||
        (user?.user_metadata as any)?.full_name ||
        user?.email ||
        "—";

      const ensureSpace = (needed: number) => {
        if (y + needed > pageH - marginBottom) {
          pdf.addPage();
          y = marginTop;
        }
      };

      const writeHeading = (text: string, size = 14, color: [number, number, number] = [13, 148, 136]) => {
        ensureSpace(size * 0.6 + 4);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(size);
        pdf.setTextColor(...color);
        pdf.text(text, marginX, y);
        y += size * 0.45 + 2;
        pdf.setTextColor(40);
      };

      const writeParagraph = (text: string, size = 10, color: [number, number, number] = [55, 65, 81]) => {
        if (!text) return;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(size);
        pdf.setTextColor(...color);
        const lines = pdf.splitTextToSize(text, contentW) as string[];
        const lineH = size * 0.42;
        for (const line of lines) {
          ensureSpace(lineH + 1);
          pdf.text(line, marginX, y);
          y += lineH;
        }
        y += 1.5;
      };

      const writeBullets = (items: string[], size = 10) => {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(size);
        pdf.setTextColor(55, 65, 81);
        const lineH = size * 0.42;
        for (const it of items) {
          const lines = pdf.splitTextToSize(it, contentW - 5) as string[];
          ensureSpace(lineH * lines.length + 1);
          lines.forEach((line, idx) => {
            pdf.text(idx === 0 ? `\u2022  ${line}` : `   ${line}`, marginX, y);
            y += lineH;
          });
        }
        y += 1.5;
      };

      const writeKeyValue = (key: string, value: string) => {
        const lineH = 5;
        ensureSpace(lineH);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(30);
        pdf.text(`${key}:`, marginX, y);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(55, 65, 81);
        const keyW = pdf.getTextWidth(`${key}: `);
        const lines = pdf.splitTextToSize(value, contentW - keyW) as string[];
        pdf.text(lines[0] || "", marginX + keyW, y);
        y += lineH;
        for (let i = 1; i < lines.length; i++) {
          ensureSpace(lineH);
          pdf.text(lines[i], marginX + keyW, y);
          y += lineH;
        }
      };

      const sectionGap = (n = 3) => {
        y += n;
      };

      const startNewPage = () => {
        pdf.addPage();
        y = marginTop;
      };

      // ============ PAGE 1 ============
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.setTextColor(13, 148, 136);
      pdf.text("Learning Needs Navigator", marginX, y);
      y += 8;
      pdf.setFontSize(12);
      pdf.setTextColor(80);
      pdf.setFont("helvetica", "normal");
      pdf.text("Assessment Report", marginX, y);
      y += 8;

      writeKeyValue("Prepared for", displayName);
      if (user?.email) writeKeyValue("Email", user.email);
      writeKeyValue("Date Generated", new Date().toLocaleString());
      writeKeyValue(
        "Overall Score",
        `${results.overallPercentage.toFixed(1)}% (${results.overallScore}/${results.maxPossibleScore})`,
      );
      sectionGap(4);

      writeHeading("Business Impact & Success Measurement", 13);
      writeKeyValue("Primary KPI", results.businessMeasurement?.primaryKpi?.trim() || NOT_PROVIDED_BM);
      writeKeyValue("Current baseline", results.businessMeasurement?.baseline?.trim() || NOT_PROVIDED_BM);
      writeKeyValue("Desired target", results.businessMeasurement?.target?.trim() || NOT_PROVIDED_BM);
      writeKeyValue("KPI owner", results.businessMeasurement?.owner?.trim() || NOT_PROVIDED_BM);
      writeKeyValue("Target timeframe", results.businessMeasurement?.targetTimeframe?.trim() || NOT_PROVIDED_BM);
      sectionGap(4);

      writeHeading("Executive Summary");
      writeParagraph(
        `Impact level: ${executiveSummary.impactLevel}. ${trainingDiagnosis.verdict} — approximately ${trainingDiagnosis.trainingShare}% of the solution is learning-related and ${trainingDiagnosis.nonTrainingShare}% is non-training / operational.`,
      );
      sectionGap();

      writeHeading("Problem Statement", 13);
      writeParagraph(executiveSummary.businessProblem);
      sectionGap();

      writeHeading("Business Impact", 13);
      writeParagraph(`Level: ${executiveSummary.impactLevel}`);
      writeParagraph(executiveSummary.impactExplanation);
      sectionGap();

      writeHeading("Root Cause Diagnosis", 13);
      writeBullets(
        executiveSummary.rootCauses.map((c) => `${c.label} — ${c.explanation}`),
      );

      // ============ PAGE 2 ============
      startNewPage();
      writeHeading("Recommended Performance & Learning Solution");
      writeParagraph(implementationStrategy.headline, 11, [30, 30, 30]);
      writeParagraph(implementationStrategy.summary);
      sectionGap();

      writeHeading("Training / Learning Needs", 12);
      writeBullets(implementationStrategy.trainingSolutions);

      writeHeading("Non-Training Needs", 12);
      writeBullets(implementationStrategy.nonTrainingSolutions);

      if (implementationStrategy.caveats.length) {
        writeHeading("What to address first", 12, [180, 83, 9]);
        writeBullets(implementationStrategy.caveats);
      }

      // ============ PAGE 3 ============
      startNewPage();
      writeHeading("Implementation & Impact Measurement");
      const plan5 = buildSection5Plan(results, trainingDiagnosis, riskSeverity, implementationStrategy);
      plan5.roadmap.forEach((p) => {
        writeHeading(p.phase, 12);
        writeBullets(p.items);
      });
      sectionGap();

      writeHeading("Evaluation Strategy", 13);
      writeBullets(
        plan5.evaluation.map(
          (e) => `${e.area}${e.included ? ` (${e.evidenceStrength})` : " (not recommended here)"} — ${e.question} ${e.rationale}`,
        ),
      );
      sectionGap();

      writeHeading("Recommended Measurement Timeline", 13);
      writeKeyValue("Recommended timing", plan5.timeline.headline);
      writeParagraph(`Reason: ${plan5.timeline.reason}`);
      writeBullets(plan5.timeline.checkpoints.map((c) => `${c.label} — ${c.focus}`));
      sectionGap();

      writeHeading("Measurement Plan", 13);
      writeBullets(
        plan5.plan.map(
          (r) =>
            `${r.area}: ${r.whatWillBeMeasured} | Measure: ${r.measure} | Baseline: ${r.baseline} | Target: ${r.target} | Data source: ${r.dataSource} | Timing: ${r.timing} | Owner: ${r.owner}`,
        ),
      );
      sectionGap();

      writeHeading("Expected Business Impact", 13);
      writeParagraph(plan5.impactSummary);

      // ============ Footers ============
      const total = pdf.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        pdf.setPage(i);
        pdf.setDrawColor(220);
        pdf.line(marginX, pageH - 10, pageW - marginX, pageH - 10);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(130);
        pdf.text("Learning Needs Navigator", marginX, pageH - 5);
        pdf.text(`Page ${i} of ${total}`, pageW - marginX, pageH - 5, { align: "right" });
      }

      pdf.save(`LNN-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF export failed", err);
    } finally {
      if (tabValue !== previousTab) setTabValue(previousTab);
      setExporting(false);
    }
  };

  const handleTabChange = async (value: string) => {
    setTabValue(value);
    await trackEvent("tab_changed", { tab: value, page: "results" });
  };

  // Prepare chart data
  const theoryChartData = results.metrics.map((metric) => ({
    name: metric.theory,
    value: metric.percentage,
    color: THEORY_COLORS[metric.theory] || "#94a3b8",
  }));

  const segmentChartData = results.segmentResults.map((segment) => {
    const segmentInfo = getSegmentById(segment.segmentId);
    return {
      name: segmentInfo?.title || segment.segmentId,
      value: segment.percentage,
      color: `hsl(${220 + results.segmentResults.indexOf(segment) * 30}, 70%, 50%)`,
    };
  });

  // Get recommended ID models based on the assessment results
  const recommendedModels = getRecommendedIDModels(results);

  // ===== Performance Consulting derived values (with fallbacks for legacy reports) =====
  const trainingDiagnosis = results.trainingDiagnosis ?? getTrainingDiagnosis(results.segmentResults, []);
  const riskSeverity = results.riskSeverity ?? getRiskSeverity(results.segmentResults);
  const implementationStrategy =
    results.implementationStrategy ?? generateImplementationStrategy(results.segmentResults, [], trainingDiagnosis);
  const executiveSummary = results.executiveSummary ?? buildExecutiveSummary(results.segmentResults, [], riskSeverity);

  const impactStyles = {
    High: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
    Medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    Low: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  }[executiveSummary.impactLevel];

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 px-1 sm:px-0">
        <div ref={commonRef} className="space-y-6 sm:space-y-8">
        {(() => {
          const rec = getBusinessRecommendation(primaryTheory);
          
          const bm = {
            primaryKpi: results.businessMeasurement?.primaryKpi?.trim() || NOT_PROVIDED_BM,
            baseline: results.businessMeasurement?.baseline?.trim() || NOT_PROVIDED_BM,
            target: results.businessMeasurement?.target?.trim() || NOT_PROVIDED_BM,
            owner: results.businessMeasurement?.owner?.trim() || NOT_PROVIDED_BM,
            targetTimeframe: results.businessMeasurement?.targetTimeframe?.trim() || NOT_PROVIDED_BM,
          };
          const primaryCause = executiveSummary.rootCauses[0];
          const contributingCauses = executiveSummary.rootCauses.slice(1);
          const trainingLed = trainingDiagnosis.trainingShare >= trainingDiagnosis.nonTrainingShare;
          const section5 = buildSection5Plan(results, trainingDiagnosis, riskSeverity, implementationStrategy);
          return (
            <>
              {/* ============ HEADER + IN-PAGE NAV ============ */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 print:hidden">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Performance Diagnosis & Action Plan</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    A business-facing view of the problem, root cause, and recommended solution.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleDownloadPdf}
                    disabled={exporting}
                    variant="outline"
                    className="gap-2 border-[#0D9488] text-[#0D9488] hover:bg-[#0D9488] hover:text-white whitespace-nowrap"
                  >
                    <Download className="h-4 w-4" />
                    {exporting ? "Generating PDF…" : "Download PDF"}
                  </Button>
                  <Button onClick={handleStartNew} variant="outline" className="whitespace-nowrap">
                    Start New Assessment
                  </Button>
                </div>
              </div>

              <nav className="sticky top-16 z-10 -mx-1 overflow-x-auto rounded-lg border bg-background/95 px-2 py-2 shadow-sm backdrop-blur print:hidden">
                <ul className="flex min-w-max gap-1 text-xs sm:text-sm">
                  {[
                    { id: "executive-summary", label: "Executive Summary" },
                    { id: "root-cause", label: "Root Cause" },
                    { id: "training-question", label: "Training vs Non-Training" },
                    { id: "recommended-solution", label: "Recommended Solution" },
                    { id: "implementation", label: "Implementation & Impact Measurement" },
                  ].map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="inline-block whitespace-nowrap rounded-md px-3 py-1.5 text-muted-foreground hover:bg-primary/[0.08] hover:text-foreground"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* ============ 1. EXECUTIVE SUMMARY ============ */}
              <Card id="executive-summary" className="border-primary/20 scroll-mt-32 bg-gradient-to-br from-primary/[0.04] via-secondary/[0.03] to-transparent">
                <CardHeader>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <ClipboardCheck className="h-4 w-4" /> Section 1
                  </div>
                  <CardTitle className="text-2xl">Executive Summary</CardTitle>
                  <CardDescription>What is the problem, who is affected, and why it matters.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-xl border border-primary/20 bg-card/60 p-5">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <AlertCircle className="h-4 w-4 text-primary" />
                      Problem Statement
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">{executiveSummary.businessProblem}</p>
                  </div>

                  <div className="rounded-xl border bg-card p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Target className="h-4 w-4 text-primary" /> Performance Gap
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3 text-sm">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">Current baseline</div>
                        <div className="text-foreground/90">{bm.baseline}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">Desired target</div>
                        <div className="text-foreground/90">{bm.target}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">Primary KPI</div>
                        <div className="text-foreground/90">{bm.primaryKpi}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">KPI owner</div>
                        <div className="text-foreground/90">{bm.owner}</div>
                      </div>
                    </div>
                  </div>

                  <div className={cn("rounded-xl border p-5", impactStyles)}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <AlertTriangle className="h-4 w-4" /> Business Impact
                      </div>
                      <Badge variant="outline" className={cn("text-xs font-semibold", impactStyles)}>
                        {executiveSummary.impactLevel} Impact
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/90">{executiveSummary.impactExplanation}</p>
                  </div>

                  <div className="rounded-xl border bg-card p-5">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Clock className="h-4 w-4 text-primary" /> Required Timeframe
                    </div>
                    <p className="text-sm text-foreground/90">{bm.targetTimeframe}</p>
                  </div>

                  <div className="rounded-xl border-l-4 border-l-primary bg-primary/[0.04] p-5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Diagnosis summary</div>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      The assessment indicates a <strong>{executiveSummary.impactLevel.toLowerCase()}-impact</strong> business problem.
                      {" "}{trainingDiagnosis.verdict}: approximately {trainingDiagnosis.trainingShare}% of the solution is
                      learning-related and {trainingDiagnosis.nonTrainingShare}% requires non-training performance changes.
                      A blended intervention is recommended, prioritising the root causes identified below.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* ============ 2. ROOT CAUSE DIAGNOSIS ============ */}
              <Card id="root-cause" className="border-secondary/30 scroll-mt-32">
                <CardHeader>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary">
                    <Search className="h-4 w-4" /> Section 2
                  </div>
                  <CardTitle className="text-2xl">Root Cause Diagnosis</CardTitle>
                  <CardDescription>Why the problem is actually happening — beyond the symptoms.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {primaryCause && (
                    <div className="rounded-xl border-2 border-secondary/40 bg-secondary/[0.06] p-5">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary">
                        <Lightbulb className="h-4 w-4" /> Primary Root Cause
                      </div>
                      <div className="text-lg font-semibold text-foreground">{primaryCause.label}</div>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/90">{primaryCause.explanation}</p>
                    </div>
                  )}

                  {contributingCauses.length > 0 && (
                    <div>
                      <div className="mb-3 text-sm font-semibold text-foreground">Contributing Factors</div>
                      <ul className="grid gap-3 md:grid-cols-2">
                        {contributingCauses.map((cause, i) => (
                          <li key={i} className="rounded-lg border border-border/60 bg-card p-4">
                            <div className="text-sm font-semibold text-foreground">{cause.label}</div>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{cause.explanation}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ============ 3. IS TRAINING THE RIGHT SOLUTION? ============ */}
              <Card id="training-question" className="border-primary/20 scroll-mt-32">
                <CardHeader>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <GraduationCap className="h-4 w-4" /> Section 3
                  </div>
                  <CardTitle className="text-2xl">Is Training the Right Solution?</CardTitle>
                  <CardDescription>{trainingDiagnosis.verdict}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-xl border bg-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="text-sm font-medium text-muted-foreground">Training vs Non-Training Split</div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{trainingDiagnosis.trainingShare}%</div>
                          <div className="text-xs text-muted-foreground">Training / learning</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-secondary">{trainingDiagnosis.nonTrainingShare}%</div>
                          <div className="text-xs text-muted-foreground">Non-training / operational</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex h-4 w-full overflow-hidden rounded-full bg-muted/60">
                      <div className="h-full bg-primary transition-all duration-500" style={{ width: `${trainingDiagnosis.trainingShare}%` }} />
                      <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${trainingDiagnosis.nonTrainingShare}%` }} />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{trainingDiagnosis.rationale}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <GraduationCap className="h-4 w-4 text-primary" /> Training / Learning Needs
                      </div>
                      <ul className="space-y-2 text-sm text-foreground/90">
                        {implementationStrategy.trainingSolutions.map((s, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span className="leading-relaxed">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-secondary/30 bg-secondary/[0.05] p-5">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Wrench className="h-4 w-4 text-secondary" /> Non-Training Needs
                      </div>
                      <ul className="space-y-2 text-sm text-foreground/90">
                        {implementationStrategy.nonTrainingSolutions.map((s, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                            <span className="leading-relaxed">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5">
                    <div className="flex flex-wrap items-center justify-center gap-3 text-center">
                      <Badge variant="outline" className="bg-primary/[0.08] border-primary/30 text-foreground text-sm px-3 py-1">Training</Badge>
                      <span className="text-xl font-bold text-foreground">+</span>
                      <Badge variant="outline" className="bg-secondary/[0.08] border-secondary/30 text-foreground text-sm px-3 py-1">Non-Training</Badge>
                      <span className="text-xl font-bold text-foreground">=</span>
                      <Badge variant="outline" className="bg-amber-500/10 border-amber-500/40 text-foreground text-sm px-3 py-1 font-semibold">
                        Recommended Performance Solution
                      </Badge>
                    </div>
                    {implementationStrategy.caveats.length > 0 && (
                      <div className="mt-4 border-t border-amber-500/30 pt-3">
                        <div className="mb-2 text-sm font-semibold text-foreground">Address these first:</div>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {implementationStrategy.caveats.map((c, i) => (
                            <li key={i}>• {c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ============ 4. RECOMMENDED PERFORMANCE & LEARNING SOLUTION ============ */}
              <Card id="recommended-solution" className="border-primary/20 scroll-mt-32">
                <CardHeader>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <CheckCircle2 className="h-4 w-4" /> Section 4
                  </div>
                  <CardTitle className="text-2xl">Recommended Performance & Learning Solution</CardTitle>
                  <CardDescription>{implementationStrategy.headline}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <section className="rounded-xl border bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Overall Recommended Solution</h3>
                    <div className="text-lg font-semibold text-foreground">{rec.approach}</div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{implementationStrategy.summary}</p>
                  </section>

                  <section>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Why This Solution</h3>
                    <ul className="space-y-2 text-sm text-foreground/90">
                      {rec.whyThisApproach.map((w, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span className="leading-relaxed">{w}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Key Elements of the Learning Experience</h3>
                    <ul className="grid gap-2 sm:grid-cols-2 text-sm text-foreground/90">
                      {rec.keyElements.map((k, i) => (
                        <li key={i} className="flex gap-2 rounded-lg border bg-card p-3">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                          <span className="leading-relaxed">{k}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Recommended Learning Modalities</h3>
                    <div className="flex flex-wrap gap-2">
                      {rec.learningModalities.map((m, i) => (
                        <Badge key={i} variant="outline" className="bg-primary/[0.06] border-primary/30 text-foreground">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-xl border border-secondary/30 bg-secondary/[0.05] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-2">How It Applies at Work (Blended Approach)</h3>
                    <p className="text-sm text-foreground/90 leading-relaxed">{rec.workplaceApplication}</p>
                  </section>
                </CardContent>
              </Card>

              {/* ============ 5. IMPLEMENTATION & IMPACT MEASUREMENT ============ */}
              <Card id="implementation" className="border-primary/20 scroll-mt-32">
                <CardHeader>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <TrendingUp className="h-4 w-4" /> Section 5
                  </div>
                  <CardTitle className="text-2xl">Implementation &amp; Impact Measurement</CardTitle>
                  <CardDescription>
                    How the solution will be implemented, evaluated, and connected to measurable performance and business
                    outcomes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* PART 1 — Implementation roadmap (dynamic) */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Implementation Roadmap</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {section5.roadmap.map((p) => (
                        <div key={p.phase} className="rounded-xl border bg-card p-4">
                          <div className="text-sm font-semibold text-foreground mb-2">{p.phase}</div>
                          <ul className="space-y-1.5 text-sm text-foreground/90">
                            {p.items.map((it, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                <span className="leading-relaxed">{it}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PART 2 — Evaluation strategy */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Evaluation Strategy</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Four connected levels of evidence. They build on each other and are not interchangeable — a good
                      experience or a passed quiz is not proof that business performance improved.
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {section5.evaluation.map((e, idx) => (
                        <div
                          key={e.area}
                          className={cn(
                            "rounded-xl border p-4",
                            e.included ? "bg-card border-primary/25" : "bg-muted/30 border-dashed opacity-80",
                          )}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm font-semibold text-foreground">
                              {idx + 1}. {e.area}
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[11px]",
                                e.included
                                  ? "bg-primary/[0.08] border-primary/30 text-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {e.included ? e.evidenceStrength : "Not recommended here"}
                            </Badge>
                          </div>
                          <p className="mt-1.5 text-sm text-foreground/90 leading-relaxed">{e.question}</p>
                          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{e.rationale}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Evidence hierarchy:</span>
                      <span>Experience</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>Learning</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>Application</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="font-medium text-foreground">Business Results</span>
                    </div>
                  </div>

                  {/* PART 4 — Dynamic measurement timeline */}
                  <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-5">
                    <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Clock className="h-4 w-4 text-primary" /> Recommended Measurement Timeline
                    </div>
                    <div className="text-base font-semibold text-foreground">
                      Recommended timing: {section5.timeline.headline}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                      <span className="font-medium">Reason:</span> {section5.timeline.reason}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm">
                      {section5.timeline.checkpoints.map((c, i) => (
                        <li key={i} className="flex flex-col gap-0.5 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-medium text-foreground">{c.label}</span>
                          <span className="text-xs text-muted-foreground">{c.focus}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* PART 3 — Measurement plan */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Measurement Plan</h3>
                    <div className="overflow-x-auto rounded-xl border">
                      <table className="w-full min-w-[900px] text-sm">
                        <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2 font-medium">Evaluation Area</th>
                            <th className="px-3 py-2 font-medium">What Will Be Measured</th>
                            <th className="px-3 py-2 font-medium">Measure / KPI</th>
                            <th className="px-3 py-2 font-medium">Baseline</th>
                            <th className="px-3 py-2 font-medium">Target</th>
                            <th className="px-3 py-2 font-medium">Data Source</th>
                            <th className="px-3 py-2 font-medium">Measurement Timing</th>
                            <th className="px-3 py-2 font-medium">Owner</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {section5.plan.map((row, i) => (
                            <tr key={i} className="align-top">
                              <td className="px-3 py-3 font-medium text-foreground whitespace-nowrap">{row.area}</td>
                              <td className="px-3 py-3 text-muted-foreground">{row.whatWillBeMeasured}</td>
                              <td className="px-3 py-3 text-foreground/90">{row.measure}</td>
                              <td className="px-3 py-3 text-muted-foreground">{row.baseline}</td>
                              <td className="px-3 py-3 text-muted-foreground">{row.target}</td>
                              <td className="px-3 py-3 text-muted-foreground">{row.dataSource}</td>
                              <td className="px-3 py-3 text-muted-foreground">{row.timing}</td>
                              <td className="px-3 py-3 text-muted-foreground">{row.owner}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Baseline and target values are never assumed. Where they are shown as not provided, that data was not
                      captured in the assessment and must be confirmed with the business before implementation.
                    </p>
                  </div>

                  {/* PART 7 — Expected business impact */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Expected Business Impact</h3>
                    <p className="text-sm text-foreground/90 leading-relaxed">{section5.impactSummary}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          );
        })()}
        </div>

        <details className="group rounded-xl border bg-card">
          <summary className="flex cursor-pointer items-center justify-between gap-3 p-5 list-none">
            <div>
              <div className="text-base font-semibold text-foreground">View Design Rationale</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Optional: the instructional-design analysis behind these recommendations — learning theories, segment
                scores, and design models. For L&D and instructional design teams.
              </div>
            </div>
            <span className="shrink-0 rounded-md border px-2 py-1 text-xs text-muted-foreground group-open:hidden">
              Show details
            </span>
            <span className="shrink-0 rounded-md border px-2 py-1 text-xs text-muted-foreground hidden group-open:inline-block">
              Hide details
            </span>
          </summary>
          <div className="border-t p-4 sm:p-6">
          <Tabs value={tabValue} className="w-full" onValueChange={handleTabChange}>
          <div className="w-full overflow-x-auto -mx-1 px-1">
            <TabsList className="inline-flex w-max min-w-full md:grid md:grid-cols-4 md:w-full">
              <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="theories" className="whitespace-nowrap">Learning Theories</TabsTrigger>
              <TabsTrigger value="segments" className="whitespace-nowrap">Segment Analysis</TabsTrigger>
              <TabsTrigger value="id-models" className="whitespace-nowrap">ID Models</TabsTrigger>
            </TabsList>
          </div>
          <div ref={tabsContentRef}>
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <ResultsChart
                data={theoryChartData}
                title="Learning Theory Alignment"
                description="Distribution of learning theory alignment based on your responses"
              />

              <Card>
                <CardHeader>
                  <CardTitle>Key Recommendations</CardTitle>
                  <CardDescription>Summary of the most suitable approaches for your learning context</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">Primary Recommended Theory</h4>
                    <p className="text-lg">{results.primaryRecommendedTheory}</p>
                    <p className="text-sm text-muted-foreground">
                      {getTheoryDescription(results.primaryRecommendedTheory)?.description.split(".")[0]}.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Secondary Recommended Theories</h4>
                    <ul className="list-disc list-inside">
                      {results.secondaryRecommendedTheories.map((theory) => (
                        <li key={theory}>
                          {theory} ({results.metrics.find((m) => m.theory === theory)?.percentage.toFixed(1)}%)
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">Recommended Success Metrics</h4>
                    <ul className="list-disc list-inside">
                      {primaryTheoryDescription.metrics.slice(0, 3).map((metric, i) => (
                        <li key={i}>{metric}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <TheoryRecommendation
              theory={primaryTheory}
              description={primaryTheoryDescription}
              score={results.metrics.find((m) => m.theory === primaryTheory)?.percentage || 0}
              isPrimary={true}
            />
          </TabsContent>

          <TabsContent value="theories" className="space-y-6 mt-6">
            <div className="space-y-6">
              {results.metrics.map((metric) => {
                const theoryDesc = getTheoryDescription(metric.theory);
                if (!theoryDesc) return null;

                return (
                  <TheoryRecommendation
                    key={metric.theory}
                    theory={metric.theory}
                    description={theoryDesc}
                    score={metric.percentage}
                    isPrimary={metric.theory === primaryTheory}
                  />
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="segments" className="space-y-6 mt-6">
            <ResultsChart
              data={segmentChartData}
              title="Segment Performance"
              description="Score distribution across assessment segments"
            />

            <div className="space-y-4">
              {results.segmentResults.map((segment) => {
                const segmentInfo = getSegmentById(segment.segmentId);
                if (!segmentInfo) return null;

                return (
                  <Card key={segment.segmentId}>
                    <CardHeader>
                      <CardTitle className="break-words leading-snug">{segmentInfo.title}</CardTitle>
                      <CardDescription className="break-words">{segmentInfo.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Score: {segment.score}/{segment.maxPossibleScore}
                          </span>
                          <span className="font-medium">{segment.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full mt-1">
                          <div className="h-2 bg-primary rounded-full" style={{ width: `${segment.percentage}%` }} />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium">Recommended Theories for this Segment</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {segment.recommendedTheories.map((theory) => (
                            <div
                              key={theory}
                              className="px-3 py-1 bg-accent rounded-full text-sm"
                              style={{
                                backgroundColor: `${THEORY_COLORS[theory]}20`,
                                color: THEORY_COLORS[theory],
                              }}
                            >
                              {theory}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="id-models" className="space-y-6 mt-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Instructional Design Models</CardTitle>
                <CardDescription>
                  Based on your learning theory alignment, we recommend the following instructional design models to
                  translate your strategy into structured learning experiences.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-6">
              {recommendedModels.map((model, index) => (
                <InstructionalDesignModel key={index} model={model} isPrimary={index === 0} />
              ))}
            </div>
          </TabsContent>
          </div>
        </Tabs>
          </div>
        </details>

        {/* Feedback Section */}
        <Card className="mt-12 border border-primary/10 bg-gradient-to-br from-primary/[0.04] via-accent/[0.03] to-secondary/[0.04]">
          <CardContent className="p-6 sm:p-10 text-center">
            <div className="mx-auto max-w-2xl space-y-5">
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                Help Us Improve
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Thank you for using Learning Needs Navigator.
                Your feedback helps us improve the assessment experience, recommendation quality, and overall usability of the application.
                We would appreciate a few minutes of your time to share your observations and suggestions.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                <a
                  href="https://forms.gle/7HnVdwLTRFfRrTEFA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  Share Feedback
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <p className="text-sm text-muted-foreground/80">
                We review all feedback regularly and use it to continuously improve Learning Needs Navigator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Results;
