"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FullScreenLayout, PrimaryButton } from "@/components";

/**
 * Onboarding Screen 1: Welcome & Value Proposition
 *
 * Purpose: First impression - communicate core value in 5 seconds.
 * Route: /onboarding/welcome
 */
export default function WelcomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    // Will navigate to baseline quiz in Chunk 3
    router.push("/onboarding/baseline");
  };

  return (
    <FullScreenLayout bgClass="bg-white">
      <FullScreenLayout.Content>
        <div className="text-center space-y-8">
          {/* empwrU wordmark with entrance animation */}
          <div className="flex justify-center animate-[logo-entrance_0.8s_ease-out_forwards]">
            <Image
              src="/brand_assets/empwru-wordmark-gradient.svg"
              alt="empwrU"
              width={280}
              height={84}
              priority
              className="animate-[logo-shimmer_3s_ease-in-out_1s_infinite]"
            />
          </div>

          {/* Value proposition */}
          <div>
            <h1 className="text-[var(--color-charcoal)]">
              IT STARTS
              <br />
              WITH YOU
            </h1>
          </div>
        </div>
      </FullScreenLayout.Content>

      <FullScreenLayout.Footer>
        <PrimaryButton onClick={handleGetStarted}>
          Get started
        </PrimaryButton>
      </FullScreenLayout.Footer>
    </FullScreenLayout>
  );
}
