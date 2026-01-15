"use client";

import { GoalCategory } from "@/lib/storage";
import { Check, RotateCcw } from "lucide-react";
import { PrimaryButton } from "./PrimaryButton";

export type SortOption =
  | "targetDate"
  | "progressAsc"
  | "progressDesc"
  | "newest"
  | "oldest"
  | "alpha";

export interface GoalFilterState {
  sortBy: SortOption;
  categories: GoalCategory[];
  statuses: ("active" | "paused" | "completed")[];
  atRiskOnly: boolean;
}

export const DEFAULT_FILTERS: GoalFilterState = {
  sortBy: "targetDate",
  categories: [], // Empty means all
  statuses: ["active"],
  atRiskOnly: false,
};

interface GoalFiltersProps {
  filters: GoalFilterState;
  onFiltersChange: (filters: GoalFilterState) => void;
  onApply: () => void;
}

export default function GoalFilters({
  filters,
  onFiltersChange,
  onApply,
}: GoalFiltersProps) {
  const categories: GoalCategory[] = ["Wellbeing", "Career", "Finances", "Growth", "Family"];
  const statuses: ("active" | "paused" | "completed")[] = ["active", "paused", "completed"];

  const toggleCategory = (cat: GoalCategory) => {
    const newCats = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onFiltersChange({ ...filters, categories: newCats });
  };

  const toggleStatus = (status: "active" | "paused" | "completed") => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const handleReset = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  return (
    <div className="space-y-8">
      {/* Sort Section */}
      <section>
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
          Sort By
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "targetDate", label: "Target Date" },
            { id: "progressAsc", label: "Progress ↑" },
            { id: "progressDesc", label: "Progress ↓" },
            { id: "newest", label: "Newest" },
            { id: "oldest", label: "Oldest" },
            { id: "alpha", label: "A → Z" },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() =>
                onFiltersChange({ ...filters, sortBy: option.id as SortOption })
              }
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                filters.sortBy === option.id
                  ? "border-[var(--color-magenta)] bg-[var(--color-magenta)]/5 text-[var(--color-magenta)]"
                  : "border-brand-surface bg-brand-surface text-text-muted"
              }`}
            >
              <span className="text-sm font-medium">{option.label}</span>
              {filters.sortBy === option.id && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
          Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filters.categories.includes(cat)
                  ? "bg-[var(--color-deep-violet)] text-white"
                  : "bg-brand-surface text-text-muted hover:bg-brand-surface-dark"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Status Section */}
      <section>
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
          Status
        </h3>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                filters.statuses.includes(status)
                  ? "bg-brand-primary text-white"
                  : "bg-brand-surface text-text-muted hover:bg-brand-surface-dark"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      {/* Special Filters */}
      <section>
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
          Focus
        </h3>
        <button
          onClick={() =>
            onFiltersChange({ ...filters, atRiskOnly: !filters.atRiskOnly })
          }
          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-brand-surface bg-brand-surface text-[var(--color-charcoal)] transition-all hover:border-brand-primary/30"
        >
          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
            filters.atRiskOnly 
              ? "bg-brand-primary border-brand-primary text-white" 
              : "bg-white border-brand-surface-dark"
          }`}>
            {filters.atRiskOnly && <Check className="w-4 h-4" />}
          </div>
          <div className="text-left flex-1">
            <span className="block text-sm font-medium">Show only &quot;At Risk&quot;</span>
            <span className="text-[10px] text-text-muted">
              Behind pace with &lt; 2 weeks left
            </span>
          </div>
        </button>
      </section>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-text-muted hover:bg-brand-surface transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="font-medium">Reset</span>
        </button>
        <div className="flex-[2]">
          <PrimaryButton onClick={onApply} className="w-full">
            Apply Filters
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
