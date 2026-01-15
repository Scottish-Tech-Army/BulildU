"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Goal, getGoals, getGoalProgress } from "@/lib/storage";
import GoalCard from "@/components/ui/GoalCard";
import BottomNav from "@/components/ui/BottomNav";
import { QuoteCard, BottomSheet, GoalFilters } from "@/components";
import { GoalFilterState, DEFAULT_FILTERS } from "@/components/ui/GoalFilters";

import { Plus, SlidersHorizontal, RotateCcw } from "lucide-react";

/**
 * Smart "At Risk" logic:
 * A goal is "At Risk" when:
 * 1. Behind pace (time elapsed % > progress %)
 * 2. Running out of time (< 14 days remaining)
 */
function isGoalAtRisk(goal: Goal): boolean {
  if (!goal.targetDate) return false;

  const now = new Date();
  const created = new Date(goal.createdAt);
  const target = new Date(goal.targetDate);

  const totalDuration = target.getTime() - created.getTime();
  const elapsed = now.getTime() - created.getTime();
  const remaining = target.getTime() - now.getTime();

  // If already past due, it's definitely at risk if not completed
  if (remaining <= 0) return goal.status !== "completed";

  const timeElapsedPercent = (elapsed / totalDuration) * 100;
  const progress = getGoalProgress(goal);
  const daysRemaining = remaining / (1000 * 60 * 60 * 24);

  return progress < timeElapsedPercent && daysRemaining < 14;
}

/**
 * Goals list page - Shows all goals with option to create new
 */
export default function GoalsPage() {
  const [goals] = useState<Goal[]>(() => getGoals());
  const [isLoading] = useState(() => false);

  // Filter and Sort state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<GoalFilterState>(DEFAULT_FILTERS);

  // Apply filters and sort to goals
  const processedGoals = useMemo(() => {
    // 1. Filter
    const filtered = goals.filter((g) => {
      // Status filter
      if (!filters.statuses.includes(g.status)) return false;

      // Category filter (empty = all)
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(g.category)
      )
        return false;

      // At Risk filter
      if (filters.atRiskOnly && !isGoalAtRisk(g)) return false;

      return true;
    });

    // 2. Sort
    return filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "targetDate":
          // Sort by date soonest first, but keep "No Date" at the end
          if (!a.targetDate) return 1;
          if (!b.targetDate) return -1;
          return a.targetDate.localeCompare(b.targetDate);

        case "progressAsc":
          return getGoalProgress(a) - getGoalProgress(b);

        case "progressDesc":
          return getGoalProgress(b) - getGoalProgress(a);

        case "newest":
          return b.createdAt.localeCompare(a.createdAt);

        case "oldest":
          return a.createdAt.localeCompare(b.createdAt);

        case "alpha":
          return a.title.localeCompare(b.title);

        default:
          return 0;
      }
    });
  }, [goals, filters]);

  // Group by status for grouped rendering
  const activeGoals = processedGoals.filter((g) => g.status === "active");
  const pausedGoals = processedGoals.filter((g) => g.status === "paused");
  const completedGoals = processedGoals.filter((g) => g.status === "completed");

  const activeFilterCount =
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.statuses.length !== 1 || filters.statuses[0] !== "active" ? 1 : 0) +
    (filters.atRiskOnly ? 1 : 0);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-brand-surface">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-brand-surface flex flex-col">
      <div className="px-6 pt-8 flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl text-[var(--color-charcoal)]">Goals</h1>
          <div className="flex items-center gap-3">
            {/* Filter Toggle */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className={`relative w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-all ${
                activeFilterCount > 0
                  ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                  : "border-brand-surface bg-white text-text-muted"
              }`}
              aria-label="Filter and sort goals"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Create Goal */}
            <Link
              href="/goals/new"
              className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5 transition-colors"
              aria-label="Create new goal"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Inspirational Quote */}
        <div className="mb-6">
          <QuoteCard
            quote="Whatever the mind can conceive and believe, it can achieve!"
            author="Napoleon Hill"
          />
        </div>

        {goals.length === 0 ? (
          /* Initial Empty State (No goals created) - Now takes full remaining space */
          <section className="flex-1 flex flex-col pb-8">
            <Link href="/goals/new" className="flex-1 flex flex-col outline-none">
              <div className="flex-1 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-8 text-center hover:border-brand-primary hover:bg-brand-primary/5 transition-all duration-300 flex flex-col items-center justify-center group active:scale-[0.99]">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-brand-primary/10 rounded-2xl group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    <Plus className="w-8 h-8 text-brand-primary group-hover:text-white transition-colors" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-brand-primary uppercase tracking-tight mb-2">
                  Set your first goal
                </h2>
                <p className="text-sm text-text-muted max-w-[240px] leading-relaxed">
                  Start with something meaningful to you and track your journey to potential.
                </p>
              </div>
            </Link>
          </section>
        ) : processedGoals.length === 0 ? (
          /* Filtered Empty State (No matches) */
          <section className="py-12 text-center">
            <div className="bg-white rounded-2xl p-8 border-2 border-brand-surface">
              <p className="text-text-muted mb-6">No goals match your current filters.</p>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="flex items-center justify-center gap-2 mx-auto px-6 py-3 rounded-xl bg-brand-surface text-brand-primary font-medium hover:bg-brand-primary/5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm text-text-muted uppercase tracking-wide mb-3">
                  Active ({activeGoals.length})
                </h2>
                <div className="space-y-4">
                  {activeGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </section>
            )}

            {/* Paused Goals */}
            {pausedGoals.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm text-text-muted uppercase tracking-wide mb-3">
                  Paused ({pausedGoals.length})
                </h2>
                <div className="space-y-4 opacity-60">
                  {pausedGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </section>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <section>
                <h2 className="text-sm text-text-muted uppercase tracking-wide mb-3">
                  Completed ({completedGoals.length})
                </h2>
                <div className="space-y-4 opacity-60">
                  {completedGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Spacer for BottomNav */}
      <div className="h-20" />

      <BottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter & Sort"
      >
        <GoalFilters
          filters={filters}
          onFiltersChange={setFilters}
          onApply={() => setIsFilterOpen(false)}
        />
      </BottomSheet>

      <BottomNav />
    </div>
  );
}
