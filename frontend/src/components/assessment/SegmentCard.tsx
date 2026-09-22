
import React from "react";
import { AssessmentSegment } from "@/types/assessment";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Clock, FileText, LucideIcon } from "lucide-react";

type SegmentCardProps = {
  segment: AssessmentSegment;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
  progress: number;
  icon?: LucideIcon;
};

const SegmentCard = ({ segment, isActive, isCompleted, onClick, progress, icon: Icon }: SegmentCardProps) => {
  const questionCount = segment.questions.length;
  const estimatedMinutes = Math.max(2, Math.round(questionCount * 0.75));
  const status = isCompleted ? "completed" : progress > 0 ? "in_progress" : "not_started";
  const statusConfig = {
    completed: { label: "Completed", className: "bg-primary/10 text-primary" },
    in_progress: { label: "In Progress", className: "bg-secondary/15 text-secondary-foreground/80" },
    not_started: { label: "Not Started", className: "bg-muted text-muted-foreground" },
  }[status];

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-card/60 backdrop-blur-sm p-6 transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30",
        isActive ? "border-primary/50 shadow-md shadow-primary/10" : "border-border/60",
        isCompleted && "bg-primary/[0.03]"
      )}
    >
      <div className="flex items-start justify-between mb-5">
        {Icon && (
          <div className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
            "bg-gradient-to-br from-primary/10 to-secondary/10 text-primary",
            "group-hover:from-primary/15 group-hover:to-secondary/15"
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
          statusConfig.className
        )}>
          {isCompleted && <CheckCircle2 className="h-3 w-3" />}
          {statusConfig.label}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-foreground tracking-tight">
        {segment.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground/85 line-clamp-2">
        {segment.description}
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground/80">
        <span className="inline-flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          {questionCount} questions
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          ~{estimatedMinutes} min
        </span>
      </div>

      <div className="mt-6 space-y-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground/80">
            {progress === 100 ? "Completed" : progress > 0 ? `${progress}% complete` : "Not started"}
          </span>
        </div>
      </div>

      <Button
        onClick={onClick}
        variant={isCompleted ? "outline" : "default"}
        size="sm"
        className="mt-6 w-full justify-center gap-1.5 group/btn transition-all hover:shadow-md hover:shadow-primary/15"
      >
        {isCompleted ? "Review" : isActive || progress > 0 ? "Continue" : "Start"}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
      </Button>
    </div>
  );
};

export default SegmentCard;
