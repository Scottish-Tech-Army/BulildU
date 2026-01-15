"use client";

import { useState } from "react";
import Link from "next/link";
import { Goal, getGoals } from "@/lib/storage";
import GoalCard from "@/components/ui/GoalCard";
import BottomNav from "@/components/ui/BottomNav";
import { QuoteCard } from "@/components";

import { Plus } from "lucide-react";

/**
 * Goals list page - Shows all goals with option to create new
 */
export default function GoalsPage() {
  const [goals] = useState<Goal[]>(() => getGoals());
  const [isLoading] = useState(() => false);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-brand-surface">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.status === "active");
  const pausedGoals = goals.filter((g) => g.status === "paused");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return (
    <div className="min-h-dvh bg-brand-surface pb-32">
      <div className="px-6 pt-8 pb-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl text-gray-900">Goals</h1>
          <Link
            href="/goals/new"
            className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5 transition-colors"
            aria-label="Create new goal"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </header>

        {/* Inspirational Quote */}
        <div className="mb-6">
          <QuoteCard 
            quote="Whatever the mind can conceive and believe, it can achieve!"
            author="Napoleon Hill"
          />
        </div>

        {goals.length === 0 ? (
          /* Empty State - dotted border style matching home page */
          <section className="py-12">
            <Link href="/goals/new">
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-brand-primary hover:bg-brand-primary/5 transition-colors">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Plus className="w-5 h-5 text-brand-primary" />
                  <span className="text-brand-primary">Set your first goal</span>
                </div>
                <p className="text-sm text-text-muted">
                  Start with something meaningful to you.
                </p>
              </div>
            </Link>
          </section>
        ) : (
          <>
            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
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
                <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
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
                <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
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

      <BottomNav />
    </div>
  );
}
