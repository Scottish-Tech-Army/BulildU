"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FullScreenLayout, PrimaryButton, CelebrationScreen } from "@/components";
import { ProgressDisplay } from "@/components/ui/ProgressDisplay";
import { WizardHeader } from "@/components/ui/WizardHeader";
import { TimeOption } from "@/components/ui/TimeOption";
import { completeOnboarding, saveOnboardingState } from "@/lib/storage";
import { Sunrise, Sunset } from "lucide-react";

type ReminderTime = "morning" | "evening";
type Step = "reminder" | "celebration";

/**
 * Onboarding Screen 6: Reminder Setup + Celebration
 *
 * Purpose: Set weekly check-in day and time, then celebrate completion.
 * Route: /onboarding/reminder
 */
export default function ReminderPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("reminder");
  const [selectedTime, setSelectedTime] = useState<ReminderTime | null>(null);

  const handleComplete = () => {
    // Calculate reminder date as one week from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Save reminder preferences
    saveOnboardingState({
      reminderDate: nextWeek.toISOString(),
      reminderTime: selectedTime ?? undefined,
    });

    // Mark onboarding as complete
    completeOnboarding();

    // Show celebration screen
    setStep("celebration");
  };

  const canContinue = selectedTime !== null;

  // Celebration screen with 100%
  if (step === "celebration") {
    return (
      <CelebrationScreen
        progress={100}
        title="You're all set!"
        subtitle="Welcome to empwrU. Let's start building momentum towards your goals."
        buttonText="Go to dashboard"
        onButtonClick={() => router.push("/")}
      />
    );
  }

  return (
    <FullScreenLayout bgClass="bg-white">
      <div className="flex-1 overflow-y-auto">
        <WizardHeader title="Reminder Setup" onCancel={() => router.push("/onboarding/welcome")} />
        <div className="max-w-sm mx-auto px-6 pb-6">

          {/* Large animated progress percentage - 5/6 complete */}
          <ProgressDisplay 
            progress={Math.round((5 / 6) * 100)}
            label="Section 6 of 6"
          />

          {/* Question */}
          <div className="text-center mb-8 text-left">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-left">
              When works best for your weekly check-in?
            </h1>
            <p className="text-gray-500">
              We&apos;ll send a gentle reminder once a week
            </p>
          </div>



          {/* Time options */}
          <div className="space-y-3" role="radiogroup" aria-label="Weekly check-in time">
            <p className="text-gray-900 font-medium text-left">
              Pick a time
            </p>
            <TimeOption
              time="8:00 AM"
              label="Morning"
              description="Start your week with reflection"
              icon={Sunrise}
              selected={selectedTime === "morning"}
              onSelect={() => setSelectedTime("morning")}
            />
            <TimeOption
              time="6:00 PM"
              label="Evening"
              description="Wind down and plan your week"
              icon={Sunset}
              selected={selectedTime === "evening"}
              onSelect={() => setSelectedTime("evening")}
            />
          </div>
        </div>
      </div>

      <FullScreenLayout.Footer>
        <div className="flex items-center gap-4">
          <div className="w-1/2 flex justify-start">
            <PrimaryButton onClick={() => router.push("/onboarding/baseline")} variant="secondary" className="w-full">
              BACK
            </PrimaryButton>
          </div>
          <div className="w-1/2 flex justify-end">
            <PrimaryButton onClick={handleComplete} disabled={!canContinue} className="w-full">
              Complete setup
            </PrimaryButton>
          </div>
        </div>
      </FullScreenLayout.Footer>
    </FullScreenLayout>
  );
}
