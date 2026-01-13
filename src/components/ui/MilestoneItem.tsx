"use client";

interface MilestoneItemProps {
  title: string;
  targetDate?: string;
  onRemove: () => void;
}

/**
 * Display component for a milestone in the creation list
 */
export function MilestoneItem({
  title,
  targetDate,
  onRemove,
}: MilestoneItemProps) {
  // Format date for display
  const formattedDate = targetDate
    ? new Date(targetDate).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
      <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-brand-primary flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-brand-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 break-words">{title}</p>
        {formattedDate && (
          <p className="text-sm text-gray-500 mt-0.5">Due: {formattedDate}</p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Remove milestone"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
