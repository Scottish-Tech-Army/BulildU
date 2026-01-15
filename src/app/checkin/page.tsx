"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { RatingScale } from "@/components/ui/RatingScale";
import { GoalProgressCard } from "@/components/ui/GoalProgressCard";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { ProgressDisplay } from "@/components/ui/ProgressDisplay";
import { StepHeader } from "@/components/ui/StepHeader";
import { CelebrationScreen } from "@/components/ui/CelebrationScreen";
import { BackButton } from "@/components/ui/BackButton";
import {
  Goal,
  getGoals,
  toggleMilestone,
  saveCheckIn,
  getMomentumDays,
} from "@/lib/storage";

type CheckInStep = "energy" | "goals" | "reflection" | "celebration";

interface CheckInDraft {
  energyLevel: number;
  reflection: string;
  milestonesCompleted: string[];
}

/**
 * Weekly Check-in Wizard
 *
 * Flow: Energy → Goals → Reflection → Celebration
 */
export default function CheckInPage() {
  const router = useRouter();
  const [step, setStep] = useState<CheckInStep>("energy");
  const [goals, setGoals] = useState<Goal[]>(() =>
    getGoals().filter((g) => g.status === "active")
  );
  const [draft, setDraft] = useState<CheckInDraft>({
    energyLevel: 0,
    reflection: "",
    milestonesCompleted: [],
  });
  const [momentumDays, setMomentumDays] = useState(0);

  // Build the actual step order based on whether there are goals
  const stepOrder: CheckInStep[] = goals.length > 0 
    ? ["energy", "goals", "reflection", "celebration"]
    : ["energy", "reflection", "celebration"];
  
  const currentStepIndex = stepOrder.indexOf(step);
  const totalSteps = stepOrder.length - 1; // Exclude celebration as it's the end screen

  const handleNext = () => {
    if (step === "energy") {
      if (goals.length > 0) {
        setStep("goals");
      } else {
        setStep("reflection");
      }
    } else if (step === "goals") {
      setStep("reflection");
    } else if (step === "reflection") {
      // Save the check-in
      saveCheckIn({
        date: new Date().toISOString().split("T")[0],
        energyLevel: draft.energyLevel,
        reflection: draft.reflection || undefined,
        milestonesCompleted: draft.milestonesCompleted,
      });
      // Get updated momentum
      setMomentumDays(getMomentumDays());
      setStep("celebration");
    }
  };

  const handleBack = () => {
    if (step === "goals") setStep("energy");
    else if (step === "reflection") {
      if (goals.length > 0) {
        setStep("goals");
      } else {
        setStep("energy");
      }
    } else router.back();
  };

  const handleMilestoneToggle = (goalId: string, milestoneId: string) => {
    // Toggle in storage
    toggleMilestone(goalId, milestoneId);

    // Toggle in local state
    setGoals(getGoals().filter((g) => g.status === "active"));

    // Track completed milestones
    setDraft((prev) => {
      const isCompleting = !goals
        .find((g) => g.id === goalId)
        ?.milestones.find((m) => m.id === milestoneId)?.completed;

      if (isCompleting) {
        return {
          ...prev,
          milestonesCompleted: [...prev.milestonesCompleted, milestoneId],
        };
      } else {
        return {
          ...prev,
          milestonesCompleted: prev.milestonesCompleted.filter(
            (id) => id !== milestoneId
          ),
        };
      }
    });
  };

  const canProceed = () => {
    if (step === "energy") return draft.energyLevel > 0;
    if (step === "goals") return true; // Can proceed without toggling any
    if (step === "reflection") return draft.reflection.trim().length > 0;
    return false;
  };

  // Celebration screen
  if (step === "celebration") {
    const completedThisSession = draft.milestonesCompleted.length;

    return (
      <CelebrationScreen
        progress={100}
        title="Great check-in!"
        subtitle={
          completedThisSession > 0
            ? `You completed ${completedThisSession} milestone${completedThisSession !== 1 ? "s" : ""} this week!`
            : "Keep up the great work. Small steps lead to big changes."
        }
        buttonText="Back to dashboard"
        onButtonClick={() => router.push("/")}
      >
        {momentumDays > 0 && (
          <div className="border border-white/50 rounded-2xl px-8 py-6 text-center">
            <p className="text-white/70 text-xs uppercase tracking-widest mb-2">
              Momentum
            </p>
            <p className="text-5xl text-white font-bold mb-1 flex items-center justify-center gap-2">
              <Flame className="w-10 h-10" />
              {momentumDays}
            </p>
            <p className="text-white/80 text-sm">
              week{momentumDays !== 1 ? "s" : ""} in a row
            </p>
          </div>
        )}
      </CelebrationScreen>
    );
  }

  return (
    <div className="min-h-dvh bg-brand-surface flex flex-col">
      {/* Header with back button and progress */}
      <div className="px-6 pt-6 mb-6">
        <header className="flex items-center gap-3 mb-4">
          <BackButton onClick={handleBack} />
          <h1 className="text-2xl text-[var(--color-charcoal)]">Weekly Check-in</h1>
        </header>
        <ProgressDisplay
          progress={Math.round((currentStepIndex / totalSteps) * 100)}
          label={`Step ${currentStepIndex + 1} of ${totalSteps}`}
        />
      </div>

      <div className="flex-1 px-6 pt-6 pb-8 flex flex-col">
        <div className="flex-1">
          {/* Step: Energy Check */}
          {step === "energy" && (
            <div className="space-y-8">
              <StepHeader
                title="How's your energy this week?"
                subtitle="Take a moment to check in with yourself."
              />

              <RatingScale
                value={draft.energyLevel}
                onChange={(value) =>
                  setDraft({ ...draft, energyLevel: value })
                }
                lowLabel="Running on empty"
                highLabel="Fully charged"
              />

              {draft.energyLevel > 0 && draft.energyLevel <= 2 && (
                <div className="bg-warm-ivory rounded-xl p-4">
                  <p className="text-sm text-[var(--color-charcoal)]">
                    It&apos;s okay to have low days. Be gentle with yourself
                    this week.
                  </p>
                </div>
              )}

              {draft.energyLevel >= 4 && (
                <div className="bg-warm-ivory rounded-xl p-4">
                  <p className="text-sm text-[var(--color-charcoal)]">
                    Great energy! This is a perfect time to tackle those
                    milestones.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step: Goal Progress */}
          {step === "goals" && (
            <div className="space-y-6">
              <StepHeader
                title="Review your progress"
                subtitle="Mark any milestones you've completed this week."
              />

              <div className="space-y-4">
                {goals.map((goal) => (
                  <GoalProgressCard
                    key={goal.id}
                    goal={goal}
                    onMilestoneToggle={(milestoneId) =>
                      handleMilestoneToggle(goal.id, milestoneId)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step: Reflection */}
          {step === "reflection" && (
            <div className="space-y-6">
              <StepHeader
                title="What went well this week?"
                subtitle="Celebrating small wins builds momentum."
              />

              <TextAreaField
                label=""
                placeholder="I'm proud that I..."
                value={draft.reflection}
                onChange={(e) =>
                  setDraft({ ...draft, reflection: e.target.value })
                }
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="space-y-3 pt-6">
          <PrimaryButton onClick={handleNext} disabled={!canProceed()}>
            {step === "reflection" ? "Complete check-in" : "Next"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
