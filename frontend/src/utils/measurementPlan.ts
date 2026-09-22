import { AssessmentResult, LearningTheory, TrainingDiagnosis } from "@/types/assessment";

export type EvaluationArea = "Experience" | "Learning" | "Application" | "Business Results";

export type MeasurementRow = {
  area: EvaluationArea;
  whatWillBeMeasured: string;
  measure: string;
  baseline: string;
  target: string;
  dataSource: string;
  timing: string;
  owner: string;
};

export type EvaluationCard = {
  area: EvaluationArea;
  question: string;
  included: boolean;
  rationale: string;
  evidenceStrength: "Supporting indicator" | "Core evidence" | "Decisive evidence";
};

export type RoadmapPhase = { phase: string; items: string[] };

export type MeasurementTimeline = {
  headline: string;
  reason: string;
  checkpoints: { label: string; focus: string }[];
};

export type Section5Plan = {
  roadmap: RoadmapPhase[];
  evaluation: EvaluationCard[];
  plan: MeasurementRow[];
  timeline: MeasurementTimeline;
  impactSummary: string;
};

const NOT_PROVIDED = "Not provided — confirm with the business.";
const NO_SOURCE = "Confirm available business data source.";
const NO_OWNER = "Assign measurement owner before implementation.";

const pct = (result: AssessmentResult, segmentId: string): number =>
  result.segmentResults.find((s) => s.segmentId === segmentId)?.percentage ?? 0;

/** Behaviour-frequency / complexity profile inferred from the recommended approach. */
const behaviourProfile = (theory: LearningTheory) => {
  switch (theory) {
    case "Behaviorism":
      return { frequency: "high" as const, complexity: "low" as const, adoption: "short" as const };
    case "Cognitivism":
      return { frequency: "high" as const, complexity: "moderate" as const, adoption: "short" as const };
    case "Constructivism":
      return { frequency: "moderate" as const, complexity: "high" as const, adoption: "medium" as const };
    case "Social Learning":
      return { frequency: "moderate" as const, complexity: "high" as const, adoption: "medium" as const };
    case "Experiential Learning":
      return { frequency: "low" as const, complexity: "high" as const, adoption: "long" as const };
    default:
      return { frequency: "moderate" as const, complexity: "moderate" as const, adoption: "medium" as const };
  }
};

/** Metrics that relate to the identified problem, not generic learning metrics. */
const applicationMeasures = (theory: LearningTheory): string[] => {
  switch (theory) {
    case "Behaviorism":
      return ["First-time-right performance on the target task", "Error / rework rate", "Process adherence or audit pass rate"];
    case "Cognitivism":
      return ["Decision accuracy on live cases", "Escalation and rework volume"];
    case "Constructivism":
      return ["Quality of work on real cases", "Manager-observed application of the target behaviour"];
    case "Social Learning":
      return ["Coach / manager observation of the target behaviour", "Consistency of performance across the team"];
    case "Experiential Learning":
      return ["Performance on live high-stakes work", "Critical incident / severe error rate"];
    default:
      return ["Application of the new skill to the learner's own work", "Adoption rate of the new way of working"];
  }
};

export const buildSection5Plan = (
  result: AssessmentResult,
  trainingDiagnosis: TrainingDiagnosis,
  riskSeverity: "Low" | "Moderate" | "High" | "Critical",
  strategy: { trainingSolutions: string[]; nonTrainingSolutions: string[]; caveats: string[] },
): Section5Plan => {
  const kpiClarity = pct(result, "business-analysis");
  const gapSeverity = pct(result, "skill-gap-assessment");
  const barriers = pct(result, "root-cause-analysis");
  const readiness = pct(result, "workforce-readiness");
  const deliveryMaturity = pct(result, "intervention-strategy");

  const theory = result.primaryRecommendedTheory;
  const profile = behaviourProfile(theory);
  const trainingLed = trainingDiagnosis.trainingShare >= trainingDiagnosis.nonTrainingShare;
  const heavyBarriers = trainingDiagnosis.nonTrainingShare >= 40 || barriers >= 60;
  const lowReadiness = readiness < 60;
  const kpiDefined = kpiClarity >= 60;
  const urgent = riskSeverity === "Critical" || riskSeverity === "High";

  // ---------- PART 1: Implementation roadmap (dynamic) ----------
  const prepare = [
    kpiDefined
      ? "Confirm the agreed KPI, current baseline value, and target with the sponsor before launch"
      : "Define the primary KPI, capture a baseline, and agree the target with the sponsor — measurement cannot start without it",
    "Align stakeholders on the performance problem, the success criteria, and who owns each measure",
  ];
  if (heavyBarriers) prepare.push("Confirm process, tool, policy, or workload changes are scheduled before learning is delivered");
  if (lowReadiness) prepare.push("Prepare managers to sponsor the change, protect practice time, and reinforce the new behaviour");
  if (deliveryMaturity < 60) prepare.push("Confirm delivery capacity, platform readiness, and content ownership");
  prepare.push("Communicate the change and the expected behaviour to the affected audience");

  const enable: string[] = [];
  strategy.trainingSolutions.slice(0, 3).forEach((s) => enable.push(`Deliver: ${s}`));
  enable.push(
    profile.complexity === "high"
      ? "Provide realistic practice with feedback before people work on live, high-stakes tasks"
      : "Provide short guided practice with immediate corrective feedback",
  );
  enable.push("Provide job aids and performance support in the flow of work");
  if (!trainingLed) enable.push("Implement the non-training changes in parallel — learning alone will not close this gap");
  if (lowReadiness) enable.push("Brief managers and coaches on what good performance looks like and how to reinforce it");

  const apply = [
    "Employees apply the target behaviour to live work with support available",
    profile.frequency === "high"
      ? "Reinforce daily through short cadence check-ins where the behaviour occurs frequently"
      : "Schedule deliberate application opportunities, as the behaviour occurs less frequently in normal work",
    "Managers observe, coach, and give specific feedback on the target behaviour",
    "Track adoption and surface where people are not able to apply the skill",
  ];
  strategy.nonTrainingSolutions.slice(0, 2).forEach((s) => apply.push(`Remove barrier: ${s}`));

  const measure = [
    "Collect learning evidence: can people perform the task correctly under realistic conditions?",
    "Collect workplace evidence: is the behaviour actually being applied on the job?",
    kpiDefined
      ? "Track the agreed business KPI against the baseline and target"
      : "Track the business KPI once the sponsor confirms baseline and target",
    "Compare results against baseline and target, and report the delta to the sponsor",
    "Agree follow-up actions where evidence shows the gap is not closing",
  ];

  const roadmap: RoadmapPhase[] = [
    { phase: "Phase 1 — Prepare", items: prepare },
    { phase: "Phase 2 — Enable", items: enable },
    { phase: "Phase 3 — Apply", items: apply },
    { phase: "Phase 4 — Measure", items: measure },
  ];

  // ---------- PART 2 / 5 / 6: Evaluation strategy ----------
  const behaviourGoal = gapSeverity >= 40 || trainingDiagnosis.trainingShare >= 30;
  const businessGoal = kpiClarity >= 40 || urgent;

  const evaluation: EvaluationCard[] = [
    {
      area: "Experience",
      question: "Did learners find the solution relevant, useful, and applicable to their work?",
      included: true,
      evidenceStrength: "Supporting indicator",
      rationale:
        lowReadiness || deliveryMaturity < 60
          ? "Worth checking early because readiness and delivery maturity are limited — poor relevance would explain weak adoption. Treated as a diagnostic signal only, never as proof of impact."
          : "Collected as a light diagnostic signal to catch relevance problems early. It is not evidence that performance improved.",
    },
    {
      area: "Learning",
      question: "Did learners develop the required knowledge, skills, or capability?",
      included: true,
      evidenceStrength: profile.complexity === "high" ? "Core evidence" : "Supporting indicator",
      rationale:
        profile.complexity === "high"
          ? "The skill is complex, so capability must be demonstrated through realistic task performance or decision quality — not completion or quiz scores."
          : "Confirm capability through a short demonstration of the task itself rather than a knowledge test.",
    },
    {
      area: "Application",
      question: "Are learners applying the required skills or behaviours in the workplace?",
      included: behaviourGoal,
      evidenceStrength: "Core evidence",
      rationale: behaviourGoal
        ? "The assessment points to a behaviour gap, so workplace application is the decisive test of whether the solution worked."
        : "The assessment does not indicate a workplace behaviour change goal, so this level is optional here.",
    },
    {
      area: "Business Results",
      question: "Did the intervention contribute to improvement in the targeted business outcome?",
      included: businessGoal,
      evidenceStrength: "Decisive evidence",
      rationale: businessGoal
        ? kpiDefined
          ? "A business KPI is in scope, so improvement against the agreed baseline is the ultimate success test."
          : "The problem is business-critical, but the KPI is not yet defined — the sponsor must confirm it before this level can be measured."
        : "No business KPI was established in the assessment, so results-level measurement cannot be claimed yet.",
    },
  ];

  // ---------- PART 4: Dynamic measurement timeline ----------
  let headline: string;
  let reason: string;
  if (heavyBarriers && !trainingLed) {
    headline = "3–6 months after implementation";
    reason =
      "The outcome depends largely on non-training changes (process, tools, or workload) taking hold across the organisation. Measuring earlier would judge the solution before the operating conditions have changed.";
  } else if (profile.adoption === "long") {
    headline = "90 days after implementation";
    reason =
      "The target behaviour is complex and occurs infrequently, so people need repeated application cycles before consistent performance and meaningful trends can be assessed.";
  } else if (profile.frequency === "high" && urgent) {
    headline = "2–4 weeks after implementation";
    reason =
      "The target behaviour occurs frequently in daily work and the business problem is urgent, so adoption and early performance shifts can be observed within weeks.";
  } else if (profile.frequency === "high") {
    headline = "30 days after implementation";
    reason =
      "The target behaviour occurs frequently in daily work, giving enough opportunity within a month to observe adoption and identify early performance changes.";
  } else {
    headline = "60 days after implementation";
    reason =
      "The behaviour involves judgement and coaching support, and needs repeated application before performance trends can be read reliably.";
  }
  if (kpiClarity < 40) {
    reason += " Note: business-level timing cannot be finalised until the sponsor confirms the KPI reporting cycle.";
  }

  const kpiTiming = headline;
  const applicationTiming =
    profile.frequency === "high" ? "2–4 weeks after implementation" : profile.adoption === "long" ? "60–90 days after implementation" : "30–60 days after implementation";
  const learningTiming = profile.complexity === "high" ? "Within 1–2 weeks of the practice activity" : "Immediately after the intervention";

  const timeline: MeasurementTimeline = {
    headline,
    reason,
    checkpoints: [
      { label: "Immediately after intervention", focus: "Experience and relevance signals" },
      { label: learningTiming, focus: "Demonstrated capability on the actual task" },
      { label: applicationTiming, focus: "Workplace application and adoption" },
      { label: kpiTiming, focus: "Business KPI movement against baseline and target" },
      ...(heavyBarriers ? [{ label: "Longer-term business review", focus: "Sustained performance once operational changes are embedded" }] : []),
    ],
  };

  // ---------- PART 3: Measurement plan rows ----------
  const plan: MeasurementRow[] = [];

  plan.push({
    area: "Experience",
    whatWillBeMeasured: "Perceived relevance and usefulness of the solution to real work",
    measure: "Relevance and applicability rating (diagnostic only)",
    baseline: NOT_PROVIDED,
    target: NOT_PROVIDED,
    dataSource: "Short post-intervention pulse check",
    timing: "Immediately after intervention",
    owner: NO_OWNER,
  });

  plan.push({
    area: "Learning",
    whatWillBeMeasured:
      profile.complexity === "high"
        ? "Ability to perform the target task and make correct decisions under realistic conditions"
        : "Ability to perform the target task correctly to the required standard",
    measure: profile.complexity === "high" ? "Observed task performance / decision quality in practice" : "Observed correct task execution against the standard",
    baseline: NOT_PROVIDED,
    target: NOT_PROVIDED,
    dataSource: "Practice or simulation records; assessor / coach observation",
    timing: learningTiming,
    owner: NO_OWNER,
  });

  if (behaviourGoal) {
    applicationMeasures(theory).forEach((m, i) => {
      plan.push({
        area: "Application",
        whatWillBeMeasured: i === 0 ? "Whether the required behaviour is used on live work" : "Consistency and quality of the behaviour over time",
        measure: m,
        baseline: NOT_PROVIDED,
        target: NOT_PROVIDED,
        dataSource: i === 0 ? "Workplace performance / quality system data" : "Manager observation records and coaching notes",
        timing: applicationTiming,
        owner: NO_OWNER,
      });
    });
  }

  if (businessGoal) {
    plan.push({
      area: "Business Results",
      whatWillBeMeasured: "Movement in the business outcome this solution is intended to improve",
      measure: kpiDefined ? "Agreed primary business KPI (confirm exact metric with the sponsor)" : NOT_PROVIDED,
      baseline: NOT_PROVIDED,
      target: NOT_PROVIDED,
      dataSource: kpiClarity >= 60 ? "Existing business KPI reporting / dashboard" : NO_SOURCE,
      timing: kpiTiming,
      owner: NO_OWNER,
    });
  }

  // ---------- PART 7: Expected business impact ----------
  const rootCause = result.executiveSummary?.rootCauses?.[0]?.label;
  const secondary = plan
    .filter((r) => r.area === "Application" || r.area === "Learning")
    .map((r) => r.measure.toLowerCase())
    .slice(0, 2)
    .join(" and ");

  const impactSummary = kpiDefined
    ? `This solution is intended to improve the agreed business KPI by addressing ${rootCause ? rootCause.toLowerCase() : "the identified performance gap"}. Success will be demonstrated through movement in the sponsor-confirmed primary KPI against its baseline, supported by ${secondary || "workplace application evidence"}. Confirm the exact KPI value and target with the sponsor before implementation.`
    : `The assessment did not provide a specific business KPI. The sponsor should confirm the primary KPI before implementation. In the meantime, this solution targets ${rootCause ? rootCause.toLowerCase() : "the identified performance gap"}, and progress can be evidenced through ${secondary || "workplace application evidence"} until a business measure is agreed.`;

  return { roadmap, evaluation, plan, timeline, impactSummary };
};
