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
    <div className="pt-6 pb-4">
      <div className="max-w-5xl mx-auto px-6 flex items-center">
        <button
          onClick={onCancel}
          className="text-brand-primary text-sm w-16 text-left leading-6"
        >
          Cancel
        </button>
        <h1 className="flex-1 text-center text-base font-medium text-[var(--color-charcoal)] leading-6">
          {title}
        </h1>
        <div className="w-16" />
      </div>
    </div>
  );
}
