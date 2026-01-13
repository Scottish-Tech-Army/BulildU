"use client";

interface WizardHeaderProps {
  title: string;
  onCancel: () => void;
}

/**
 * Reusable header for wizard flows.
 * Cancel button left-aligned, title centered.
 */
export function WizardHeader({ title, onCancel }: WizardHeaderProps) {
  return (
    <div className="flex items-center px-6 pt-6 pb-4">
      <button
        onClick={onCancel}
        className="text-brand-primary text-sm w-16 text-left"
      >
        Cancel
      </button>
      <h1 className="flex-1 text-center text-2xl text-[var(--color-charcoal)]">
        {title}
      </h1>
      <div className="w-16" />
    </div>
  );
}
