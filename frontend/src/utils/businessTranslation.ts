import { LearningTheory, AssessmentResult } from "@/types/assessment";

export type BusinessRecommendation = {
  approach: string;
  summary: string;
  whyThisApproach: string[];
  keyElements: string[];
  workplaceApplication: string;
  expectedImpact: string;
  successMeasures: string[];
  learningModalities: string[];
};

const MAP: Record<LearningTheory, BusinessRecommendation> = {
  Behaviorism: {
    approach: "Guided Practice with Feedback",
    summary:
      "A structured, repeatable learning experience where employees practice the correct behavior, receive immediate feedback, and build consistency through reinforcement.",
    whyThisApproach: [
      "The performance gap requires consistent, accurate execution of a defined process",
      "Errors carry compliance, safety, or quality risk",
      "The task is repeatable and benefits from reinforcement",
    ],
    keyElements: [
      "Clear demonstrations of the correct behavior",
      "Step-by-step guided practice",
      "Immediate corrective feedback",
      "Knowledge and skill checks",
      "Job aids and quick-reference guides",
    ],
    workplaceApplication:
      "Employees apply the standard process on the job with the support of job aids, checklists, and supervisor reinforcement to sustain performance.",
    expectedImpact:
      "Reduced variability in execution, fewer errors, improved compliance, and faster first-time-right performance.",
    successMeasures: [
      "Error reduction rate",
      "First-time-right performance",
      "Compliance / audit pass rate",
      "Time to proficiency",
      "Quality scores",
    ],
    learningModalities: ["Guided practice", "Demonstration and practice", "Job aids", "Microlearning refreshers"],
  },
  Cognitivism: {
    approach: "Structured Concept-to-Application Learning",
    summary:
      "A learning experience that helps employees understand the underlying concepts and decision logic so they can apply them accurately in familiar situations.",
    whyThisApproach: [
      "Employees need to understand not just what to do, but why and when",
      "The task involves rules, categories, or diagnostic thinking",
      "Content complexity requires manageable chunks to support retention",
    ],
    keyElements: [
      "Information presented in manageable chunks",
      "Clear examples and non-examples",
      "Visual models and decision aids",
      "Progressive complexity",
      "Retrieval practice and knowledge checks",
    ],
    workplaceApplication:
      "Employees apply concepts and decision frameworks during day-to-day work, supported by decision aids and reference materials.",
    expectedImpact:
      "Better on-the-job decision quality, improved consistency of judgment calls, and faster ramp-up on complex topics.",
    successMeasures: [
      "Decision quality / accuracy",
      "Assessment scores on applied scenarios",
      "Reduction in escalations or rework",
      "Time to proficiency",
    ],
    learningModalities: ["Self-paced digital learning", "Microlearning", "Explainer videos", "Job aids"],
  },
  Constructivism: {
    approach: "Practice-Based Learning",
    summary:
      "A learning experience where employees apply concepts in realistic workplace situations, make decisions, and learn through practice, feedback, and reflection.",
    whyThisApproach: [
      "Employees need to apply knowledge to real workplace situations, not just recall it",
      "The task involves judgment, context, and problem-solving",
      "Existing experience should be leveraged and built on",
    ],
    keyElements: [
      "Realistic workplace scenarios",
      "Decision-making activities",
      "Guided practice with progressively harder cases",
      "Immediate, specific feedback",
      "Reflection and application to the learner's own work",
    ],
    workplaceApplication:
      "Employees transfer skills into real work through on-the-job practice, coaching, and application challenges tied to their own responsibilities.",
    expectedImpact:
      "Improved ability to apply knowledge to real workplace situations, better judgment under uncertainty, and stronger performance on non-routine work.",
    successMeasures: [
      "Application accuracy on real work",
      "Reduction in avoidable errors",
      "First-time-right performance",
      "Time to proficiency",
      "Manager-observed behavior change",
    ],
    learningModalities: [
      "Scenario-based practice",
      "Simulations",
      "Case studies",
      "Coaching",
      "Guided practice",
    ],
  },
  "Social Learning": {
    approach: "Peer and Coaching-Led Learning",
    summary:
      "A learning experience where employees learn from experts, peers, and role models through observation, discussion, and coaching in the flow of work.",
    whyThisApproach: [
      "The skill is best learned by observing experienced performers",
      "Team dynamics and tacit knowledge matter",
      "The organization has strong experts who can coach and mentor",
    ],
    keyElements: [
      "Expert demonstrations and shadowing",
      "Coaching and mentoring sessions",
      "Peer learning circles and communities of practice",
      "Role plays and observed practice",
      "Manager reinforcement",
    ],
    workplaceApplication:
      "Employees learn on the job through coaching, shadowing, peer discussion, and shared problem-solving with more experienced colleagues.",
    expectedImpact:
      "Faster capability build-up in new hires, stronger team consistency, and improved transfer of tacit expertise across the organization.",
    successMeasures: [
      "Time to proficiency for new hires",
      "Coach / manager observation ratings",
      "Team performance consistency",
      "Reduction in escalations to senior staff",
    ],
    learningModalities: ["Coaching", "Peer learning", "Role plays", "Communities of practice", "Blended learning"],
  },
  "Experiential Learning": {
    approach: "Simulation and Real-World Application",
    summary:
      "A learning experience where employees learn by doing — through simulations, real work assignments, and structured reflection on what worked and what didn't.",
    whyThisApproach: [
      "The task is high-stakes, complex, or hard to practice safely on the job",
      "Employees need repeated exposure to realistic conditions to build confidence",
      "Judgment develops best through cycles of action and reflection",
    ],
    keyElements: [
      "Realistic simulations or lab environments",
      "Stretch assignments or on-the-job projects",
      "Structured debriefs and reflection",
      "Coaching during and after practice",
      "Progressive complexity and risk",
    ],
    workplaceApplication:
      "Employees practice in a safe environment first, then apply skills to live work with coaching support, refining performance over successive cycles.",
    expectedImpact:
      "Higher confidence and competence in complex or high-stakes situations, better decision-making under pressure, and reduced costly errors in live work.",
    successMeasures: [
      "Performance on live work post-training",
      "Reduction in critical incidents / rework",
      "Time to independent performance",
      "Confidence and readiness ratings",
    ],
    learningModalities: ["Simulations", "Scenario-based practice", "On-the-job projects", "Coaching"],
  },
  "Adult Learning": {
    approach: "Relevance-Driven, Self-Directed Learning",
    summary:
      "A learning experience that respects employees' experience, ties directly to their real work problems, and gives them control over how and when they learn.",
    whyThisApproach: [
      "Learners are experienced professionals who need direct relevance to their work",
      "Motivation depends on solving a real, current problem",
      "Flexibility and autonomy are important for uptake",
    ],
    keyElements: [
      "Real business problems as the starting point",
      "Direct connection to the learner's role and goals",
      "Choice in pace, sequence, and format",
      "Application to the learner's own workplace",
      "Performance support in the flow of work",
    ],
    workplaceApplication:
      "Employees apply learning immediately to their current work, supported by on-demand resources they can access when needed.",
    expectedImpact:
      "Higher engagement, faster application to real work, and better performance on the specific business problems the learning was designed to solve.",
    successMeasures: [
      "Application to a defined business problem",
      "Time to first successful application",
      "Learner-reported impact on work outcomes",
      "Business KPI movement tied to the problem",
    ],
    learningModalities: ["Self-paced digital learning", "Microlearning", "Performance support", "Blended learning"],
  },
};

export const getBusinessRecommendation = (theory: LearningTheory): BusinessRecommendation =>
  MAP[theory] ?? MAP.Constructivism;

export const getDesignConsiderations = (_result: AssessmentResult): string[] => [
  "Present information in manageable chunks",
  "Remove content that is not essential to the task",
  "Provide job aids and performance support for complex steps",
  "Introduce complexity progressively",
  "Let learners practice one skill at a time before combining skills",
];

export const getBusinessOutcomeAlignment = (_result: AssessmentResult) => ({
  outcome: "Not provided in the assessment — confirm with the business before implementation.",
  primaryKpi: "Not provided — align with the sponsor's target metric.",
  baseline: "Baseline not provided. Confirm with the business before implementation.",
  target: "Target not provided. Confirm with the business before implementation.",
  timeframe:
    "Measurement timeframe not defined. Recommend measuring at 30, 60, and 90 days post-implementation.",
});
