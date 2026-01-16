"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  getGoals, 
  saveCheckIn, 
  Goal, 
  toggleStep 
} from "@/lib/storage";
import { 
  TrendingUp, 
  MessageSquare, 
  Sparkles,
  Heart
} from "lucide-react";
import { FullScreenLayout } from "@/components/layouts/FullScreenLayout";
import { WizardHeader } from "@/components/ui/WizardHeader";
import { AppButton } from "@/components/ui/AppButton";
import { GoalProgressCard } from "@/components/ui/GoalProgressCard";
import { CelebrationScreen } from "@/components/ui/CelebrationScreen";

/**
 * Weekly Check-in Wizard
 * 
 * Steps:
 * 1. Energy - How are you feeling overall?
 * 2. Progress - Which steps did you complete?
 * 3. Reflection - What went well?
 * 4. Done - Celebration!
 */

interface CheckInDraft {
  energyLevel: number;
  reflection: string;
  stepsCompleted: string[];
}

export default function CheckInPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [draft, setDraft] = useState<CheckInDraft>({
    energyLevel: 3,
    reflection: "",
    stepsCompleted: [],
  });

  // Load goals once on mount
  useEffect(() => {
    const activeGoals = getGoals().filter((g) => g.status === "active");
    setGoals(activeGoals);
  }, []);

  const handleStepToggle = (goalId: string, stepId: string) => {
    // Toggle in storage
    toggleStep(goalId, stepId);

    // Refresh local goals state
    const updatedGoals = getGoals().filter((g) => g.status === "active");
    setGoals(updatedGoals);

    // Track completed steps for the check-in record
    setDraft((prev) => {
      const selectedGoal = updatedGoals.find((g) => g.id === goalId);
      const targetStep = selectedGoal?.steps.find((s) => s.id === stepId);
      const isCompleting = targetStep?.completed ?? false;

      if (isCompleting) {
        return {
          ...prev,
          stepsCompleted: [...prev.stepsCompleted, stepId],
        };
      } else {
        return {
          ...prev,
          stepsCompleted: prev.stepsCompleted.filter(
            (id) => id !== stepId
          ),
        };
      }
    });
  };

  const handleFinish = () => {
    saveCheckIn({
      date: new Date().toISOString().split("T")[0],
      energyLevel: draft.energyLevel,
      reflection: draft.reflection,
      stepsCompleted: draft.stepsCompleted,
    });
    setStep(4);
  };

  if (step === 4) {
    return (
      <CelebrationScreen
        title="Check-in Complete!"
        subtitle="You're showing up for yourself and that's what counts."
        onButtonClick={() => router.push("/")}
        buttonText="GO TO DASHBOARD"
        icon={Sparkles}
      />
    );
  }

  return (
    <FullScreenLayout bgClass="bg-white">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <WizardHeader 
          title="Weekly Check-in" 
          onCancel={() => router.push("/")} 
        />
        
        <div className="max-w-5xl mx-auto px-6 pt-8 pb-32 w-full">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex gap-2 flex-1">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s}
                  className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                    s <= step ? "bg-brand-primary" : "bg-gray-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-10">
            {/* Step 1: Energy */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto text-center">
                <div className="flex flex-col items-center gap-4 mb-2">
                  <div className="w-20 h-20 rounded-3xl bg-brand-primary/10 flex items-center justify-center">
                    <Heart className="w-10 h-10 text-brand-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">How&apos;s your energy?</h2>
                    <p className="text-gray-500 mt-2">Check in with yourself before checking in with your goals.</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 pt-4">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDraft({ ...draft, energyLevel: level })}
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl font-bold text-xl md:text-2xl transition-all ${
                        draft.energyLevel === level
                          ? "bg-brand-primary text-white scale-110"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                
                <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest px-4">
                  <span>Very Low</span>
                  <span>Feeling Great</span>
                </div>
              </div>
            )}

            {/* Step 2: Progress */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-2 max-w-xl mx-auto text-center flex-col">
                  <div className="w-20 h-20 rounded-3xl bg-brand-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-10 h-10 text-brand-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">What did you achieve?</h2>
                    <p className="text-gray-500 mt-2">Celebrate the steps you took this week, no matter how small.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {goals.map((goal) => (
                    <GoalProgressCard
                      key={goal.id}
                      goal={goal}
                      onStepToggle={(stepId) => handleStepToggle(goal.id, stepId)}
                    />
                  ))}
                  
                  {goals.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                      <p className="text-gray-400">No active goals to check in on.</p>
                      <button 
                        onClick={() => router.push("/goals/new")}
                        className="mt-4 text-brand-primary font-bold hover:underline"
                      >
                        Set a new goal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Reflection */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto text-center">
                <div className="flex flex-col items-center gap-4 mb-2">
                  <div className="w-20 h-20 rounded-3xl bg-brand-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-brand-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Weekly Reflection</h2>
                    <p className="text-gray-500 mt-2">What did you learn? What would you do differently next week?</p>
                  </div>
                </div>

                <textarea
                  autoFocus
                  value={draft.reflection}
                  onChange={(e) => setDraft({ ...draft, reflection: e.target.value })}
                  placeholder="It felt good to start that habit... or, busy week, need to refocus..."
                  className="w-full min-h-[200px] p-8 rounded-[2.5rem] bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 text-gray-900 text-lg resize-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 p-6 z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={() => step > 1 ? setStep((s) => (s - 1) as any) : router.push("/")}
            className="flex items-center gap-2 px-6 py-4 rounded-full text-brand-primary font-bold hover:bg-brand-primary/5 transition-colors"
          >
            <TrendingUp className="w-5 h-5 rotate-180" />
            BACK
          </button>
          
          <AppButton
            onClick={() => step === 3 ? handleFinish() : setStep((s) => (s + 1) as any)}
            className="flex-1 group"
          >
            <span className="flex items-center justify-center gap-2">
              {step === 3 ? (
                <>FINISH CHECK-IN <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" /></>
              ) : (
                <>CONTINUE <Sparkles className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </span>
          </AppButton>
        </div>
      </div>
    </FullScreenLayout>
  );
}
