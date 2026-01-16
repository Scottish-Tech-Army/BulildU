"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FullScreenLayout,
  RatingScale,
  ChoiceChips,
  WizardHeader,
  TimeOption,
  CelebrationScreen,
} from "@/components";
import {
  saveBaselineResponse,
  completeBaseline,
  saveOnboardingState,
  completeOnboarding,
  type WorkStatus,
  type BaselineResponse,
} from "@/lib/storage";
import { Sunrise, Sunset, Sparkles } from "lucide-react";

// =============================================================================
// Question Data
// =============================================================================

const WORK_STATUS_OPTIONS = [
  { value: "unemployed", label: "Unemployed" },
  { value: "employed", label: "In work" },
  { value: "self-employed", label: "Self-employed" },
  { value: "studying", label: "Studying" },
  { value: "other", label: "Other" },
];

// Section definitions
const SECTIONS = [
  { id: "situation", title: "Current Situation" },
  { id: "confidence", title: "Confidence & Self-Esteem" },
  { id: "aspirations", title: "Aspirations for the Future" },
  { id: "wellbeing", title: "Wellbeing & Balance" },
  { id: "reminder", title: "Weekly Check-in" },
] as const;

const DAY_OPTIONS = [
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
];

type ReminderTime = "morning" | "evening";
type ReminderDay = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";

// =============================================================================
// Component
// =============================================================================

/**
 * Onboarding Screen 2: Baseline Quiz (Multi-step wizard)
 *
 * Purpose: Gauge starting point across impact measures.
 * Route: /onboarding/baseline
 *
 * Follows single-purpose screen principle: one section per view.
 */
export default function BaselinePage() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);

  // Form state - all questions
  const [responses, setResponses] = useState<Partial<BaselineResponse>>({});
  
  // Reminder state
  const [reminderDay, setReminderDay] = useState<ReminderDay | null>(null);
  const [reminderTime, setReminderTime] = useState<ReminderTime | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const updateResponse = <K extends keyof BaselineResponse>(
    key: K,
    value: BaselineResponse[K]
  ) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };
  const handleNext = () => {
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setShowCelebration(true);
    }
  };

  const handleFinish = () => {
    // Final section - save and go to dashboard
    saveBaselineResponse(responses);
    completeBaseline();
    
    // Calculate reminder date as one week from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Save reminder preferences and mark complete
    saveOnboardingState({
      currentStep: 7,
      completed: true,
      reminderDate: nextWeek.toISOString(),
      reminderTime: reminderTime ?? undefined,
    });
    completeOnboarding();
    router.push("/");
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleCancel = () => {
    router.push("/onboarding/welcome");
  };

  const section = SECTIONS[currentSection];
  const isLastSection = currentSection === SECTIONS.length - 1;

  // Check if current section is complete (both questions answered)
  const isSectionComplete = (): boolean => {
    switch (section.id) {
      case "situation":
        return responses.workStatus != null && responses.situationSatisfaction != null;
      case "confidence":
        return responses.confidence != null;
      case "aspirations":
        return responses.futureClarity != null && responses.futureHope != null;
      case "wellbeing":
        return responses.stressLevel != null && responses.energyLevel != null && responses.lifeBalance != null;
      case "reminder":
        return reminderDay != null && reminderTime != null;
      default:
        return false;
    }
  };

  if (showCelebration) {
    return (
      <CelebrationScreen
        progress={100}
        icon={Sparkles}
        title="You're All Set!"
        subtitle="You've completed your baseline assessment. Let's start moving towards your potential."
        buttonText="GO TO DASHBOARD"
        onButtonClick={handleFinish}
      />
    );
  }

  return (
    <FullScreenLayout bgClass="bg-bg-card">
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white sticky top-0 z-30">
          <WizardHeader title="About U" onCancel={handleCancel} />
        </div>
        <div className="max-w-5xl mx-auto px-6 pb-6 w-full pt-6">

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8 max-w-xl mx-auto">
            <div className="flex gap-2 flex-1">
              {SECTIONS.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                    idx <= currentSection ? "bg-brand-primary" : "bg-gray-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Section title centered */}
          <div className="text-center mb-8">
            <p className="text-2xl font-semibold text-[var(--color-charcoal)]">
              {section.title}
            </p>
          </div>

          {/* Section content */}
          <div className="space-y-6 max-w-xl mx-auto">
            {section.id === "situation" && (
              <>
                <div className="p-5 bg-white rounded-3xl border border-gray-100 space-y-6 text-center">
                  <p className="text-[var(--color-charcoal)] text-[18px]">
                    Which best describes where you&apos;re at right now?
                  </p>
                  <ChoiceChips
                    className="justify-center"
                    options={WORK_STATUS_OPTIONS}
                    value={responses.workStatus ?? null}
                    onChange={(v) => updateResponse("workStatus", v as WorkStatus)}
                  />
                </div>

                {responses.workStatus != null && (
                  <div className="p-5 bg-white rounded-3xl border border-gray-100 space-y-6 animate-fade-in text-center">
                    <p className="text-[var(--color-charcoal)] text-[18px] text-center">
                      How satisfied are you with your current situation?
                    </p>
                    <RatingScale
                      value={responses.situationSatisfaction ?? null}
                      onChange={(v) => updateResponse("situationSatisfaction", v)}
                      lowLabel="Not at all"
                      highLabel="Very satisfied"
                    />
                  </div>
                )}
              </>
            )}

            {section.id === "confidence" && (
              <>
                <div className="p-5 bg-white rounded-3xl border border-gray-100 space-y-6 text-center">
                  <p className="text-[var(--color-charcoal)] text-[18px]">
                    How confident do you feel in yourself right now?
                  </p>
                  <RatingScale
                    value={responses.confidence ?? null}
                    onChange={(v) => updateResponse("confidence", v)}
                    lowLabel="Not confident"
                    highLabel="Very confident"
                  />
                </div>
              </>
            )}

            {section.id === "aspirations" && (
              <>
                <div className="p-5 bg-white rounded-3xl border border-gray-100 space-y-6 text-center">
                  <p className="text-[var(--color-charcoal)] text-[18px]">
                    How clear do you feel about what you want for your future?
                  </p>
                  <RatingScale
                    value={responses.futureClarity ?? null}
                    onChange={(v) => updateResponse("futureClarity", v)}
                    lowLabel="Not clear"
                    highLabel="Very clear"
                  />
                </div>

                {responses.futureClarity != null && (
                  <div className="p-5 bg-white rounded-3xl border border-gray-100 space-y-6 animate-fade-in text-center">
                    <p className="text-[var(--color-charcoal)] text-[18px]">
                      How positive do you feel about your future?
                    </p>
                    <RatingScale
                      value={responses.futureHope ?? null}
                      onChange={(v) => updateResponse("futureHope", v)}
                      lowLabel="Not positive"
                      highLabel="Very positive"
                    />
                  </div>
                )}
              </>
            )}

            {section.id === "wellbeing" && (
              <>
                <div className="p-5 bg-white rounded-3xl border border-gray-100 space-y-6 text-center">
                  <p className="text-[var(--color-charcoal)] text-[18px]">
                    How well do you manage stress?
                  </p>
                  <RatingScale
                    value={responses.stressLevel ?? null}
                    onChange={(v) => updateResponse("stressLevel", v)}
                    lowLabel="Not well"
                    highLabel="Very well"
                  />
                </div>

                {responses.stressLevel != null && (
                  <div className="p-5 bg-white rounded-3xl border border-gray-100 space-y-6 animate-fade-in text-center">
                    <p className="text-[var(--color-charcoal)] text-[18px]">
                      How would you rate your energy most days?
                    </p>
                    <RatingScale
                      value={responses.energyLevel ?? null}
                      onChange={(v) => updateResponse("energyLevel", v)}
                      lowLabel="Very low"
                      highLabel="Very high"
                    />
                  </div>
                )}

                {responses.energyLevel != null && (
                  <div className="p-5 bg-white rounded-3xl border border-gray-100 space-y-6 animate-fade-in text-center">
                    <p className="text-[var(--color-charcoal)] text-[18px]">
                      How would you rate your life balance right now?
                    </p>
                    <RatingScale
                      value={responses.lifeBalance ?? null}
                      onChange={(v) => updateResponse("lifeBalance", v)}
                      lowLabel="Out of balance"
                      highLabel="Well balanced"
                    />
                  </div>
                )}
              </>
            )}

            {section.id === "reminder" && (
              <>
                {/* Tip Box */}
                <div className="flex items-start gap-3 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                  <Sparkles className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-brand-primary/80 leading-relaxed italic text-left">
                    Tip: Choose a day and time that is quiet and allows you to focus on you. Sundays can be a good day to reflect and plan.
                  </p>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-gray-100 text-center space-y-4">
                  <p className="text-[var(--color-charcoal)] text-[18px]">
                    Pick a day
                  </p>
                  <ChoiceChips
                    className="justify-center flex-wrap"
                    options={DAY_OPTIONS}
                    value={reminderDay}
                    onChange={(v) => setReminderDay(v as ReminderDay)}
                  />
                </div>

                {reminderDay != null && (
                  <div className="p-5 bg-white rounded-3xl border border-gray-100 space-y-3 animate-fade-in text-center" role="radiogroup" aria-label="Weekly check-in time">
                    <p className="text-gray-900 font-medium">Pick a time</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <TimeOption
                        time="8:00 AM"
                        label="Morning"
                        description="Start your week with reflection"
                        icon={Sunrise}
                        selected={reminderTime === "morning"}
                        onSelect={() => setReminderTime("morning")}
                      />
                      <TimeOption
                        time="6:00 PM"
                        label="Evening"
                        description="Wind down and plan your week"
                        icon={Sunset}
                        selected={reminderTime === "evening"}
                        onSelect={() => setReminderTime("evening")}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contextual Action Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50">
        <div className="flex justify-between items-center h-16 max-w-5xl mx-auto w-full px-6">
          {/* Back */}
          <button
            onClick={handleBack}
            disabled={currentSection === 0}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              currentSection === 0 
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
            <span className="text-sm font-medium text-brand-primary">{currentSection + 1}/{SECTIONS.length}</span>
            <span className="text-xs mt-0.5">Steps</span>
          </div>
          
          {/* Next/Continue */}
          <button
            onClick={handleNext}
            disabled={!isSectionComplete()}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isSectionComplete() 
                ? "text-brand-primary" 
                : "text-gray-300 cursor-not-allowed"
            }`}
          >
            {isLastSection ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span className="text-xs mt-1 font-medium">Continue</span>
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
