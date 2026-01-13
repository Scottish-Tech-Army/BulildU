"use client";

import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

interface TimeOptionProps {
  /** Time display (e.g., "8:00 AM") */
  time: string;
  /** Period label (e.g., "Morning") */
  label: string;
  /** Supporting description */
  description: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Icon color class */
  iconColor?: string;
  /** Whether this option is selected */
  selected: boolean;
  /** Selection handler */
  onSelect: () => void;
}

/**
 * Time selection option for reminder setup.
 * Large touch target with clear selected state.
 */
export function TimeOption({
  time,
  label,
  description,
  icon: Icon,
  iconColor = "text-brand-primary",
  selected,
  onSelect,
}: TimeOptionProps) {
  return (
    <button
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      className={`
        w-full p-4 rounded-2xl border transition-all duration-150 text-left
        ${
          selected
            ? "border-brand-primary bg-brand-primary/5"
            : "border-gray-100 bg-white hover:border-brand-primary/30"
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-full bg-bg-subtle flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>

        {/* Text content */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-medium text-gray-900 text-lg">
              {time}
            </span>
            <span className="text-gray-500 text-sm">
              {label}
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            {description}
          </p>
        </div>

        {/* Check indicator */}
        {selected && (
          <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </button>
  );
}
