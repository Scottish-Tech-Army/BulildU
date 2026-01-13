"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import { LucideIcon } from "lucide-react";
import confetti from "canvas-confetti";
import { PrimaryButton } from "./PrimaryButton";

interface CelebrationScreenProps {
  /** Optional progress percentage to display (e.g., 100) */
  progress?: number;
  /** Optional Lucide icon to display in the celebration badge */
  icon?: LucideIcon;
  /** Main headline text */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Optional custom content (e.g., stats, milestones) */
  children?: ReactNode;
  /** CTA button label */
  buttonText: string;
  /** CTA button action */
  onButtonClick: () => void;
}

/**
 * Full-screen celebration component for completion states.
 * Used for onboarding completion, check-in completion, etc.
 * Animates progress count-up and fires confetti on completion.
 */
export function CelebrationScreen({
  progress,
  icon: Icon,
  title,
  subtitle,
  children,
  buttonText,
  onButtonClick,
}: CelebrationScreenProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const hasCompletedRef = useRef(false);

  // Animate count-up and fire confetti when complete
  useEffect(() => {
    if (progress === undefined) return;

    const animationDuration = 800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / animationDuration, 1);
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      setDisplayValue(Math.round(eased * progress));

      if (progressRatio < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else if (!hasCompletedRef.current) {
        // Animation complete - fire confetti!
        hasCompletedRef.current = true;
        confetti({
          particleCount: 30,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.6 },
          colors: ["#bc03b9", "#ffffff", "#efebee"],
        });
        confetti({
          particleCount: 30,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.6 },
          colors: ["#bc03b9", "#ffffff", "#efebee"],
        });
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [progress]);

  return (
    <div className="min-h-dvh bg-brand-primary flex flex-col">
      {/* Main content - centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Animated progress percentage */}
        {progress !== undefined && (
          <div className="text-8xl font-light text-white mb-8">
            {displayValue}%
          </div>
        )}

        {/* Icon badge (optional) */}
        {Icon && (
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-8">
            <Icon className="w-10 h-10 text-white" />
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl text-white mb-6">{title}</h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-white/90 mb-8 max-w-xs">{subtitle}</p>
        )}

        {/* Custom content slot */}
        {children && <div className="mt-4">{children}</div>}
      </div>

      {/* Sticky bottom CTA */}
      <div className="sticky bottom-0 p-6 pb-safe">
        <div className="max-w-sm mx-auto">
          <PrimaryButton variant="white" onClick={onButtonClick}>
            {buttonText}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
