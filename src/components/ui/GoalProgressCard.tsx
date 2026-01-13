"use client";

import { Goal } from "@/lib/storage";

interface GoalProgressCardProps {
  goal: Goal;
  onMilestoneToggle: (milestoneId: string) => void;
}

/**
 * Displays a goal with toggleable milestones during check-in.
 * Uses the same layout as GoalCard with milestone toggles added.
 */
export function GoalProgressCard({
  goal,
  onMilestoneToggle,
}: GoalProgressCardProps) {
  const completedCount = goal.milestones.filter((m) => m.completed).length;
  const totalMilestones = goal.milestones.length;

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      {/* Goal Header - matches GoalCard layout */}
      <div className="mb-4">
        {/* Milestones count, Title, and Category */}
        <p className="text-sm text-gray-500 mb-1">
          {completedCount}/{totalMilestones} milestones
        </p>
        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
          {goal.title}
        </h3>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warm-ivory text-text-muted">
          {goal.category}
        </span>
      </div>

      {/* Milestones List - toggleable */}
      {totalMilestones > 0 && (
        <div className="border-t border-gray-100 pt-4 space-y-3">
          {goal.milestones.map((milestone) => (
            <label
              key={milestone.id}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={milestone.completed}
                  onChange={() => onMilestoneToggle(milestone.id)}
                  className="sr-only peer"
                />
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    milestone.completed
                      ? "bg-brand-primary border-brand-primary"
                      : "border-gray-300 group-hover:border-brand-primary"
                  }`}
                >
                  {milestone.completed && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <span
                  className={`text-sm ${
                    milestone.completed
                      ? "text-gray-400 line-through"
                      : "text-gray-700"
                  }`}
                >
                  {milestone.title}
                </span>
                {milestone.targetDate && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Due:{" "}
                    {new Date(milestone.targetDate).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

