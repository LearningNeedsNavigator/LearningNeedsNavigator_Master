
import { 
  UserResponse, 
  AssessmentResult, 
  Question, 
  SegmentResult, 
  AssessmentSegment,
  LearningTheory,
  IDModel,
  MaturityLevel,
  TrainingDiagnosis,
  ImplementationStrategy,
  ExecutiveSummary
} from "@/types/assessment";
import { segments, learningTheoryDescriptions } from "@/data/sampleData";

// Find a question by its ID
export const findQuestion = (questionId: string): Question | undefined => {
  for (const segment of segments) {
    const question = segment.questions.find(q => q.id === questionId);
    if (question) return question;
  }
  return undefined;
};

// Calculate assessment results based on user responses
export const calculateResults = (responses: UserResponse[]): AssessmentResult => {
  // Initialize theory scores
  const theoryScores: Record<LearningTheory, { score: number; maxScore: number }> = {
    "Behaviorism": { score: 0, maxScore: 0 },
    "Cognitivism": { score: 0, maxScore: 0 },
    "Constructivism": { score: 0, maxScore: 0 },
    "Social Learning": { score: 0, maxScore: 0 },
    "Experiential Learning": { score: 0, maxScore: 0 },
    "Adult Learning": { score: 0, maxScore: 0 }
  };
  
  // Initialize segment results
  const segmentResults: Record<string, { 
    score: number; 
    maxScore: number; 
    questions: number;
    theoryScores: Record<LearningTheory, number>;
  }> = {};
  
  // Process each response
  responses.forEach(response => {
    const question = findQuestion(response.questionId);
    if (!question) return;
    // Informational capture fields never affect segment or theory scores
    if (question.excludeFromScoring) return;
    
    
    // Initialize segment result if not exists
    if (!segmentResults[question.segmentId]) {
      segmentResults[question.segmentId] = { 
        score: 0, 
        maxScore: 0, 
        questions: 0,
        theoryScores: {
          "Behaviorism": 0,
          "Cognitivism": 0,
          "Constructivism": 0,
          "Social Learning": 0,
          "Experiential Learning": 0,
          "Adult Learning": 0
        }
      };
    }
    
    // Add to segment score
    segmentResults[question.segmentId].score += response.value;
    segmentResults[question.segmentId].maxScore += 5; // Assuming max value is 5
    segmentResults[question.segmentId].questions += 1;
    
    // Calculate theory alignment scores
    Object.entries(question.theoryAlignment).forEach(([theory, weight]) => {
      const theoryKey = theory as LearningTheory;
      // Weight the response value by the theory alignment
      const weightedScore = (response.value / 5) * weight;
      theoryScores[theoryKey].score += weightedScore;
      theoryScores[theoryKey].maxScore += weight;
      
      // Add to segment theory scores
      segmentResults[question.segmentId].theoryScores[theoryKey] += weightedScore;
    });
  });
  
  // Calculate overall scores
  let overallScore = 0;
  let maxPossibleScore = 0;
  
  // Prepare segment results array
  const finalSegmentResults: SegmentResult[] = Object.entries(segmentResults).map(([segmentId, data]) => {
    overallScore += data.score;
    maxPossibleScore += data.maxScore;
    
    // Calculate primary theories for this segment
    const theoryPercentages = Object.entries(data.theoryScores)
      .map(([theory, score]) => ({
        theory: theory as LearningTheory,
        percentage: score / (data.questions * 5) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage);
    
    const topTheories = theoryPercentages
      .slice(0, 2)
      .map(t => t.theory);

    const segmentDef = segments.find(s => s.id === segmentId);
    const percentage = (data.score / data.maxScore) * 100;

    return {
      segmentId,
      score: data.score,
      maxPossibleScore: data.maxScore,
      percentage,
      normalizedScore: Math.round((percentage / 20) * 10) / 10, // 0–5 with 1 decimal
      weight: segmentDef?.weight,
      recommendedTheories: topTheories
    };
  });
  
  // Calculate theory percentages for overall result
  const theoryPercentages = Object.entries(theoryScores)
    .map(([theory, { score, maxScore }]) => ({
      theory: theory as LearningTheory,
      score,
      percentage: maxScore > 0 ? (score / maxScore) * 100 : 0
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // ----- Performance Consulting Effectiveness Score -----
  const consultingScore = calculateConsultingScore(finalSegmentResults);
  const maturityLevel = getMaturityLevel(consultingScore);
  const trainingDiagnosis = getTrainingDiagnosis(finalSegmentResults, responses);
  const riskSeverity = getRiskSeverity(finalSegmentResults);
  const implementationStrategy = generateImplementationStrategy(
    finalSegmentResults,
    responses,
    trainingDiagnosis
  );
  const executiveSummary = buildExecutiveSummary(
    finalSegmentResults,
    responses,
    riskSeverity
  );

  // ----- Captured business measurement values (informational only, never scored) -----
  const textValue = (questionId: string): string =>
    responses.find(r => r.questionId === questionId)?.customText?.trim() ?? "";
  const optionLabel = (questionId: string): string => {
    const response = responses.find(r => r.questionId === questionId);
    if (!response?.selectedOptionId) return "";
    const question = findQuestion(questionId);
    return question?.options?.find(o => o.id === response.selectedOptionId)?.text ?? "";
  };
  const businessMeasurement = {
    primaryKpi: textValue("ba-kpi"),
    baseline: textValue("ba-baseline"),
    target: textValue("ba-target"),
    owner: textValue("ba-owner"),
    targetTimeframe: optionLabel("ba-timeframe"),
  };
  const hasBusinessMeasurement = Object.values(businessMeasurement).some(v => v !== "");

  return {
    segmentResults: finalSegmentResults,
    overallScore,
    maxPossibleScore,
    overallPercentage: (overallScore / maxPossibleScore) * 100,
    primaryRecommendedTheory: theoryPercentages[0].theory,
    secondaryRecommendedTheories: theoryPercentages.slice(1, 3).map(t => t.theory),
    metrics: theoryPercentages,
    consultingScore,
    maturityLevel,
    trainingDiagnosis,
    riskSeverity,
    implementationStrategy,
    executiveSummary,
    ...(hasBusinessMeasurement ? { businessMeasurement } : {}),
  };
};

// ===== Performance Consulting Effectiveness Score =====

const MATURITY_LEVELS: MaturityLevel[] = [
  { label: "Reactive Training Request", range: [1.0, 2.0], description: "Request-driven, low diagnostic rigor." },
  { label: "Basic Learning Analysis", range: [2.01, 3.0], description: "Some analysis, weak business linkage." },
  { label: "Strong Needs Assessment", range: [3.01, 4.0], description: "Solid diagnostic with clear performance objectives." },
  { label: "Strategic Performance Consulting", range: [4.01, 4.5], description: "Performance-led, KPI-aligned, blended interventions." },
  { label: "Enterprise-Level Diagnostic Excellence", range: [4.51, 5.0], description: "Full performance consulting with measurement, transfer, and reinforcement." },
];

export const calculateConsultingScore = (results: SegmentResult[]): number => {
  let weightedSum = 0;
  let weightTotal = 0;
  results.forEach(r => {
    const w = r.weight ?? 0;
    const normalized = r.normalizedScore ?? (r.percentage / 20);
    weightedSum += normalized * w;
    weightTotal += w;
  });
  if (weightTotal === 0) return 0;
  const score = weightedSum / weightTotal;
  return Math.round(score * 10) / 10;
};

export const getMaturityLevel = (score: number): MaturityLevel => {
  return (
    MATURITY_LEVELS.find(m => score >= m.range[0] && score <= m.range[1]) ??
    MATURITY_LEVELS[0]
  );
};

/**
 * Diagnose whether the problem is training-solvable based on the Root Cause segment.
 * High root-cause scores indicate strong non-training causes.
 */
export const getTrainingDiagnosis = (
  results: SegmentResult[],
  responses: UserResponse[]
): TrainingDiagnosis => {
  const rc = results.find(r => r.segmentId === "root-cause-analysis");
  const skill = results.find(r => r.segmentId === "skill-gap-assessment");

  // Root-cause segment uses inverse scoring (higher = more non-training causes)
  const nonTrainingSignal = rc ? rc.percentage : 50;
  const trainingSignal = skill ? skill.percentage : 50;

  // Explicit cause selections from the RCA multi-select
  const rcCauses = responses.find(r => r.questionId === "rc-5");
  const selectedCauses = rcCauses?.selectedOptionIds ?? [];
  const nonTrainingCauseIds = ["rc-5-2", "rc-5-3", "rc-5-4", "rc-5-5", "rc-5-6", "rc-5-7"];
  const nonTrainingCount = selectedCauses.filter(id => nonTrainingCauseIds.includes(id)).length;
  const trainingCauseSelected = selectedCauses.includes("rc-5-1");

  // Capability check: low value (1-2) means people could already do the task → training unlikely
  const cap = responses.find(r => r.questionId === "pg-capability");
  const capabilityShift = cap ? (3 - cap.value) * 8 : 0; // -16..+16

  // Combine into a 0-100 training share
  let trainingShare = Math.round(
    100 - nonTrainingSignal * 0.55 + (trainingSignal - 50) * 0.25 - nonTrainingCount * 6 - capabilityShift
  );
  if (trainingCauseSelected && nonTrainingCount === 0) trainingShare += 10;
  trainingShare = Math.max(0, Math.min(100, trainingShare));
  const nonTrainingShare = 100 - trainingShare;

  let verdict: TrainingDiagnosis["verdict"];
  let rationale: string;
  if (trainingShare >= 65) {
    verdict = "Training is fully required";
    rationale = "Skill and knowledge gaps dominate. Non-training root causes are limited.";
  } else if (trainingShare >= 35) {
    verdict = "Training is partially required";
    rationale = "A blended approach is needed: training plus process, tooling, incentives or coaching fixes.";
  } else {
    verdict = "Training is not the primary solution";
    rationale = "Training alone will not fully solve this problem. Non-training root causes (process, tools, incentives, leadership, environment) must be addressed first.";
  }

  return { trainingShare, nonTrainingShare, verdict, rationale };
};

/** Map performance impact segment score to risk severity */
export const getRiskSeverity = (
  results: SegmentResult[]
): "Low" | "Moderate" | "High" | "Critical" => {
  const pi = results.find(r => r.segmentId === "business-analysis");
  const pct = pi?.percentage ?? 0;
  if (pct >= 80) return "Critical";
  if (pct >= 60) return "High";
  if (pct >= 40) return "Moderate";
  return "Low";
};

/**
 * Build a practical, consultative implementation strategy from the
 * assessment responses — separating training from non-training fixes.
 */
export const generateImplementationStrategy = (
  segmentResults: SegmentResult[],
  responses: UserResponse[],
  diagnosis: TrainingDiagnosis
): ImplementationStrategy => {
  const rcCauses = responses.find(r => r.questionId === "rc-5");
  const selected = new Set(rcCauses?.selectedOptionIds ?? []);
  const cap = responses.find(r => r.questionId === "pg-capability");
  const sev = responses.find(r => r.questionId === "pg-1");
  const mgr = responses.find(r => r.questionId === "wr-manager");
  const ops = responses.find(r => r.questionId === "wr-ops");
  const reporting = responses.find(r => r.questionId === "ba-report");

  const trainingSolutions: string[] = [];
  const nonTrainingSolutions: string[] = [];
  const caveats: string[] = [];

  // ---- Training-side recommendations ----
  if (diagnosis.trainingShare >= 35) {
    if ((sev?.value ?? 0) >= 4 || (cap?.value ?? 0) >= 4) {
      trainingSolutions.push(
        "Instructor-led workshops on the failing tasks, sequenced by role and risk."
      );
      trainingSolutions.push(
        "Practice labs and scenario-based simulations using real work artefacts."
      );
    } else {
      trainingSolutions.push(
        "Short scenario-based microlearning targeted at the specific behaviour gaps."
      );
    }
    trainingSolutions.push(
      "Manager-led coaching cadence to reinforce new behaviours on the job."
    );
    trainingSolutions.push(
      "Spaced reinforcement (refreshers, retrieval practice) over 6–8 weeks post-rollout."
    );
  } else {
    trainingSolutions.push(
      "Lightweight enablement only — quick reference guides and a 30-minute orientation."
    );
  }

  // ---- Non-training-side recommendations ----
  if (selected.has("rc-5-2")) {
    nonTrainingSolutions.push("Update SOPs and standardise workflows where steps are unclear or outdated.");
  }
  if (selected.has("rc-5-3")) {
    nonTrainingSolutions.push("Fix tooling gaps — UX friction, missing automations, or system limitations blocking the task.");
  }
  if (selected.has("rc-5-4")) {
    nonTrainingSolutions.push("Rebalance staffing and workload before expecting behaviour change to stick.");
  }
  if (selected.has("rc-5-5")) {
    nonTrainingSolutions.push("Realign incentives, recognition and consequences with the desired behaviour.");
  }
  if (selected.has("rc-5-6")) {
    nonTrainingSolutions.push("Manager coaching and accountability rituals — front-line leaders own behaviour transfer.");
  }
  if (selected.has("rc-5-7")) {
    nonTrainingSolutions.push("Address environmental or policy barriers that prevent correct performance.");
  }
  if ((mgr?.value ?? 5) <= 2) {
    nonTrainingSolutions.push("Equip front-line managers with reinforcement playbooks and weekly check-in templates.");
  }
  if ((ops?.value ?? 0) >= 4) {
    nonTrainingSolutions.push("Embed in-workflow job aids and performance support to overcome shift / device constraints.");
  }
  if ((reporting?.value ?? 5) <= 2) {
    nonTrainingSolutions.push("Stand up a simple KPI dashboard so leadership can see progress monthly.");
  }
  if (nonTrainingSolutions.length === 0) {
    nonTrainingSolutions.push("Light-touch process check-ins — no major operational redesign indicated.");
  }

  // ---- Caveats ----
  if (diagnosis.trainingShare < 35) {
    caveats.push(
      "Training alone will not solve this problem. Operational fixes must lead; learning supports them."
    );
  } else if (diagnosis.trainingShare < 65) {
    caveats.push(
      "Training is necessary but not sufficient — sequence non-training fixes alongside the learning rollout."
    );
  }
  if ((mgr?.value ?? 5) <= 2) {
    caveats.push("Low manager support is a transfer risk — do not launch without manager enablement.");
  }
  if ((reporting?.value ?? 5) <= 2) {
    caveats.push("Without measurable reporting, impact cannot be proven — define KPI tracking before rollout.");
  }

  const headline =
    diagnosis.trainingShare >= 65
      ? "Training-led intervention with light operational support"
      : diagnosis.trainingShare >= 35
        ? "Blended intervention — training plus operational fixes"
        : "Operational-led intervention — training plays a supporting role";

  const summary =
    `Diagnostic indicates ${diagnosis.trainingShare}% of the gap is training-solvable and ` +
    `${diagnosis.nonTrainingShare}% is rooted in process, tooling, leadership or environment. ` +
    `${diagnosis.rationale}`;

  return { headline, summary, trainingSolutions, nonTrainingSolutions, caveats };
};

// Get theory description by theory name
export const getTheoryDescription = (theory: LearningTheory) => {
  return learningTheoryDescriptions.find(t => t.theory === theory);
};

// ===== Executive Summary (Business Problem / Impact / Root Causes) =====
export const buildExecutiveSummary = (
  segmentResults: SegmentResult[],
  responses: UserResponse[],
  riskSeverity: "Low" | "Moderate" | "High" | "Critical"
): ExecutiveSummary => {
  const problemResp = responses.find(r => r.questionId === "pc-problem");
  const terminalResp = responses.find(r => r.questionId === "pc-terminal-goal");
  const businessProblem =
    (problemResp?.customText && problemResp.customText.trim()) ||
    "Performance challenge not explicitly described. Based on the assessment, the workforce is not consistently meeting expected business outcomes.";

  const impactLevel: ExecutiveSummary["impactLevel"] =
    riskSeverity === "Critical" || riskSeverity === "High"
      ? "High"
      : riskSeverity === "Moderate"
        ? "Medium"
        : "Low";

  const impactExplanation =
    impactLevel === "High"
      ? `Failure to address this issue is likely to disrupt operations, harm customers or expose the business to compliance, safety, or revenue risk${terminalResp?.customText ? ` — particularly the desired outcome: "${terminalResp.customText.trim()}".` : "."}`
      : impactLevel === "Medium"
        ? "The issue is materially affecting a team or business unit. Left unaddressed it will compound and increase operational drag."
        : "Current impact is limited, but the issue may grow if root causes are not addressed early.";

  // ---- Root causes ----
  const causesMap: Record<string, { label: string; explanation: string }> = {
    "rc-5-1": { label: "Skill or knowledge gaps", explanation: "Employees lack the specific skills or knowledge needed to perform the task to standard." },
    "rc-5-2": { label: "Process / SOP issues", explanation: "Workflows or standard operating procedures are unclear, outdated, or inconsistently applied." },
    "rc-5-3": { label: "Tool or technology limitations", explanation: "Systems, tools, or automations do not adequately support the work." },
    "rc-5-4": { label: "Staffing or workload constraints", explanation: "Capacity, scheduling, or workload pressures prevent consistent performance." },
    "rc-5-5": { label: "Incentives or motivation", explanation: "Recognition, incentives, or consequences are not aligned with the desired behaviour." },
    "rc-5-6": { label: "Leadership or management gaps", explanation: "Front-line leaders are not actively coaching, reinforcing, or holding accountability." },
    "rc-5-7": { label: "Environmental or policy barriers", explanation: "Environmental, policy, or organisational conditions actively block correct performance." },
  };

  const rcResp = responses.find(r => r.questionId === "rc-5");
  const selected = rcResp?.selectedOptionIds ?? [];
  const rootCauses: { label: string; explanation: string }[] = [];
  selected.forEach(id => {
    if (causesMap[id]) rootCauses.push(causesMap[id]);
  });

  // Inferred causes from low scores
  const cap = responses.find(r => r.questionId === "pg-capability");
  if ((cap?.value ?? 0) >= 4 && !selected.includes("rc-5-1")) {
    rootCauses.push(causesMap["rc-5-1"]);
  }
  const mgr = responses.find(r => r.questionId === "wr-manager");
  if ((mgr?.value ?? 5) <= 2 && !selected.includes("rc-5-6")) {
    rootCauses.push(causesMap["rc-5-6"]);
  }
  const proc = responses.find(r => r.questionId === "rc-2");
  if ((proc?.value ?? 0) >= 4 && !selected.includes("rc-5-2")) {
    rootCauses.push(causesMap["rc-5-2"]);
  }

  if (rootCauses.length === 0) {
    rootCauses.push({
      label: "Unclear performance expectations",
      explanation: "The assessment did not surface a clear dominant cause — clarify expected behaviours and observe the workflow before designing a solution.",
    });
  }

  return {
    businessProblem,
    impactLevel,
    impactExplanation,
    rootCauses: rootCauses.slice(0, 5),
  };
};

// Get segment by ID
export const getSegmentById = (segmentId: string): AssessmentSegment | undefined => {
  return segments.find(s => s.id === segmentId);
};

// Instructional design models data
const instructionalDesignModels: Omit<IDModel, 'alignmentScore'>[] = [
  {
    name: "ADDIE Model",
    description: "A systematic instructional design framework consisting of five phases: Analysis, Design, Development, Implementation, and Evaluation.",
    characteristics: [
      "Systematic and sequential approach",
      "Comprehensive framework for instructional design",
      "Focuses on continuous improvement through evaluation"
    ],
    whenToUse: [
      "When creating structured learning programs from scratch",
      "For training programs that require careful planning and systematic implementation",
      "When you need a comprehensive framework that covers the entire instructional design process"
    ],
    implementationSteps: [
      "Analyze: Identify learning needs, audience characteristics, and desired outcomes",
      "Design: Create learning objectives, select instructional strategies, and plan assessments",
      "Develop: Create content, learning activities, and assessment instruments",
      "Implement: Deliver the training to learners",
      "Evaluate: Assess the effectiveness of the training and make improvements"
    ],
    alignedTheories: ["Cognitivism", "Behaviorism"]
  },
  {
    name: "SAM (Successive Approximation Model)",
    description: "An agile instructional design model that emphasizes iterative development with frequent feedback and collaboration.",
    characteristics: [
      "Iterative and incremental approach",
      "Emphasizes collaboration and feedback",
      "More flexible than linear models"
    ],
    whenToUse: [
      "When rapid development is required",
      "For projects where requirements may evolve",
      "When stakeholder feedback is crucial throughout the development process"
    ],
    implementationSteps: [
      "Preparation: Gather information and build a foundation",
      "Iterative Design: Create prototypes and gather feedback",
      "Iterative Development: Build, test, and refine the solution",
      "Implement: Deploy the finalized solution"
    ],
    alignedTheories: ["Constructivism", "Experiential Learning"]
  },
  {
    name: "4C/ID Model",
    description: "A complex learning design approach focused on developing complex skills through whole-task practice with scaffolding support.",
    characteristics: [
      "Focuses on complex skill acquisition",
      "Uses authentic whole tasks",
      "Provides varying levels of support"
    ],
    whenToUse: [
      "When developing complex professional skills",
      "For training that requires integration of knowledge, skills and attitudes",
      "When authentic practice is essential for learning transfer"
    ],
    implementationSteps: [
      "Design learning tasks: Create authentic whole-task experiences",
      "Design supportive information: Provide mental models and cognitive strategies",
      "Design procedural information: Provide just-in-time information for routine aspects",
      "Design part-task practice: Provide additional practice for routine aspects"
    ],
    alignedTheories: ["Cognitivism", "Social Learning"]
  },
  {
    name: "Merrill's First Principles of Instruction",
    description: "Problem-centered approach based on five principles: Problem, Activation, Demonstration, Application, and Integration.",
    characteristics: [
      "Problem-centered learning",
      "Builds on learners' existing knowledge",
      "Provides demonstrations and practice opportunities"
    ],
    whenToUse: [
      "When you want to focus on real-world problem solving",
      "For performance-based learning objectives",
      "When you need a strong theoretical foundation for your design"
    ],
    implementationSteps: [
      "Problem: Engage learners in real-world problems",
      "Activation: Build upon existing knowledge and experience",
      "Demonstration: Show learners how to apply new knowledge",
      "Application: Provide opportunities for practice with feedback",
      "Integration: Help learners transfer learning to real-world situations"
    ],
    alignedTheories: ["Cognitivism", "Constructivism"]
  },
  {
    name: "Action Mapping",
    description: "A business-centric approach that focuses on performance improvement rather than information delivery.",
    characteristics: [
      "Business-focused approach",
      "Emphasizes measurable outcomes",
      "Focuses on activities rather than content"
    ],
    whenToUse: [
      "When training needs to demonstrate business impact",
      "For performance-based problems rather than knowledge gaps",
      "When streamlining content and focusing on application is important"
    ],
    implementationSteps: [
      "Identify the business goal",
      "Identify what people need to do to meet this goal",
      "Design practice activities that build these skills",
      "Identify the minimum content needed to support these activities"
    ],
    alignedTheories: ["Behaviorism", "Adult Learning"]
  },
  {
    name: "70:20:10 Model",
    description: "A framework suggesting that 70% of learning comes from challenging experiences, 20% from developmental relationships, and 10% from formal coursework.",
    characteristics: [
      "Emphasizes experiential learning",
      "Recognizes the importance of social learning",
      "Positions formal training as a small but important component"
    ],
    whenToUse: [
      "When designing holistic learning ecosystems rather than isolated courses",
      "For workplace learning and professional development",
      "When you want to leverage informal and social learning"
    ],
    implementationSteps: [
      "Identify the 70% (challenging assignments, projects, problem-solving)",
      "Design the 20% (coaching, mentoring, collaborative learning)",
      "Create the 10% (structured courses, workshops, e-learning)",
      "Integrate all three components into a cohesive learning experience"
    ],
    alignedTheories: ["Experiential Learning", "Social Learning", "Adult Learning"]
  }
];

// Get recommended instructional design models based on assessment results
export const getRecommendedIDModels = (results: AssessmentResult): IDModel[] => {
  // Calculate alignment score for each model
  const modelsWithScores = instructionalDesignModels.map(model => {
    let alignmentScore = 0;
    let totalWeight = 0;
    
    // Calculate a weighted score based on how well the model aligns with the top theories
    model.alignedTheories.forEach(theory => {
      const theoryMetric = results.metrics.find(m => m.theory === theory);
      if (theoryMetric) {
        // Theories explicitly aligned with this model get weighted based on their assessment score
        alignmentScore += theoryMetric.percentage;
        totalWeight += 1;
      }
    });
    
    // Add primary theory as a bonus if it's aligned with this model
    if (model.alignedTheories.includes(results.primaryRecommendedTheory)) {
      alignmentScore += 20; // Bonus points for including the primary recommended theory
      totalWeight += 0.2;
    }
    
    // Calculate the final alignment score
    const finalScore = totalWeight > 0 ? alignmentScore / totalWeight : 0;
    
    return {
      ...model,
      alignmentScore: finalScore
    };
  });
  
  // Sort models by alignment score (descending)
  return modelsWithScores.sort((a, b) => b.alignmentScore - a.alignmentScore);
};
