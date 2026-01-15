"use client";

interface RatingScaleProps {
  /** Current selected value (1-5, or null if not selected) */
  value: number | null;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Label for low end of scale */
  lowLabel?: string;
  /** Label for high end of scale */
  highLabel?: string;
  /** Question text for screen reader context */
  question?: string;
}

// Labels for each rating level (for screen readers and tooltips)
const RATING_LABELS = [
  "Not at all",
  "A little",
  "Somewhat",
  "Quite a bit",
  "Very much",
];

/**
 * 5-point rating scale with large touch targets.
 * Improved for accessibility:
 * - 48px+ touch targets (exceeds WCAG minimum)
 * - Descriptive aria-labels for screen readers
 * - Single row layout for easier scanning
 * - Clear visual selection state
 */
export function RatingScale({
  value,
  onChange,
  lowLabel = "Not at all",
  highLabel = "Very much",
  question,
}: RatingScaleProps) {
  return (
    <div 
      className="space-y-4"
      role="radiogroup"
      aria-label={question || "Rating scale from 1 to 5"}
    >
      {/* Centered Rating Control Container */}
      <div className="max-w-md mx-auto">
        {/* Rating buttons - centered row with fixed gaps */}
        <div className="flex justify-center gap-3 sm:gap-4 mb-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => onChange(num)}
              role="radio"
              aria-checked={value === num}
              aria-label={`${num} out of 5: ${RATING_LABELS[num - 1]}`}
              className={`
                w-12 h-12 sm:w-14 sm:h-14 rounded-full font-semibold text-lg
                transition-all duration-150
                focus-ring
                ${
                  value === num
                    ? "bg-[var(--color-magenta)] text-white scale-110 shadow-lg"
                    : "bg-[var(--color-warm-ivory)] text-[var(--color-charcoal)] hover:bg-[var(--color-magenta)]/20 hover:scale-105"
                }
              `}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Scale labels aligned to buttons */}
        <div className="flex justify-between text-sm text-[var(--color-charcoal)]/60 px-4">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      </div>
    </div>
  );
}
