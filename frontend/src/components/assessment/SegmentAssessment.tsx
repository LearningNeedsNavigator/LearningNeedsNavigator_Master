
import React, { useState, useEffect } from "react";
import { AssessmentSegment, UserResponse } from "@/types/assessment";
import AssessmentQuestion from "./AssessmentQuestion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

type SegmentAssessmentProps = {
  segment: AssessmentSegment;
  responses: UserResponse[];
  onResponseChange: (response: UserResponse) => void;
  onComplete: () => void;
  onBack: () => void;
};

const SegmentAssessment = ({
  segment,
  responses,
  onResponseChange,
  onComplete,
  onBack
}: SegmentAssessmentProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Filter out conditional questions whose dependency isn't met
  const visibleQuestions = segment.questions.filter(q => {
    if (!q.conditional) return true;
    const dep = responses.find(r => r.questionId === q.conditional!.dependsOn);
    if (!dep) return false;
    const threshold = q.conditional.showWhenValueGte ?? 1;
    return (dep.value ?? 0) >= threshold;
  });

  const safeIndex = Math.min(currentQuestionIndex, Math.max(0, visibleQuestions.length - 1));
  const currentQuestion = visibleQuestions[safeIndex];
  
  // Reset to first question when segment changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [segment.id]);
  
  if (!currentQuestion) return null;
  const currentResponse = responses.find(r => r.questionId === currentQuestion.id);
  
  const isFirstQuestion = safeIndex === 0;
  const isLastQuestion = safeIndex === visibleQuestions.length - 1;
  
  const handleNext = () => {
    if (isLastQuestion) {
      onComplete();
    } else {
      setCurrentQuestionIndex(safeIndex + 1);
    }
  };
  
  const handleBack = () => {
    if (isFirstQuestion) {
      onBack();
    } else {
      setCurrentQuestionIndex(safeIndex - 1);
    }
  };
  
  // Check if question is answered
  const canContinue = (() => {
    if (!currentResponse) return false;
    
    // For text input questions, we need some text
    if (currentQuestion.type === "textInput" || currentQuestion.type === "shortText") {
      return !!(currentResponse.customText && currentResponse.customText.trim());
    }
    
    // For multiple answer questions, need at least one option selected
    if (currentQuestion.type === "multipleAnswer") {
      return !!(currentResponse.selectedOptionIds && currentResponse.selectedOptionIds.length > 0);
    }
    
    // For multiple choice, need a selected option
    return !!currentResponse.selectedOptionId;
  })();

  const validationHint = !canContinue
    ? currentQuestion.validationMessage ||
      (currentQuestion.type === "multipleChoice" ? "Please select an option to continue." : undefined)
    : undefined;
  
  const progress = Math.round(((safeIndex + 1) / visibleQuestions.length) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{segment.title}</CardTitle>
          <CardDescription>{segment.description}</CardDescription>
          <div className="w-full h-2 bg-secondary rounded-full mt-2">
            <div 
              className="h-2 bg-primary rounded-full transition-all" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Question {safeIndex + 1} of {visibleQuestions.length}
          </p>
        </CardHeader>
      </Card>

      <AssessmentQuestion
        question={currentQuestion}
        response={currentResponse}
        onResponseChange={onResponseChange}
      />

      <div className="flex justify-between">
        <Button 
          onClick={handleBack} 
          variant="outline"
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          {isFirstQuestion ? "Back to Overview" : "Previous"}
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!canContinue}
          className="flex items-center gap-1"
        >
          {isLastQuestion ? (
            <>
              <span>Complete Segment</span>
              <CheckCircle className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {validationHint && currentQuestion.required && (
        <p className="text-right text-sm text-muted-foreground" role="status">
          {validationHint}
        </p>
      )}
    </div>
  );
};

export default SegmentAssessment;
