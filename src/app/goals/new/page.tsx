"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FullScreenLayout, PrimaryButton, CelebrationScreen } from "@/components";
import { BackButton } from "@/components/ui/BackButton";
import { ProgressDisplay } from "@/components/ui/ProgressDisplay";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { MilestoneInput } from "@/components/ui/MilestoneInput";
import { MilestoneItem } from "@/components/ui/MilestoneItem";
import { RatingScale } from "@/components/ui/RatingScale";
import { GoalCategory, createGoal, generateId } from "@/lib/storage";
import { Lightbulb, Heart, Target, Ruler, BarChart3, Calendar, Pencil, Briefcase, DollarSign, Home, Sprout, HeartPulse } from "lucide-react";

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
  const [step, setStep] = useState<WizardStep>("why");
  const [draft, setDraft] = useState<GoalDraft>({
    whyMatters: "",
    title: "",
    successCriteria: "",
    confidence: null,
    targetDate: "",
    category: "Growth",
    milestones: [],
  });

  const stepOrder: WizardStep[] = [
    "why",
    "category",
    "title",
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
        {/* Back button - outside centered container to stay at far left */}
        <div className="px-6 pt-6 pb-2">
          <BackButton onClick={handleBack} />
        </div>
        
        <div className="max-w-sm lg:max-w-2xl mx-auto px-6 pb-6">

          {/* Progress display */}
          <ProgressDisplay 
            progress={Math.round((currentStepIndex / totalSteps) * 100)}
            label={`Step ${currentStepIndex + 1} of ${totalSteps}`}
          />

          <div className="flex-1">
            {/* Step 1: Relevant (Why) */}
            {step === "why" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl text-[var(--color-charcoal)] mb-2">
                    Why does this goal matter to you?
                  </h1>
                  <p className="text-[var(--color-text-muted)]">
                    (Relevant) Understanding your &quot;why&quot; helps you stay motivated when things get tough.
                  </p>
                </div>
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
                <div>
                  <h1 className="text-2xl text-[var(--color-charcoal)] mb-2">
                    What area of life is this goal for?
                  </h1>
                  <p className="text-[var(--color-text-muted)]">
                    Choose a category to help organise your goals.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: "Health" as GoalCategory, label: "Health", icon: HeartPulse },
                    { value: "Career" as GoalCategory, label: "Career", icon: Briefcase },
                    { value: "Money" as GoalCategory, label: "Money", icon: DollarSign },
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
                <div>
                  <h1 className="text-2xl text-[var(--color-charcoal)] mb-2">
                    What is your specific goal?
                  </h1>
                  <p className="text-[var(--color-text-muted)]">
                    (Specific) Keep it clear and simple. You can add more details later.
                  </p>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="e.g., Run a 5K race"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    autoFocus
                    className="w-full px-4 py-3 text-base text-[var(--color-charcoal)] bg-white rounded-2xl border-2 border-gray-200 focus:border-[var(--color-magenta)] focus:outline-none placeholder:text-gray-400 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Measurable */}
            {step === "measurable" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl text-[var(--color-charcoal)] mb-2">
                    How will you know you&apos;ve achieved it?
                  </h1>
                  <p className="text-[var(--color-text-muted)]">
                    (Measurable) Define what success looks like.
                  </p>
                </div>
                <TextAreaField
                  label=""
                  placeholder="I will know I've succeeded when..."
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
                <div>
                  <h1 className="text-2xl text-[var(--color-charcoal)] mb-2">
                    Is this achievable for you right now?
                  </h1>
                  <p className="text-[var(--color-text-muted)]">
                    (Achievable) Rate your confidence level. If it&apos;s low, consider scaling back.
                  </p>
                </div>
                
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
                <div>
                  <h1 className="text-2xl text-[var(--color-charcoal)] mb-2">
                    When would you like to achieve this by?
                  </h1>
                  <p className="text-[var(--color-text-muted)]">
                    (Time-bound) A deadline helps you stay focused.
                  </p>
                </div>

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
                <div>
                  <h1 className="text-2xl text-[var(--color-charcoal)] mb-2">
                    Let&apos;s break it down
                  </h1>
                  <p className="text-[var(--color-text-muted)]">
                    Create your first milestone to get started. Aim for something you can do in 1-2 weeks.
                  </p>
                </div>

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

                {/* Helpful tip */}
                {draft.milestones.length === 0 && (
                  <div className="bg-[var(--color-magenta)]/5 rounded-xl p-4 flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-[var(--color-magenta)] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[var(--color-charcoal)]">
                      <strong>Tip:</strong> Good milestones are specific and time-bound.
                    </p>
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
                    Make sure clearly defined and achievable.
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Specific (Goal Title) */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 aspect-square flex flex-col relative group cursor-pointer hover:border-[var(--color-magenta)]/30 transition-colors" onClick={() => setStep("title")}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center gap-1">
                        <Target className="w-3 h-3" /> Specific
                      </p>
                    </div>
                    <div className="flex-1 flex items-center">
                      <h2 className="text-lg text-[var(--color-charcoal)] font-medium break-words leading-tight line-clamp-4">
                        {draft.title}
                      </h2>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <Pencil className="w-4 h-4 text-[var(--color-magenta)]" />
                    </div>
                  </div>

                  {/* Relevant (Why) */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 aspect-square flex flex-col relative group cursor-pointer hover:border-[var(--color-magenta)]/30 transition-colors" onClick={() => setStep("why")}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center gap-1">
                        <Heart className="w-3 h-3" /> Relevant
                      </p>
                    </div>
                    <p className="text-sm text-[var(--color-charcoal)] break-words leading-snug line-clamp-5">
                      {draft.whyMatters}
                    </p>
                    <div className="absolute bottom-3 right-3">
                      <Pencil className="w-4 h-4 text-[var(--color-magenta)]" />
                    </div>
                  </div>

                  {/* Measurable */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 aspect-square flex flex-col relative group cursor-pointer hover:border-[var(--color-magenta)]/30 transition-colors" onClick={() => setStep("measurable")}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center gap-1">
                        <Ruler className="w-3 h-3" /> Measurable
                      </p>
                    </div>
                    <p className="text-sm text-[var(--color-charcoal)] break-words leading-snug line-clamp-5">
                      {draft.successCriteria}
                    </p>
                    <div className="absolute bottom-3 right-3">
                      <Pencil className="w-4 h-4 text-[var(--color-magenta)]" />
                    </div>
                  </div>

                  {/* Achievable */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 aspect-square flex flex-col relative group cursor-pointer hover:border-[var(--color-magenta)]/30 transition-colors" onClick={() => setStep("achievable")}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" /> Achievable
                      </p>
                    </div>
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

                  {/* Time-bound */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 aspect-square flex flex-col relative group cursor-pointer hover:border-[var(--color-magenta)]/30 transition-colors" onClick={() => setStep("targetDate")}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Time-bound
                      </p>
                    </div>
                    <div className="flex-1 flex items-center">
                      <p className="text-lg text-[var(--color-charcoal)] leading-tight text-center w-full">
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

                  {/* Milestones */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 aspect-square flex flex-col relative group cursor-pointer hover:border-[var(--color-magenta)]/30 transition-colors" onClick={() => setStep("milestones")}>
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center gap-1">
                        <Target className="w-3 h-3" /> Action Plan
                      </p>
                    </div>
                    <div className="space-y-2 flex-1 overflow-hidden">
                      {draft.milestones.slice(0, 2).map((m, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-[var(--color-charcoal)]"
                        >
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-magenta)]/10 text-[var(--color-magenta)] flex items-center justify-center text-[10px] font-bold">
                            {i + 1}
                          </span>
                          <span className="break-words line-clamp-2 leading-snug">{m.title}</span>
                        </div>
                      ))}
                      {draft.milestones.length > 2 && (
                        <p className="text-[10px] text-[var(--color-text-muted)] pl-7 mt-1">
                          +{draft.milestones.length - 2} more steps...
                        </p>
                      )}
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

      <FullScreenLayout.Footer>
        <PrimaryButton onClick={handleNext} disabled={!canProceed()}>
          {step === "confirm" ? "Confirm & Create Goal" : "Next"}
        </PrimaryButton>
      </FullScreenLayout.Footer>
    </FullScreenLayout>
  );
}
