"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Goal, createGoal, GoalCategory, Step } from "@/lib/storage";
import { FullScreenLayout } from "@/components/layouts/FullScreenLayout";
import { StepInput } from "@/components/ui/StepInput";
import { StepItem } from "@/components/ui/StepItem";
import { CelebrationScreen } from "@/components/ui/CelebrationScreen";
import DailyQuote from "@/components/ui/DailyQuote";
import { 
  Target, 
  Sparkles, 
  Calendar, 
  Heart,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ListTodo,
  Ruler,
  X,

  Briefcase,
  Coins,
  Sprout,
  Home,
  Check,
  Compass,
  type LucideIcon
} from "lucide-react";

type GoalCreationStep = 
  | "intro"
  | "category"
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
  const [step, setStep] = useState<GoalCreationStep>("intro");
  const [draft, setDraft] = useState<FullGoalDraft>({
    title: "",
    category: "Career",
    whyMatters: "",
    successCriteria: "",
    confidence: null,
    targetDate: "",
    steps: [],
  });

  const STEPS_ORDER: GoalCreationStep[] = [
    "intro",
    "category",
    "title",
    "why",
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
      case "intro": return true;
      case "category": return !!draft.category;
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
      <CelebrationScreen
        progress={100}
        icon={Sparkles}
        title="Goal Locked In!"
        subtitle={`You've set a goal with ${draft.steps.length} step${draft.steps.length !== 1 ? "s" : ""}. Time to take action!`}
        buttonText="GO TO MY GOALS"
        onButtonClick={() => router.push("/goals")}
      />
    );
  }

  return (
    <FullScreenLayout bgClass="bg-bg-card">
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header - centered */}
        <header className="bg-white sticky top-0 z-30 border-b border-gray-100">
          <div className="max-w-xl mx-auto w-full px-6 py-4 flex items-center justify-center gap-3">
            <Target className="w-6 h-6 text-brand-primary" />
            <h1 className="text-2xl text-[var(--color-charcoal)]">New Goal</h1>
          </div>
        </header>
        
        <div className="max-w-xl mx-auto w-full px-6 pt-8 pb-32">
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
            {/* Step 0: Intro Quote */}
            {step === "intro" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DailyQuote
                  quote="When the why gets stronger, the how gets easier."
                  author="Jim Rohn"
                />
              </div>
            )}

            {/* Step 1: Category */}
            {step === "category" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                    <Compass className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">What area of life?</h2>
                    <p className="text-gray-500 text-sm">Choose a category for your goal</p>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-gray-100">
                  <div className="grid grid-cols-1 gap-3">
                    {([
                      { name: "Career", icon: Briefcase },
                      { name: "Finance", icon: Coins },
                      { name: "Growth", icon: Sprout },
                      { name: "Wellbeing", icon: Heart },
                      { name: "Family", icon: Home },
                    ] as { name: GoalCategory; icon: LucideIcon }[]).map(({ name, icon: Icon }) => (
                      <button
                        key={name}
                        onClick={() => updateDraft("category", name)}
                        className={`flex items-center gap-3 py-4 px-5 rounded-2xl text-base font-medium transition-all capitalize ${
                          draft.category === name
                            ? "bg-brand-primary text-white"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {name}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 mt-4">
                    <Sparkles className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-brand-primary/80 leading-relaxed italic">
                      Tip: [PLACEHOLDER - Get tip from client]
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Why */}
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
                
                <div className="p-5 bg-white rounded-3xl border border-gray-100 space-y-4">
                  <label className="text-[10px] font-bold text-[var(--color-magenta)] uppercase tracking-widest px-1">
                    What makes this goal important to you right now?
                  </label>
                  <textarea
                    autoFocus
                    value={draft.whyMatters}
                    onChange={(e) => updateDraft("whyMatters", e.target.value)}
                    placeholder="e.g. I want to feel more energised so I can spend better quality time with my family..."
                    className="w-full min-h-[160px] p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 text-gray-900 resize-none text-base leading-relaxed"
                  />
                  <div className="flex items-start gap-3 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                    <Sparkles className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-brand-primary/80 leading-relaxed italic">
                      Tip: Think about what achieving this goal will bring you, what does it change, how does it make you feel – the more detail, the better.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Title */}
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

                <div className="p-5 bg-white rounded-3xl border border-gray-100 space-y-4">
                  <label className="text-[10px] font-bold text-[var(--color-magenta)] uppercase tracking-widest px-1">
                    Give your goal a clear, inspiring title
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={draft.title}
                    onChange={(e) => updateDraft("title", e.target.value)}
                    placeholder="e.g. Run 5km without stopping"
                    className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 text-gray-900 text-base"
                  />
                  <div className="flex items-start gap-3 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                    <Sparkles className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-brand-primary/80 leading-relaxed italic">
                      Tip: [PLACEHOLDER - Get tip from client]
                    </p>
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
                    <p className="text-gray-500 text-sm">Decide how progress will be tracked</p>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-gray-100 space-y-4">
                  {/* Goal Title Display */}
                  <div className="px-1">
                    <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest block mb-1">GOAL</span>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{draft.title}</h3>
                  </div>

                  <label className="text-[10px] font-bold text-[var(--color-magenta)] uppercase tracking-widest block px-1 pt-2">
                    How will you measure your success?
                  </label>
                  <textarea
                    autoFocus
                    value={draft.successCriteria}
                    onChange={(e) => updateDraft("successCriteria", e.target.value)}
                    placeholder="e.g. apply for 3 jobs, complete 1 online accredited course, secure 1 interview etc."
                    className="w-full min-h-[120px] p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 text-gray-900 resize-none text-base leading-relaxed"
                  />
                  <div className="flex items-start gap-3 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                    <Sparkles className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-brand-primary/80 leading-relaxed italic">
                      Tip: [PLACEHOLDER - Get tip from client]
                    </p>
                  </div>
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

                <div className="p-5 bg-white rounded-3xl border border-gray-100 space-y-6">
                  <label className="text-[10px] font-bold text-[var(--color-magenta)] uppercase tracking-widest block text-center">
                    On a scale of 1-5, how confident are you that you can achieve this?
                  </label>
                  
                  <div className="flex items-center justify-center gap-2 sm:gap-3 max-w-sm mx-auto">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => updateDraft("confidence", level)}
                        className={`w-14 h-14 rounded-lg font-bold text-xl transition-all ${
                          draft.confidence === level
                            ? "bg-brand-primary text-white scale-105 shadow-md"
                            : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-sm mx-auto px-2">
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
                  <div className="flex items-start gap-3 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                    <Sparkles className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-brand-primary/80 leading-relaxed italic">
                      Tip: [PLACEHOLDER - Get tip from client]
                    </p>
                  </div>
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

                <div className="p-5 bg-white rounded-3xl border border-gray-100 space-y-4">
                  <label className="text-[10px] font-bold text-[var(--color-magenta)] uppercase tracking-widest px-1">
                    Choose your target date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary" />
                    <input
                      type="date"
                      value={draft.targetDate}
                      onChange={(e) => updateDraft("targetDate", e.target.value)}
                      className="w-full h-14 px-5 pl-14 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 text-gray-900 text-base appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {[
                      { label: "1 Week", days: 7 },
                      { label: "2 Weeks", days: 14 },
                      { label: "1 Month", days: 30 },
                      { label: "3 Months", days: 90 },
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
                        className="h-14 px-4 rounded-2xl bg-gray-50 text-gray-600 font-medium text-sm hover:bg-gray-100 transition-colors border border-transparent active:border-brand-primary/20"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                    <Sparkles className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-brand-primary/80 leading-relaxed italic">
                      Tip: [PLACEHOLDER - Get tip from client]
                    </p>
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
                  <div className="flex items-start gap-3 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                    <Sparkles className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-brand-primary/80 leading-relaxed italic">
                      Tip: [PLACEHOLDER - Get tip from client]
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contextual Sticky Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50 animate-in slide-in-from-bottom duration-500">
        <div className="flex justify-around items-center h-20 max-w-xl mx-auto px-6">
          <button
            onClick={handleBack}
            className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-brand-primary transition-colors gap-1"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Back</span>
          </button>

          <button
            onClick={() => router.back()}
            className="flex flex-col items-center justify-center w-full h-full text-brand-primary transition-colors gap-1"
          >
            <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mb-1 group-active:scale-95 transition-transform">
              <X className="w-6 h-6 text-brand-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest -mt-1">Cancel</span>
          </button>

          <button
            onClick={currentIndex === totalStepsCount - 1 ? handleSave : handleNext}
            disabled={!canProceed()}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors gap-1 ${
              canProceed() ? "text-brand-primary" : "text-gray-300 pointer-events-none"
            }`}
          >
            {currentIndex === totalStepsCount - 1 ? (
              <Check className="w-6 h-6" />
            ) : (
              <ChevronRight className="w-6 h-6" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {currentIndex === totalStepsCount - 1 ? "Save" : "Next"}
            </span>
          </button>
        </div>
      </nav>
    </FullScreenLayout>
  );
}
