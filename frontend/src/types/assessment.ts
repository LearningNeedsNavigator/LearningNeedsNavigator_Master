
export type LearningTheory = 
  | "Behaviorism" 
  | "Cognitivism" 
  | "Constructivism" 
  | "Social Learning" 
  | "Experiential Learning"
  | "Adult Learning";

export type QuestionType = "multipleChoice" | "textInput" | "multipleAnswer" | "shortText";

export type AssessmentSegment = {
  id: string;
  title: string;
  description: string;
  /** Weight (0-1) for the Performance Consulting Effectiveness Score. Should sum to 1.0 across segments. */
  weight?: number;
  /** Purpose statement shown in the consulting dashboard */
  purpose?: string;
  questions: Question[];
};

export type Question = {
  id: string;
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  segmentId: string;
  theoryAlignment: Record<LearningTheory, number>; // Weighted alignment with theories
  /** Optional inline help shown as an info tooltip next to the question */
  helpText?: string;
  /** Helper text rendered directly under the question (short-text questions) */
  helperText?: string;
  /** Example answers rendered under the input */
  examples?: string[];
  /** Placeholder for short-text inputs */
  placeholder?: string;
  /** Marks the field as required (short-text questions) */
  required?: boolean;
  /** Validation message shown when a required field is empty */
  validationMessage?: string;
  /** Hide the generic "Other" option on choice questions */
  allowOther?: boolean;
  /**
   * Informational capture field — excluded from all scoring so existing
   * segment/theory scores stay unchanged when new inputs are added.
   */
  excludeFromScoring?: boolean;
  /** Optional conditional: only show this question when the referenced response meets the threshold */
  conditional?: {
    dependsOn: string;
    showWhenValueGte?: number;
  };
};

export type QuestionOption = {
  id: string;
  text: string;
  value: number; // A value from 1-5 typically
};

export type SegmentResult = {
  segmentId: string;
  score: number;
  maxPossibleScore: number;
  percentage: number;
  /** Normalized 1.0–5.0 score for this segment */
  normalizedScore?: number;
  /** Weight applied to this segment in the overall consulting score */
  weight?: number;
  recommendedTheories: LearningTheory[];
};

export type AssessmentResult = {
  segmentResults: SegmentResult[];
  overallScore: number;
  maxPossibleScore: number;
  overallPercentage: number;
  primaryRecommendedTheory: LearningTheory;
  secondaryRecommendedTheories: LearningTheory[];
  metrics: {
    theory: LearningTheory;
    score: number;
    percentage: number;
  }[];
  /** Performance Consulting Effectiveness Score (1.0–5.0) */
  consultingScore?: number;
  /** Human-readable maturity tier */
  maturityLevel?: MaturityLevel;
  /** Training vs non-training diagnosis based on Root Cause segment */
  trainingDiagnosis?: TrainingDiagnosis;
  /** Risk severity derived from Performance Impact segment */
  riskSeverity?: "Low" | "Moderate" | "High" | "Critical";
  /** AI-generated implementation strategy (training + non-training) */
  implementationStrategy?: ImplementationStrategy;
  /** Executive summary for stakeholders (problem, impact, root causes) */
  executiveSummary?: ExecutiveSummary;
  /** Business measurement values captured directly from the user (informational only, never scored) */
  businessMeasurement?: {
    primaryKpi: string;
    baseline: string;
    target: string;
    owner: string;
    targetTimeframe: string;
  };
};

export type MaturityLevel = {
  label: string;
  range: [number, number];
  description: string;
};

export type TrainingDiagnosis = {
  /** % of the problem solvable by training (0-100) */
  trainingShare: number;
  /** % attributable to non-training root causes (0-100) */
  nonTrainingShare: number;
  verdict:
    | "Training is fully required"
    | "Training is partially required"
    | "Training is not the primary solution";
  rationale: string;
};

export type ImplementationStrategy = {
  headline: string;
  summary: string;
  trainingSolutions: string[];
  nonTrainingSolutions: string[];
  caveats: string[];
};

export type ExecutiveSummary = {
  businessProblem: string;
  impactLevel: "High" | "Medium" | "Low";
  impactExplanation: string;
  rootCauses: { label: string; explanation: string }[];
};

export type UserResponse = {
  questionId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[]; // For multiple answer questions
  value: number;
  customText?: string; // Used for "Other" option text input or for text input questions
};

export type LearningTheoryDescription = {
  theory: LearningTheory;
  description: string;
  characteristics: string[];
  designApproaches?: string[];
  metrics: string[];
  bestPractices?: string[]; // Made optional to match data structure
  whenToUse?: string[]; // Made optional to match data structure
};

export type IDModel = {
  name: string;
  description: string;
  characteristics: string[];
  whenToUse: string[];
  implementationSteps: string[];
  alignedTheories: LearningTheory[];
  alignmentScore: number;
};
