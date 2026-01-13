"use client";

interface StepHeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * Reusable centered header for wizard steps.
 * Used in goal creation, check-in, and onboarding flows.
 */
export function StepHeader({ title, subtitle }: StepHeaderProps) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl text-[var(--color-charcoal)] mb-2">{title}</h1>
      {subtitle && (
        <p className="text-[var(--color-text-muted)]">{subtitle}</p>
      )}
    </div>
  );
}
