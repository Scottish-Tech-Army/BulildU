"use client";

interface ChoiceOption {
  value: string;
  label: string;
}

interface ChoiceChipsProps {
  /** Available options */
  options: ChoiceOption[];
  /** Currently selected value (or null if none) */
  value: string | null;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Horizontal chip selection for Yes/No/Unsure or status options.
 * Full-width button style for easy tapping.
 */
export function ChoiceChips({ options, value, onChange, className }: ChoiceChipsProps) {
  return (
    <div className={`flex flex-wrap gap-3 justify-center ${className ?? ""}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-6 py-3 rounded-full font-medium
            transition-all duration-150
            focus-ring
            ${
              value === option.value
                ? "bg-[var(--color-magenta)] text-white"
                : "bg-[var(--color-warm-ivory)] text-[var(--color-charcoal)] hover:bg-[var(--color-magenta)]/10"
            }
          `}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
