"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FullScreenLayout, CelebrationScreen, TipBox } from "@/components";
import DailyQuote from "@/components/ui/DailyQuote";
import { ProgressDisplay } from "@/components/ui/ProgressDisplay";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { MilestoneInput } from "@/components/ui/MilestoneInput";
import { MilestoneItem } from "@/components/ui/MilestoneItem";
import { RatingScale } from "@/components/ui/RatingScale";
import { StepHeader } from "@/components/ui/StepHeader";
import { WizardHeader } from "@/components/ui/WizardHeader";
import { GoalCategory, createGoal, generateId } from "@/lib/storage";
import { Heart, Target, Ruler, BarChart3, Calendar, Pencil, Briefcase, PoundSterling, Home, Sprout, HeartPulse } from "lucide-react";

type WizardStep =
  | "why"         // Relevant
  | "category"    // Category
  | "title"       // Specific
  | "measurable"  // Measurable
  | "achievable"  // Achievable
  | "targetDate"  // Time-bound
  | "milestones"
  | "confirm"
  | "done";

interface MilestoneDraft {
  title: string;
  targetDate?: string;
}

interface GoalDraft {
  whyMatters: string;
  title: string;
  successCriteria: string;
  confidence: number | null;
  targetDate: string; // ISO date string
  category: GoalCategory;
  milestones: MilestoneDraft[];
}

/**
 * Goal creation wizard - SMART Framework
 * 
 * Flow: Why (Relevant) → Title (Specific) → Measurable → Achievable → Target Date (Time-bound) → Milestones → Done
 */
export default function NewGoalPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("category");
  const [draft, setDraft] = useState<GoalDraft>({
    whyMatters: "",
    title: "",
    successCriteria: "",
    confidence: null,
    targetDate: "",
    category: "Wellbeing",
    milestones: [],
  });

  const stepOrder: WizardStep[] = [
    "category",
    "title",
    "why",
    "measurable",
    "achievable",
    "targetDate",
    "milestones",
    "confirm",
  ];

  const currentStepIndex = stepOrder.indexOf(step);
  const totalSteps = stepOrder.length;

  const handleNext = () => {
    const nextStep = stepOrder[currentStepIndex + 1];
    if (nextStep) {
      setStep(nextStep);
    } else if (step === "confirm") {
      // Save goal
      createGoal({
        title: draft.title,
        category: draft.category,
        
        // SMART Fields
        whyMatters: draft.whyMatters,
        successCriteria: draft.successCriteria,
        confidence: draft.confidence || 3, // Default to middle if null (shouldn't happen due to validation)
        targetDate: draft.targetDate,
        
        // Legacy fields (required by type but not used in SMART flow)
        feelWhenDone: "",
        holdingBack: undefined,
        
        milestones: draft.milestones.map((m) => ({
          id: generateId(),
          title: m.title,
          targetDate: m.targetDate,
          completed: false,
        })),
        actions: [],
      });
      setStep("done");
    }
  };

  const handleBack = () => {
    const prevStep = stepOrder[currentStepIndex - 1];
    if (prevStep) {
      setStep(prevStep);
    } else {
      router.back();
    }
  };

  const canProceed = () => {
    switch (step) {
      case "why": return draft.whyMatters.trim().length > 0;
      case "category": return draft.category !== undefined;
      case "title": return draft.title.trim().length > 0;
      case "measurable": return draft.successCriteria.trim().length > 0;
      case "achievable": return draft.confidence !== null;
      case "targetDate": return draft.targetDate.length > 0;
      case "milestones": return draft.milestones.length > 0;
      case "confirm": return true;
      default: return false;
    }
  };

  const addMilestone = (milestone: MilestoneDraft) => {
    setDraft({ ...draft, milestones: [...draft.milestones, milestone] });
  };

  const removeMilestone = (index: number) => {
    setDraft({
      ...draft,
      milestones: draft.milestones.filter((_, i) => i !== index),
    });
  };

  if (step === "done") {
    return (
      <CelebrationScreen
        progress={100}
        title="Goal created!"
        subtitle={`You've set a goal with ${draft.milestones.length} milestone${draft.milestones.length !== 1 ? "s" : ""}. Time to take action!`}
        buttonText="Go to dashboard"
        onButtonClick={() => router.push("/")}
      />
    );
  }

  return (
    <FullScreenLayout bgClass="bg-white">
      <div className="flex-1 overflow-y-auto">
        <WizardHeader title="Create Goal" onCancel={() => router.back()} />
        
        <div className="max-w-sm lg:max-w-3xl mx-auto px-6 pb-6">

          {/* Progress display */}
          <ProgressDisplay 
            progress={Math.round((currentStepIndex / totalSteps) * 100)}
          />

          <div className="flex-1">
            {/* Step 1: Relevant (Why) */}
            {step === "why" && (
              <div className="space-y-6">
              <StepHeader
                title="Why does this goal matter to you?"
              />
                <TipBox>
                  Think about what achieving this goal will bring you, what does it change, how does it make you feel – the more detail, the better.
                </TipBox>
                
                <DailyQuote />
                
                <TextAreaField
                  label=""
                  placeholder="I want to achieve this because..."
                  value={draft.whyMatters}
                  onChange={(e) =>
                    setDraft({ ...draft, whyMatters: e.target.value })
                  }
                  autoFocus
                />
              </div>
            )}

            {/* Step 2: Category */}
            {step === "category" && (
              <div className="space-y-6">
              <StepHeader
                title="What area of life is this goal for?"
              />
                <TipBox>
                  Choose a category to help organise your goals.
                </TipBox>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: "Wellbeing" as GoalCategory, label: "Wellbeing", icon: HeartPulse },
                    { value: "Career" as GoalCategory, label: "Career", icon: Briefcase },
                    { value: "Finances" as GoalCategory, label: "Finances", icon: PoundSterling },
                    { value: "Growth" as GoalCategory, label: "Growth", icon: Sprout },
                    { value: "Family" as GoalCategory, label: "Family", icon: Home },
                  ]).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setDraft({ ...draft, category: value })}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                        draft.category === value
                          ? "border-[var(--color-magenta)] bg-[var(--color-magenta)]/5"
                          : "border-gray-200 hover:border-[var(--color-magenta)]/50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        draft.category === value
                          ? "bg-[var(--color-magenta)] text-white"
                          : "bg-warm-ivory text-brand-primary"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[var(--color-charcoal)]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Specific (Title) */}
            {step === "title" && (
              <div className="space-y-6">
              <StepHeader
                title="What is your specific goal?"
              />
                <TipBox>
                  Keep it clear and simple.
                </TipBox>
                <input
                  type="text"
                  placeholder="e.g., Run a 5K race"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  autoFocus
                  className="w-full px-4 py-3 text-base text-[var(--color-charcoal)] bg-white rounded-2xl border-2 border-gray-200 focus:border-[var(--color-magenta)] focus:outline-none placeholder:text-gray-400 transition-colors"
                />
              </div>
            )}

            {/* Step 3: Measurable */}
            {step === "measurable" && (
              <div className="space-y-6">
              <StepHeader
                title="Decide how progress will be tracked."
              />
                <TextAreaField
                  label=""
                  placeholder="examples: apply for 3 jobs, complete 1 online accredited course, secure 1 interview"
                  value={draft.successCriteria}
                  onChange={(e) =>
                    setDraft({ ...draft, successCriteria: e.target.value })
                  }
                  autoFocus
                />
              </div>
            )}

            {/* Step 4: Achievable */}
            {step === "achievable" && (
              <div className="space-y-6">
              <StepHeader
                title="Is this achievable for you right now?"
              />
                <TipBox>
                  Rate your confidence level. If it&apos;s low, consider scaling back.
                </TipBox>
                
                <div className="py-4">
                  <RatingScale
                    value={draft.confidence}
                    onChange={(val) => setDraft({ ...draft, confidence: val })}
                    question="How confident are you that you can achieve this goal?"
                    lowLabel="Not confident"
                    highLabel="Very confident"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Time-bound */}
            {step === "targetDate" && (
              <div className="space-y-6">
              <StepHeader
                title="When would you like to achieve this by?"
              />
                <TipBox>
                  A deadline helps you stay focused and track your progress.
                </TipBox>

                {/* Suggested timeframes */}
                <div className="space-y-3">
                  <p className="text-sm text-[var(--color-text-muted)]">Quick options:</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "1 month", months: 1 },
                      { label: "3 months", months: 3 },
                      { label: "6 months", months: 6 },
                    ].map(({ label, months }) => {
                      const date = new Date();
                      date.setMonth(date.getMonth() + months);
                      const isoDate = date.toISOString().split("T")[0];
                      const isSelected = draft.targetDate === isoDate;

                      return (
                        <button
                          key={label}
                          onClick={() =>
                            setDraft({ ...draft, targetDate: isoDate })
                          }
                          className={`px-4 py-3 rounded-xl text-sm font-normal transition-all ${
                            isSelected
                              ? "bg-[var(--color-magenta)] text-white"
                              : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[var(--color-magenta)]"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom date picker */}
                <div className="space-y-2">
                  <label className="block text-sm text-[var(--color-text-muted)]">
                    Or pick a custom date:
                  </label>
                  <input
                    type="date"
                    value={draft.targetDate}
                    onChange={(e) =>
                      setDraft({ ...draft, targetDate: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 text-base text-[var(--color-charcoal)] bg-white rounded-2xl border-2 border-gray-200 focus:border-[var(--color-magenta)] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Milestones */}
            {step === "milestones" && (
              <div className="space-y-6">
              <StepHeader
                title="Let's break it down"
              />
                <TipBox>
                  Create your first milestone to get started. Aim for something you can do in 1-2 weeks.
                </TipBox>

                <MilestoneInput onAdd={addMilestone} />

                {draft.milestones.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-[var(--color-charcoal)]">
                      Your milestones ({draft.milestones.length}):
                    </p>
                    <div className="space-y-2">
                      {draft.milestones.map((milestone, index) => (
                        <MilestoneItem
                          key={index}
                          title={milestone.title}
                          targetDate={milestone.targetDate}
                          onRemove={() => removeMilestone(index)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 7: Confirm */}
            {step === "confirm" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl text-[var(--color-charcoal)] mb-2">
                    Review your Goal
                  </h1>
                  <p className="text-[var(--color-text-muted)]">
                    Make sure your goals are clearly defined and achievable.
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* What (Goal Title) */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 aspect-square flex flex-col relative group cursor-pointer hover:border-[var(--color-magenta)]/30 transition-colors" onClick={() => setStep("title")}>
                    <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center justify-center gap-1 mb-2">
                      <Target className="w-3 h-3" /> What
                    </p>
                    <div className="flex-1 flex items-center justify-center">
                      <h2 className="text-lg text-[var(--color-charcoal)] font-medium break-words leading-tight line-clamp-4 text-center">
                        {draft.title}
                      </h2>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <Pencil className="w-4 h-4 text-[var(--color-magenta)]" />
                    </div>
                  </div>

                  {/* Why */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 aspect-square flex flex-col relative group cursor-pointer hover:border-[var(--color-magenta)]/30 transition-colors" onClick={() => setStep("why")}>
                    <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center justify-center gap-1 mb-2">
                      <Heart className="w-3 h-3" /> Why
                    </p>
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-sm text-[var(--color-charcoal)] break-words leading-snug line-clamp-5 text-center">
                        {draft.whyMatters}
                      </p>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <Pencil className="w-4 h-4 text-[var(--color-magenta)]" />
                    </div>
                  </div>

                  {/* How You'll Know */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 aspect-square flex flex-col relative group cursor-pointer hover:border-[var(--color-magenta)]/30 transition-colors" onClick={() => setStep("measurable")}>
                    <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center justify-center gap-1 mb-2">
                      <Ruler className="w-3 h-3" /> How You&apos;ll Know
                    </p>
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-sm text-[var(--color-charcoal)] break-words leading-snug line-clamp-5 text-center">
                        {draft.successCriteria}
                      </p>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <Pencil className="w-4 h-4 text-[var(--color-magenta)]" />
                    </div>
                  </div>

                  {/* Readiness */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 aspect-square flex flex-col relative group cursor-pointer hover:border-[var(--color-magenta)]/30 transition-colors" onClick={() => setStep("achievable")}>
                    <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center justify-center gap-1 mb-2">
                      <BarChart3 className="w-3 h-3" /> Readiness
                    </p>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <span className="block text-4xl font-semibold text-[var(--color-charcoal)] mb-1">
                          {draft.confidence}
                          <span className="text-lg text-[var(--color-text-muted)] font-normal">
                            /5
                          </span>
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          confidence
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <Pencil className="w-4 h-4 text-[var(--color-magenta)]" />
                    </div>
                  </div>

                  {/* When */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 aspect-square flex flex-col relative group cursor-pointer hover:border-[var(--color-magenta)]/30 transition-colors" onClick={() => setStep("targetDate")}>
                    <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center justify-center gap-1 mb-2">
                      <Calendar className="w-3 h-3" /> When
                    </p>
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-lg text-[var(--color-charcoal)] leading-tight text-center">
                        {new Date(draft.targetDate).toLocaleDateString(
                          "en-AU",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </p>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <Pencil className="w-4 h-4 text-[var(--color-magenta)]" />
                    </div>
                  </div>

                  {/* First Steps (Milestones count only) */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 aspect-square flex flex-col relative group cursor-pointer hover:border-[var(--color-magenta)]/30 transition-colors" onClick={() => setStep("milestones")}>
                    <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center justify-center gap-1 mb-2">
                      <Target className="w-3 h-3" /> First Steps
                    </p>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <span className="block text-4xl font-semibold text-[var(--color-charcoal)] mb-1">
                          {draft.milestones.length}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {draft.milestones.length === 1 ? "milestone" : "milestones"}
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <Pencil className="w-4 h-4 text-[var(--color-magenta)]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contextual Action Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {/* Back */}
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              currentStepIndex === 0 
                ? "text-gray-300 cursor-not-allowed" 
                : "text-gray-400 hover:text-brand-primary"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <span className="text-xs mt-1">Back</span>
          </button>
          
          {/* Progress indicator */}
          <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
            <span className="text-sm font-medium text-brand-primary">{currentStepIndex + 1}/{totalSteps}</span>
            <span className="text-xs mt-0.5">Steps</span>
          </div>
          
          {/* Next/Create */}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              canProceed() 
                ? "text-brand-primary" 
                : "text-gray-300 cursor-not-allowed"
            }`}
          >
            {step === "confirm" ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span className="text-xs mt-1 font-medium">Create</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
                <span className="text-xs mt-1">Next</span>
              </>
            )}
          </button>
        </div>
      </nav>
    </FullScreenLayout>
  );
}
