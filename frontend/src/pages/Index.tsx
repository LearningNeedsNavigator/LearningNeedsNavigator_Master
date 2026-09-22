import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle,
  CheckCircle2,
  FileText,
  BarChart3,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ClipboardList,
  BrainCircuit,
  Rocket,
  Target,
  Lightbulb,
  TrendingUp,
  Users,
  Monitor,
  AlertTriangle,
  Search,
  MessageCircle,
  CheckSquare,
  Wrench,
  UserX,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import PageLayout from "@/components/layout/PageLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import aiBrain from "@/assets/ai-brain.png";
import comicPanel1 from "@/assets/comic-panel-1.png";
import comicPanel2 from "@/assets/comic-panel-2.png";
import comicPanel3 from "@/assets/comic-panel-3.png";
import comicPanel4 from "@/assets/comic-panel-4.png";
import onboardingSteps from "@/assets/getting-started-steps.jpeg.asset.json";

const Index = () => {
  const navigate = useNavigate();
  const [consentOpen, setConsentOpen] = React.useState(false);
  const [consentChecked, setConsentChecked] = React.useState(false);

  const handleStartAssessment = () => {
    setConsentChecked(false);
    setConsentOpen(true);
  };

  const handleContinue = () => {
    setConsentOpen(false);
    navigate("/assessment");
  };

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 space-y-24 sm:space-y-28 py-10 sm:py-14">
        {/* Hero */}
        <section className="relative animate-[fade-in_0.7s_ease-out]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-5xl rounded-[3rem] bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent blur-3xl"
          />
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            {/* Left */}
            <div className="flex flex-col items-center text-center space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-[13px] font-medium text-primary opacity-0 animate-[fade-up_0.6s_ease-out_0.05s_forwards]">
                <Sparkles className="h-4 w-4" />
                AI-powered performance consulting
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-[4rem] font-semibold tracking-tight text-foreground leading-[1.1] opacity-0 animate-[fade-up_0.7s_ease-out_0.15s_forwards]">
                Navigate Workforce Performance with{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Clarity
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed opacity-0 animate-[fade-up_0.7s_ease-out_0.28s_forwards]">
                A guided AI consultant that helps you identify performance issues, determine whether training is needed,
                and recommend actionable solutions tied to business impact.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 opacity-0 animate-[fade-up_0.7s_ease-out_0.42s_forwards]">
                <Button
                  size="lg"
                  onClick={handleStartAssessment}
                  className="group relative overflow-hidden gap-2 h-12 px-7 text-base bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#EAB308] text-[#0F172A] shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-300 ease-out"
                >
                  <span aria-hidden />
                  <span className="relative">Start Assessment</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/assessment")}
                  className="h-12 px-7 text-base transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/[0.06] hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.08),0_8px_24px_-12px_hsl(var(--primary)/0.4)]"
                >
                  Explore the Framework
                </Button>
              </div>
            </div>

            {/* Right - AI brain illustration */}
            {/* <div className="relative flex items-center justify-center opacity-0 animate-[fade-in_1s_ease-out_0.3s_forwards]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 mx-auto h-[85%] w-[85%] my-auto rounded-full bg-[radial-gradient(circle_at_center,hsl(190_90%_55%/0.32),hsl(var(--primary)/0.18)_45%,transparent_72%)] blur-3xl animate-[breathe_7s_ease-in-out_infinite]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -top-4 -right-4 h-32 w-32 rounded-full bg-cyan-400/25 blur-2xl animate-[breathe_8s_ease-in-out_infinite]"
              />
              <img
                src={aiBrain}
                alt="AI intelligence shield illustration with central chip, neural connections and analytics indicators"
                width={1024}
                height={1024}
                className="relative w-full max-w-[48rem] lg:max-w-[55rem] h-auto -mt-10 lg:-mt-14 select-none drop-shadow-[0_30px_90px_hsl(190_90%_55%/0.35)] animate-[float_7s_ease-in-out_infinite]"
                draggable={false}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 mx-auto h-[55%] w-[55%] my-auto rounded-full bg-[radial-gradient(circle_at_center,hsl(190_95%_60%/0.25),transparent_70%)] blur-2xl animate-[breathe_5s_ease-in-out_infinite]"
              />
            </div> */}
          </div>
        </section>

        {/* Getting Started */}
        <section>
          <div className="mx-auto w-full max-w-5xl space-y-12 sm:space-y-14">
            <div className="flex flex-col items-center text-center space-y-5">
              <span className="text-[12px] font-semibold uppercase tracking-[0.28em] text-primary">
                Getting Started
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-semibold tracking-tight text-foreground leading-[1.15] max-w-3xl">
                Getting Started in{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  4 Simple Steps
                </span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Create your account, verify your email, sign in securely, and begin your Learning Needs Assessment
                journey.
              </p>
              <div className="flex items-center gap-2 pt-2">
                {[
                  "from-[hsl(196_45%_62%)] to-[hsl(186_38%_50%)]",
                  "from-[hsl(204_42%_64%)] to-[hsl(190_38%_52%)]",
                  "from-[hsl(190_40%_58%)] to-[hsl(196_42%_60%)]",
                  "from-[hsl(186_38%_52%)] to-[hsl(198_42%_62%)]",
                ].map((g, i) => (
                  <span key={i} className={`h-1 w-10 rounded-full bg-gradient-to-r ${g} opacity-80`} />
                ))}
              </div>
            </div>

            <div className="mx-auto w-full" style={{ maxWidth: "1100px" }}>
              <div className="rounded-2xl border border-[hsl(210_30%_92%)] bg-white overflow-hidden">
                <img
                  src={onboardingSteps.url}
                  alt="Four-step onboarding: landing page, create account, sign in, and confirm email"
                  className="w-full h-auto block"
                  loading="lazy"
                />
              </div>

              <div className="mt-6 rounded-2xl border border-[hsl(210_30%_92%)] bg-white p-5 sm:p-6 flex items-start gap-4">
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(196_80%_96%)] text-primary ring-1 ring-[hsl(196_70%_88%)]">
                  <Lightbulb className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-foreground">Need Help?</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    If you experience issues with account creation, email verification, login, assessment access, or
                    results, use the floating Help button to contact support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Framework / Stats */}
        <section>
          <FrameworkStats />
        </section>

        {/* Feature cards */}
        <section className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-6xl rounded-[3rem] bg-[radial-gradient(ellipse_at_30%_40%,hsl(186_85%_60%/0.09),transparent_60%),radial-gradient(ellipse_at_70%_60%,hsl(210_90%_62%/0.08),transparent_65%),radial-gradient(ellipse_at_center,hsl(196_85%_58%/0.05),transparent_75%)] blur-3xl"
          />

          {/* Section header */}
          <div className="mb-16 sm:mb-20 flex flex-col items-center text-center space-y-5">
            <span className="text-[12px] font-semibold uppercase tracking-[0.28em] text-primary">Key Features</span>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-semibold tracking-tight text-foreground leading-[1.15] max-w-3xl">
              Designed for{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Business Impact
              </span>
            </h2>
            <div className="flex items-center gap-2 pt-2">
              {[
                "from-[hsl(196_45%_62%)] to-[hsl(186_38%_50%)]",
                "from-[hsl(204_42%_64%)] to-[hsl(190_38%_52%)]",
                "from-[hsl(190_40%_58%)] to-[hsl(196_42%_60%)]",
                "from-[hsl(186_38%_52%)] to-[hsl(198_42%_62%)]",
              ].map((g, i) => (
                <span key={i} className={`h-1 w-10 rounded-full bg-gradient-to-r ${g} opacity-80`} />
              ))}
            </div>
          </div>

          <div className="grid gap-y-14 gap-x-7 sm:gap-x-8 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "A",
                icon: Target,
                title: "Diagnostic",
                desc: "Pinpoint true performance gaps before designing solutions.",
                accent: "from-[#0D9488] via-[#14B8A6] to-[#5B6CFF]",
                bullets: ["Root-cause analysis", "Performance gap mapping", "Evidence-based diagnosis"],
              },
              {
                label: "B",
                icon: CheckCircle,
                title: "Comprehensive",
                desc: "Holistic view across business context, people, and constraints.",
                accent: "from-[#0D9488] via-[#14B8A6] to-[#5B6CFF]",

                bullets: ["Business & context insight", "People & process mapping", "End-to-end coverage"],
              },
              {
                label: "C",
                icon: FileText,
                title: "Actionable",
                desc: "Practical interventions — training and non-training — ready to deploy.",
                accent: "from-[#0D9488] via-[#2DD4BF] to-[#5B6CFF]",

                bullets: ["Training & non-training fixes", "Implementation roadmaps", "Stakeholder-ready outputs"],
              },
              {
                label: "D",
                icon: BarChart3,
                title: "Measurable",
                desc: "Track real outcomes with KPIs tied to business results.",
                accent: "from-[#0D9488] via-[#2DD4BF] to-[#5B6CFF]",

                bullets: ["Outcome-aligned metrics", "Behavior change tracking", "ROI-ready reporting"],
              },
            ].map(({ label, icon: Icon, title, desc, accent, bullets }) => (
              <div
                key={title}
                className="group relative flex h-full flex-col rounded-[26px] border border-[hsl(200_40%_94%)]/70 bg-white/70 backdrop-blur-xl px-6 pt-[88px] pb-6 sm:px-6 sm:pt-[92px] sm:pb-6 transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:bg-white/85 hover:border-[hsl(196_45%_85%)]/80 hover:shadow-[0_36px_80px_-30px_hsl(202_60%_45%/0.28),0_10px_30px_-12px_hsl(196_50%_55%/0.18)] overflow-visible antialiased"
              >
                {/* Floating circular letter badge */}
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-20">
                  <div
                    aria-hidden
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${accent} blur-xl opacity-40 scale-[1.35] group-hover:opacity-60 transition-opacity duration-700`}
                  />
                  <div
                    className={`relative flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gradient-to-br ${accent} text-white text-[17px] font-semibold shadow-[0_14px_28px_-10px_hsl(202_60%_38%/0.45),0_4px_12px_-4px_hsl(196_50%_45%/0.28),inset_0_1px_0_hsl(0_0%_100%/0.35)] ring-[5px] ring-white/95 group-hover:scale-105 group-hover:brightness-[1.06] transition-all duration-500 ease-out`}
                  >
                    {label}
                  </div>
                </div>

                {/* Trapezoid top tab with icon */}
                <div className="absolute top-0 left-0 right-0 z-10 flex justify-center pt-1">
                  <div
                    className={`relative flex items-end justify-center h-[52px] w-[78%] bg-gradient-to-br ${accent} text-white/95 shadow-[0_12px_26px_-14px_hsl(202_55%_38%/0.45),inset_0_1px_0_hsl(0_0%_100%/0.28),inset_0_-1px_0_hsl(0_0%_100%/0.08)] pb-2 group-hover:brightness-[1.05] transition-[filter] duration-500`}
                    style={{
                      clipPath: "polygon(8% 0, 92% 0, 100% 100%, 0 100%)",
                      borderRadius: "0 0 18px 18px",
                    }}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                  </div>
                </div>

                {/* Gradient sheen */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 rounded-[26px] bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500`}
                />

                <h3 className="relative text-center text-[17px] font-semibold tracking-tight text-foreground">
                  {title}
                </h3>
                <p className="relative mt-2 text-center text-[13.5px] leading-[1.55] text-muted-foreground/85">
                  {desc}
                </p>

                {/* Divider */}
                <div
                  aria-hidden
                  className="relative mx-auto mt-4 h-px w-10 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                />

                {/* Bullets */}
                <ul className="relative mt-4 space-y-2 flex-1">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-[13px] leading-[1.5] text-foreground/80">
                      <CheckCircle2 className="mt-[2px] h-[15px] w-[15px] shrink-0 text-primary" strokeWidth={2.25} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                {/* Bottom accent line */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute bottom-0 left-6 right-6 h-[2.5px] rounded-full bg-gradient-to-r ${accent} opacity-60 blur-[0.3px] group-hover:opacity-100 group-hover:left-4 group-hover:right-4 transition-all duration-500`}
                />
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="relative mx-auto w-full max-w-6xl">
          {/* Ambient background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_25%_30%,hsl(186_85%_60%/0.07),transparent_60%),radial-gradient(ellipse_at_75%_70%,hsl(210_90%_62%/0.07),transparent_65%)] blur-3xl"
          />

          {/* Header */}
          <div className="mb-14 sm:mb-16 flex flex-col items-center text-center space-y-5">
            <span className="text-[12px] font-semibold uppercase tracking-[0.28em] text-primary">How It Works</span>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-semibold tracking-tight text-foreground leading-[1.15] max-w-3xl">
              A Guided Journey from{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Diagnosis to Business Impact
              </span>
            </h2>
            <div className="flex items-center gap-2 pt-2">
              {[
                "from-[hsl(196_45%_62%)] to-[hsl(186_38%_50%)]",
                "from-[hsl(204_42%_64%)] to-[hsl(190_38%_52%)]",
                "from-[hsl(190_40%_58%)] to-[hsl(196_42%_60%)]",
                "from-[hsl(186_38%_52%)] to-[hsl(198_42%_62%)]",
              ].map((g, i) => (
                <span key={i} className={`h-1 w-10 rounded-full bg-gradient-to-r ${g} opacity-80`} />
              ))}
            </div>
          </div>

          {/* Stacked alternating cards */}
          <ol className="relative space-y-10 sm:space-y-14">
            {[
              {
                n: "01",
                title: "Diagnose Performance Gaps",
                desc: "Answer guided questions to uncover where workforce performance is falling short — mapping business context, people, processes, and constraints.",
                Icon: Target,
                grad: "from-[hsl(178_55%_56%)] via-[hsl(190_60%_54%)] to-[hsl(204_62%_56%)]",
                shadow: "hsl(190_55%_45%/0.32)",
                align: "left" as const,
              },
              {
                n: "02",
                title: "Identify Root Causes",
                desc: "Our AI consultant distinguishes between skill gaps, process issues, and structural barriers — so you target the right problem, not just symptoms.",
                Icon: Lightbulb,
                grad: "from-[hsl(196_62%_56%)] via-[hsl(210_66%_58%)] to-[hsl(222_62%_60%)]",
                shadow: "hsl(210_60%_48%/0.32)",
                align: "right" as const,
              },
              {
                n: "03",
                title: "Recommend Practical Solutions",
                desc: "Get tailored intervention recommendations — from training programs to operational fixes — prioritized by feasibility and expected business impact.",
                Icon: Rocket,
                grad: "from-[hsl(184_58%_54%)] via-[hsl(200_64%_56%)] to-[hsl(214_66%_60%)]",
                shadow: "hsl(200_58%_46%/0.32)",
                align: "left" as const,
              },
              {
                n: "04",
                title: "Measure Business Impact",
                desc: "Track success with outcome-aligned metrics that prove real change — behavior shift, operational improvement, and measurable ROI.",
                Icon: TrendingUp,
                grad: "from-[hsl(204_58%_56%)] via-[hsl(218_62%_58%)] to-[hsl(232_60%_60%)]",
                shadow: "hsl(218_55%_48%/0.32)",
                align: "right" as const,
              },
            ].map((s, i) => {
              const Icon = s.Icon;
              const isRight = s.align === "right";
              return (
                <li
                  key={s.n}
                  className={`group relative flex ${isRight ? "lg:justify-end" : "lg:justify-start"} opacity-0 animate-[fade-up_0.7s_ease-out_forwards]`}
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  <div className="relative w-full lg:w-[88%] xl:w-[82%]">
                    {/* Soft outer glow */}
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute -inset-2 -z-10 rounded-[28px] bg-gradient-to-br ${s.grad} opacity-[0.10] blur-2xl group-hover:opacity-[0.18] transition-opacity duration-500`}
                    />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 rounded-[24px] border border-[hsl(200_40%_93%)]/80 bg-white/80 backdrop-blur-xl px-6 sm:px-9 py-7 sm:py-8 shadow-[0_24px_60px_-30px_hsl(202_55%_45%/0.22),0_8px_20px_-10px_hsl(196_45%_50%/0.12)] hover:-translate-y-1.5 hover:shadow-[0_36px_80px_-30px_hsl(202_60%_45%/0.28),0_10px_30px_-12px_hsl(196_50%_55%/0.18)] hover:border-[hsl(196_45%_85%)]/80 transition-all duration-500 ease-out">
                      {/* Stacked layered STEP badge */}
                      <div className="relative shrink-0 h-[92px] w-[92px]">
                        {/* Soft ambient glow */}
                        <div
                          aria-hidden
                          className={`absolute -inset-3 rounded-[22px] bg-gradient-to-br ${s.grad} opacity-25 blur-xl`}
                        />
                        {/* Back layer */}
                        <div
                          aria-hidden
                          className={`absolute top-2 left-2 h-[84px] w-[84px] rounded-[18px] bg-gradient-to-br ${s.grad} opacity-30 shadow-[0_10px_24px_-12px_${s.shadow}]`}
                        />
                        {/* Mid layer */}
                        <div
                          aria-hidden
                          className={`absolute top-1 left-1 h-[84px] w-[84px] rounded-[18px] bg-gradient-to-br ${s.grad} opacity-60 shadow-[0_10px_24px_-12px_${s.shadow}]`}
                        />
                        {/* Front white card */}
                        <div
                          className={`relative flex h-[84px] w-[84px] flex-col items-center justify-center rounded-[18px] bg-white border border-[hsl(200_40%_92%)] shadow-[0_14px_30px_-12px_${s.shadow},0_4px_10px_-4px_hsl(196_40%_50%/0.15),inset_0_1px_0_hsl(0_0%_100%/0.9)]`}
                        >
                          <span
                            className={`text-[9px] font-semibold uppercase tracking-[0.2em] bg-gradient-to-r ${s.grad} bg-clip-text text-transparent leading-none`}
                          >
                            Step
                          </span>
                          <span
                            className={`mt-1 text-[28px] font-semibold leading-none bg-gradient-to-br ${s.grad} bg-clip-text text-transparent`}
                          >
                            {s.n}
                          </span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon
                            className={`h-5 w-5 bg-gradient-to-br ${s.grad} bg-clip-text`}
                            style={{ color: "hsl(196 60% 45%)" }}
                            strokeWidth={1.8}
                          />
                          <span className="h-px w-8 bg-gradient-to-r from-primary/30 to-transparent" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground leading-tight">
                          {s.title}
                        </h3>
                        <p className="mt-2.5 text-[14.5px] sm:text-[15px] leading-relaxed text-muted-foreground max-w-2xl">
                          {s.desc}
                        </p>
                      </div>

                      {/* Bottom accent line */}
                      <div
                        aria-hidden
                        className={`pointer-events-none absolute bottom-0 left-6 right-6 h-[2.5px] rounded-full bg-gradient-to-r ${s.grad} opacity-50 group-hover:opacity-90 group-hover:left-4 group-hover:right-4 transition-all duration-500`}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Final CTA */}
        <section className="relative py-20 sm:py-24">
          {/* Subtle ambient blur accents */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-72 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(186_80%_55%/0.06)] blur-3xl" />
            <div className="absolute left-[55%] top-1/2 h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(214_85%_60%/0.05)] blur-3xl" />
          </div>

          <div className="mx-auto w-full max-w-3xl text-center">
            {/* Icon badge with decorative lines */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-14 bg-gradient-to-r from-transparent to-[hsl(186_60%_70%/0.5)]" />
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(186_80%_55%/0.08)] border border-[hsl(186_60%_70%/0.25)]">
                <Sparkles className="h-5 w-5 text-[hsl(196_75%_45%)]" strokeWidth={1.75} />
              </div>
              <div className="h-px w-14 bg-gradient-to-l from-transparent to-[hsl(214_70%_70%/0.5)]" />
            </div>

            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0B132B] leading-[1.15]">
              Ready to Improve{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Workforce Performance
              </span>
              ?
            </h2>

            <p className="mt-5 text-base sm:text-lg text-[#6B7A90] max-w-xl mx-auto leading-relaxed">
              Start your assessment and get practical, business-aligned recommendations in minutes.
            </p>

            <div className="mt-10">
              <button
                onClick={handleStartAssessment}
                className="group inline-flex items-center gap-2 font-semibold text-black rounded-[14px] text-base bg-[#F59E0B] shadow-[0_8px_24px_rgba(245,158,11,0.28)] hover:-translate-y-0.5 hover:brightness-105 transition-all duration-300"
                style={{ padding: "16px 34px" }}
              >
                Start Your Assessment
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Feature highlights */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[#6B7A90]">
              {[
                { icon: ShieldCheck, label: "Data-driven recommendations" },
                { icon: Sparkles, label: "Takes only a few minutes" },
                { icon: CheckCircle, label: "Secure & confidential" },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-[hsl(196_60%_50%)]" strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </div>
                  {i < 2 && <span className="hidden sm:inline-block h-4 w-px bg-[hsl(210_20%_85%)]" />}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <ResponsibleAIModal
        open={consentOpen}
        onOpenChange={setConsentOpen}
        checked={consentChecked}
        onCheckedChange={setConsentChecked}
        onContinue={handleContinue}
      />
    </PageLayout>
  );
};

const FrameworkStats = () => {
  const stats = [
    {
      value: 5,
      suffix: "",
      label: "Diagnostic Areas",
      desc: "Holistic context across business, people, and processes.",
      icon: BarChart3,
    },
    {
      value: 8,
      suffix: "+",
      label: "Frameworks & Models",
      desc: "Grounded in performance consulting and learning science.",
      icon: BookOpen,
    },
    {
      value: 4,
      suffix: "",
      label: "Steps to Impact",
      desc: "A clear path from diagnosis to measurable business results.",
      icon: CheckCircle,
    },
  ];
  return (
    <div className="mx-auto w-full max-w-5xl space-y-12 sm:space-y-14">
      <div className="flex flex-col items-center text-center space-y-5">
        <span className="text-[12px] font-semibold uppercase tracking-[0.28em] text-primary">Our Framework</span>
        <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-semibold tracking-tight text-foreground leading-[1.15] max-w-3xl">
          Built on Proven{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Business Performance Frameworks
          </span>
        </h2>
        <div className="flex items-center gap-2 pt-2">
          {[
            "from-[hsl(196_45%_62%)] to-[hsl(186_38%_50%)]",
            "from-[hsl(204_42%_64%)] to-[hsl(190_38%_52%)]",
            "from-[hsl(190_40%_58%)] to-[hsl(196_42%_60%)]",
            "from-[hsl(186_38%_52%)] to-[hsl(198_42%_62%)]",
          ].map((g, i) => (
            <span key={i} className={`h-1 w-10 rounded-full bg-gradient-to-r ${g} opacity-80`} />
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-[hsl(210_30%_92%)] bg-white/90 backdrop-blur-sm shadow-[0_10px_40px_-20px_hsl(196_60%_45%/0.18)] px-4 sm:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x sm:divide-[hsl(210_30%_92%)] divide-y sm:divide-y-0 divide-[hsl(210_30%_92%)]">
          {stats.map(({ value, suffix, label, desc, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center text-center px-4 sm:px-6 py-8 sm:py-4">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(196_80%_96%)] text-primary ring-1 ring-[hsl(196_70%_88%)]">
                <Icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="text-5xl sm:text-[3.25rem] font-bold tracking-tight leading-none bg-gradient-to-b from-primary to-secondary bg-clip-text text-transparent">
                <CountUp end={value} />
                {suffix}
              </div>
              <div className="mt-3 text-[15px] font-semibold text-foreground">{label}</div>
              <p className="mt-2 max-w-[16rem] text-sm text-muted-foreground/80 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CountUp = ({ end, duration = 1000 }: { end: number; duration?: number }) => {
  const [value, setValue] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const started = React.useRef(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setValue(end);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setValue(Math.round(eased * end));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{value}</span>;
};

const ResponsibleAIModal = ({
  open,
  onOpenChange,
  checked,
  onCheckedChange,
  onContinue,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  onContinue: () => void;
}) => {
  const points = [
    "Avoid sharing sensitive personal or confidential information",
    "Outputs are guidance and should not be treated as final decisions",
    "AI-generated recommendations should be reviewed by stakeholders",
    "Ensure assessments are fair, unbiased, and context-aware",
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[22px] border border-[hsl(200_40%_92%)]/80 bg-white/95 backdrop-blur-xl p-0 overflow-hidden shadow-[0_40px_90px_-30px_hsl(202_60%_45%/0.35),0_10px_30px_-12px_hsl(196_50%_55%/0.2)] data-[state=open]:animate-[scale-in_0.25s_ease-out,fade-in_0.25s_ease-out]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(196_85%_60%/0.12),transparent_70%),radial-gradient(ellipse_at_bottom_right,hsl(210_90%_62%/0.08),transparent_75%)]"
        />
        <div className="px-7 pt-7 pb-6">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(190_60%_56%)] to-[hsl(210_66%_60%)] text-white shadow-[0_10px_24px_-10px_hsl(202_60%_38%/0.5),inset_0_1px_0_hsl(0_0%_100%/0.3)] ring-[4px] ring-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-[20px] font-semibold tracking-tight text-foreground">
                  Responsible AI &amp; Ethical Use
                </DialogTitle>
                <DialogDescription className="text-[13.5px] text-muted-foreground/85 mt-1">
                  A few things to keep in mind before starting your assessment.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ul className="mt-6 space-y-2.5">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-[13.5px] leading-[1.55] text-foreground/85">
                <CheckCircle2
                  className="mt-[2px] h-[16px] w-[16px] shrink-0 text-[hsl(196_55%_48%)]"
                  strokeWidth={2.25}
                />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <label className="mt-6 flex items-start gap-3 rounded-xl border border-[hsl(200_40%_92%)] bg-[hsl(196_70%_98%)]/60 px-4 py-3 cursor-pointer hover:border-[hsl(196_55%_80%)] transition-colors">
            <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} className="mt-[2px]" />
            <span className="text-[13.5px] leading-[1.5] text-foreground/85">
              I understand and agree to the responsible AI usage guidelines.
            </span>
          </label>
        </div>

        <DialogFooter className="flex-row justify-end gap-2 border-t border-[hsl(200_40%_94%)]/70 bg-[hsl(196_60%_98%)]/40 px-7 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10 px-5">
            Cancel
          </Button>
          <Button
            disabled={!checked}
            onClick={onContinue}
            className="h-10 px-5 gap-2 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/40 transition-all"
          >
            Continue to Assessment
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Index;
