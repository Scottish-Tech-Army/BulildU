"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppButton } from "@/components/ui/AppButton";
import { Goal, createGoal, GoalCategory, Step } from "@/lib/storage";
import { FullScreenLayout } from "@/components/layouts/FullScreenLayout";
import { WizardHeader } from "@/components/ui/WizardHeader";
import { StepInput } from "@/components/ui/StepInput";
import { StepItem } from "@/components/ui/StepItem";
import { 
  Target, 
  Sparkles, 
  Calendar, 
  Heart,
  AlertCircle,
  TrendingUp,
  BarChart3,
  ListTodo,
  Ruler
} from "lucide-react";

type GoalCreationStep = 
  | "why" 
  | "title" 
  | "measurable" 
  | "achievable" 
  | "date" 
  | "steps" 
  | "done";

interface StepDraft {
  title: string;
  targetDate?: string;
}

interface FullGoalDraft {
  title: string;
  category: GoalCategory;
  whyMatters: string;
  successCriteria: string;
  confidence: number | null;
  targetDate: string;
  steps: StepDraft[];
}

/**
 * Goal Creation Wizard
 * 
 * Flow: Why (Relevant) → Title (Specific) → Measurable → Achievable → Target Date (Time-bound) → Steps → Done
 */
export default function NewGoalPage() {
  const router = useRouter();
  const [step, setStep] = useState<GoalCreationStep>("why");
  const [draft, setDraft] = useState<FullGoalDraft>({
    title: "",
    category: "Personal",
    whyMatters: "",
    successCriteria: "",
    confidence: null,
    targetDate: "",
    steps: [],
  });

  const STEPS_ORDER: GoalCreationStep[] = [
    "why",
    "title",
    "measurable",
    "achievable",
    "date",
    "steps",
    "done"
  ];

  const currentIndex = STEPS_ORDER.indexOf(step);
  const totalStepsCount = STEPS_ORDER.length - 1; // Exclude 'done'

  const handleNext = () => {
    const nextStep = STEPS_ORDER[currentIndex + 1];
    if (nextStep) setStep(nextStep);
  };

  const handleBack = () => {
    const prevStep = STEPS_ORDER[currentIndex - 1];
    if (prevStep) setStep(prevStep);
    else router.back();
  };

  const handleSave = () => {
    const newGoalData: Omit<Goal, "id" | "createdAt" | "status" | "steps"> & { steps: Step[] } = {
      title: draft.title,
      category: draft.category,
      whyMatters: draft.whyMatters,
      successCriteria: draft.successCriteria,
      confidence: draft.confidence || 3,
      targetDate: draft.targetDate,
      steps: draft.steps.map(s => ({
        ...s,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        completed: false
      })),
      feelWhenDone: "", 
      actions: []
    };
    
    createGoal(newGoalData);
    setStep("done");
  };

  const updateDraft = (key: keyof FullGoalDraft, value: string | number | StepDraft[] | null) => {
    setDraft({ ...draft, [key]: value });
  };

  const canProceed = () => {
    switch (step) {
      case "why": return draft.whyMatters.trim().length >= 5;
      case "title": return draft.title.trim().length >= 3;
      case "measurable": return !!draft.successCriteria?.trim();
      case "achievable": return draft.confidence !== null;
      case "date": return !!draft.targetDate;
      case "steps": return draft.steps.length > 0;
      default: return true;
    }
  };

  const addStep = (s: StepDraft) => {
    setDraft({ ...draft, steps: [...draft.steps, s] });
  };

  const removeStep = (index: number) => {
    setDraft({
      ...draft,
      steps: draft.steps.filter((_, i) => i !== index),
    });
  };

  if (step === "done") {
    return (
      <FullScreenLayout bgClass="bg-white">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <Sparkles className="w-12 h-12 text-brand-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Goal Locked In!</h1>
          <p className="text-gray-500 mb-10 max-w-md text-lg leading-relaxed">
            You&apos;ve set a goal with {draft.steps.length} step{draft.steps.length !== 1 ? "s" : ""}. Time to take action!
          </p>
          <AppButton onClick={() => router.push("/goals")}>
            GO TO MY GOALS
          </AppButton>
        </div>
      </FullScreenLayout>
    );
  }

  return (
    <FullScreenLayout bgClass="bg-white">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <WizardHeader title="New Goal" onCancel={() => router.back()} />
        
        <div className="max-w-xl mx-auto px-6 pt-8 pb-32 w-full">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-1.5 flex-1">
              {STEPS_ORDER.slice(0, -1).map((s, idx) => (
                <div 
                  key={s}
                  className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                    idx <= currentIndex ? "bg-brand-primary" : "bg-gray-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* Step 1: Why */}
            {step === "why" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Why this goal?</h2>
                    <p className="text-gray-500 text-sm">Connect with your motivation</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-700 block px-1">
                    What makes this goal important to you right now?
                  </label>
                  <textarea
                    autoFocus
                    value={draft.whyMatters}
                    onChange={(e) => updateDraft("whyMatters", e.target.value)}
                    placeholder="e.g. I want to feel more energised so I can spend better quality time with my family..."
                    className="w-full min-h-[160px] p-5 rounded-3xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 text-gray-900 resize-none text-lg leading-relaxed"
                  />
                  <div className="flex items-start gap-3 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                    <Sparkles className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-brand-primary/80 leading-relaxed italic">
                      Tip: Exploring the deeper meaning behind your goals makes you 3x more likely to achieve them!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Title */}
            {step === "title" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">What is the goal?</h2>
                    <p className="text-gray-500 text-sm">Keep it simple and actionable</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-700 block px-1">
                    Give your goal a clear, inspiring title
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={draft.title}
                    onChange={(e) => updateDraft("title", e.target.value)}
                    placeholder="e.g. Run 5km without stopping"
                    className="w-full p-5 rounded-full bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 text-gray-900 text-lg"
                  />
                  
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    {["Health", "Career", "Personal", "Finance", "Growth"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => updateDraft("category", cat as GoalCategory)}
                        className={`py-3 px-4 rounded-2xl text-sm font-medium transition-all capitalize ${
                          draft.category === cat
                            ? "bg-brand-primary text-white"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Measurable */}
            {step === "measurable" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                    <Ruler className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">How you&apos;ll know</h2>
                    <p className="text-gray-500 text-sm">Make success undeniable</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Goal Title Display */}
                  <div className="px-1">
                    <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest block mb-1">GOAL</span>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{draft.title}</h3>
                  </div>

                  <label className="text-sm font-semibold text-gray-700 block px-1 pt-4">
                    How will you measure your success?
                  </label>
                  <textarea
                    autoFocus
                    value={draft.successCriteria}
                    onChange={(e) => updateDraft("successCriteria", e.target.value)}
                    placeholder="e.g. When I can run the loop around the park in under 30 minutes without walking."
                    className="w-full min-h-[120px] p-5 rounded-3xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 text-gray-900 resize-none text-lg leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Achievable */}
            {step === "achievable" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Readiness Check</h2>
                    <p className="text-gray-500 text-sm">Be honest with yourself</p>
                  </div>
                </div>

                <div className="space-y-8 pt-4">
                  <label className="text-sm font-semibold text-gray-700 block text-center">
                    On a scale of 1-5, how confident are you that you can achieve this?
                  </label>
                  
                  <div className="flex items-center justify-between gap-2 max-w-sm mx-auto">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => updateDraft("confidence", level)}
                        className={`w-14 h-14 rounded-2xl font-bold text-xl transition-all ${
                          draft.confidence === level
                            ? "bg-brand-primary text-white scale-110"
                            : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                    <span>Not confident</span>
                    <span>Very confident</span>
                  </div>

                  {draft.confidence && draft.confidence <= 2 && (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        It&apos;s okay to be nervous. In the next steps, we&apos;ll break this into smaller, more manageable pieces.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Date */}
            {step === "date" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Set a target</h2>
                    <p className="text-gray-500 text-sm">When do you want to achieve this?</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-primary" />
                    <input
                      type="date"
                      autoFocus
                      value={draft.targetDate}
                      onChange={(e) => updateDraft("targetDate", e.target.value)}
                      className="w-full p-5 pl-14 rounded-full bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 text-gray-900 text-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    {[
                      { label: "2 Weeks", days: 14 },
                      { label: "1 Month", days: 30 },
                      { label: "3 Months", days: 90 },
                      { label: "Custom", days: 0 },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => {
                          if (opt.days > 0) {
                            const d = new Date();
                            d.setDate(d.getDate() + opt.days);
                            updateDraft("targetDate", d.toISOString().split("T")[0]);
                          }
                        }}
                        className="py-3 px-4 rounded-2xl bg-gray-50 text-gray-600 font-medium text-sm hover:bg-gray-100 transition-colors border border-transparent active:border-brand-primary/20"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Steps */}
            {step === "steps" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                    <ListTodo className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Take the first steps</h2>
                    <p className="text-gray-500 text-sm">Break it down to get started</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <StepInput onAdd={addStep} />
                  
                  {draft.steps.length > 0 && (
                    <div className="space-y-4 pt-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                        Your steps ({draft.steps.length}):
                      </p>
                      <div className="space-y-2">
                        {draft.steps.map((s, index) => (
                          <StepItem 
                            key={index} 
                            title={s.title} 
                            targetDate={s.targetDate}
                            onRemove={() => removeStep(index)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 p-6 z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-4 rounded-full text-brand-primary font-bold hover:bg-brand-primary/5 transition-colors"
          >
            <TrendingUp className="w-5 h-5 rotate-180" />
            BACK
          </button>
          
          <AppButton
            disabled={!canProceed()}
            onClick={currentIndex === totalStepsCount - 1 ? handleSave : handleNext}
            className="flex-1 group"
          >
            <span className="flex items-center justify-center gap-2">
              {currentIndex === totalStepsCount - 1 ? (
                <>LOCK IT IN <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" /></>
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
