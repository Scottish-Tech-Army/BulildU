"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FullScreenLayout,
  RatingScale,
  ChoiceChips,
} from "@/components";
import { ProgressDisplay } from "@/components/ui/ProgressDisplay";
import { WizardHeader } from "@/components/ui/WizardHeader";
import {
  saveBaselineResponse,
  completeBaseline,
  saveOnboardingState,
  type WorkStatus,
  type BaselineResponse,
} from "@/lib/storage";

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

const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const YES_NO_UNSURE_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Unsure" },
];

// Section definitions
const SECTIONS = [
  { id: "situation", title: "Current Situation" },
  { id: "confidence", title: "Confidence & Self-Esteem" },
  { id: "aspirations", title: "Aspirations for the Future" },
  { id: "skills", title: "Skills, Learning & Progression" },
  { id: "wellbeing", title: "Wellbeing & Balance" },
] as const;

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
      // Final section - save and continue to reminder
      saveBaselineResponse(responses);
      completeBaseline();
      saveOnboardingState({ currentStep: 7 });
      router.push("/onboarding/reminder");
    }
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
        return responses.confidence != null && responses.selfEsteem != null;
      case "aspirations":
        return responses.futureClarity != null && responses.futureHope != null;
      case "skills":
        return responses.buildingSkills != null && responses.learningMotivation != null;
      case "wellbeing":
        return responses.energyLevel != null && responses.stressLevel != null && responses.hasBalance != null;
      default:
        return false;
    }
  };

  return (
    <FullScreenLayout bgClass="bg-white">
      <div className="flex-1 overflow-y-auto">
        <WizardHeader title="Baseline Quiz" onCancel={handleCancel} />
        <div className="max-w-sm mx-auto px-6 pb-6">

          {/* Large animated progress percentage */}
          <ProgressDisplay 
            progress={Math.round((currentSection / 6) * 100)}
            label={`Section ${currentSection + 1} of 6`}
          />

          {/* Section title centered */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-[var(--color-charcoal)]">
              {section.title}
            </h1>
          </div>

          {/* Section content */}
          <div className="space-y-8">
            {section.id === "situation" && (
              <>
                <div className="space-y-4">
                  <p className="text-[var(--color-charcoal)] text-2xl">
                    Which best describes where you&apos;re at right now?
                  </p>
                  <ChoiceChips
                    className="justify-start"
                    options={WORK_STATUS_OPTIONS}
                    value={responses.workStatus ?? null}
                    onChange={(v) => updateResponse("workStatus", v as WorkStatus)}
                  />
                </div>

                {responses.workStatus != null && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-[var(--color-charcoal)] text-2xl">
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
                <div className="space-y-4">
                  <p className="text-[var(--color-charcoal)] text-2xl">
                    How confident do you feel in yourself right now?
                  </p>
                  <RatingScale
                    value={responses.confidence ?? null}
                    onChange={(v) => updateResponse("confidence", v)}
                    lowLabel="Not confident"
                    highLabel="Very confident"
                  />
                </div>

                {responses.confidence != null && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-[var(--color-charcoal)] text-2xl">
                      How would you rate your self-esteem?
                    </p>
                    <RatingScale
                      value={responses.selfEsteem ?? null}
                      onChange={(v) => updateResponse("selfEsteem", v)}
                      lowLabel="Low"
                      highLabel="High"
                    />
                  </div>
                )}
              </>
            )}

            {section.id === "aspirations" && (
              <>
                <div className="space-y-4">
                  <p className="text-[var(--color-charcoal)] text-2xl">
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
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-[var(--color-charcoal)] text-2xl">
                      How hopeful do you feel about your future?
                    </p>
                    <RatingScale
                      value={responses.futureHope ?? null}
                      onChange={(v) => updateResponse("futureHope", v)}
                      lowLabel="Not hopeful"
                      highLabel="Very hopeful"
                    />
                  </div>
                )}
              </>
            )}

            {section.id === "skills" && (
              <>
                <div className="space-y-4">
                  <p className="text-[var(--color-charcoal)] text-2xl">
                    Are you currently building your skills?
                  </p>
                  <ChoiceChips
                    className="justify-start"
                    options={YES_NO_OPTIONS}
                    value={responses.buildingSkills ?? null}
                    onChange={(v) => updateResponse("buildingSkills", v as "yes" | "no")}
                  />
                </div>

                {responses.buildingSkills != null && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-[var(--color-charcoal)] text-2xl">
                      How motivated are you to learn new skills right now?
                    </p>
                    <RatingScale
                      value={responses.learningMotivation ?? null}
                      onChange={(v) => updateResponse("learningMotivation", v)}
                      lowLabel="Not motivated"
                      highLabel="Very motivated"
                    />
                  </div>
                )}
              </>
            )}

            {section.id === "wellbeing" && (
              <>
                <div className="space-y-4">
                  <p className="text-[var(--color-charcoal)] text-2xl">
                    How would you rate your energy most days?
                  </p>
                  <RatingScale
                    value={responses.energyLevel ?? null}
                    onChange={(v) => updateResponse("energyLevel", v)}
                    lowLabel="Very low"
                    highLabel="Very high"
                  />
                </div>

                {responses.energyLevel != null && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-[var(--color-charcoal)] text-2xl">
                      How would you rate your stress levels?
                    </p>
                    <RatingScale
                      value={responses.stressLevel ?? null}
                      onChange={(v) => updateResponse("stressLevel", v)}
                      lowLabel="Very stressed"
                      highLabel="Not stressed"
                    />
                  </div>
                )}

                {responses.stressLevel != null && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-[var(--color-charcoal)] text-2xl">
                      Do you feel you have a good balance in life?
                    </p>
                    <ChoiceChips
                      className="justify-start"
                      options={YES_NO_UNSURE_OPTIONS}
                      value={responses.hasBalance ?? null}
                      onChange={(v) => updateResponse("hasBalance", v as "yes" | "no" | "unsure")}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <FullScreenLayout.Footer>
        <div className="flex items-center justify-between px-2">
          <div className="w-24">
            {currentSection > 0 && (
              <button
                onClick={handleBack}
                className="py-3 text-brand-primary font-medium flex items-center gap-1"
              >
                ← Back
              </button>
            )}
          </div>
          <button
            onClick={handleNext}
            disabled={!isSectionComplete()}
            className="py-3 text-brand-primary font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLastSection ? "Continue" : "Next"} →
          </button>
        </div>
      </FullScreenLayout.Footer>
    </FullScreenLayout>
  );
}
