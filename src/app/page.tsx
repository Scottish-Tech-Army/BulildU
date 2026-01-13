"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Goal,
  getGoals,
  isOnboardingCompleted,
  hasCheckedInThisWeek,
  getMomentumDays,
} from "@/lib/storage";

import BottomNav from "@/components/ui/BottomNav";
import {
  Flame,
  MessageCircle,
  Plus,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";
import GoalCard from "@/components/ui/GoalCard";
import DailyQuote from "@/components/ui/DailyQuote";

/**
 * Returns a contextual coaching message based on milestone due date.
 * Encourages action with varying urgency levels.
 */
function getCoachingMessage(targetDate: string | undefined): string {
  if (!targetDate) {
    return "One step at a time →";
  }

  const now = new Date();
  const due = new Date(targetDate);
  const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) {
    return "Let's get back on track →";
  } else if (daysUntil === 0) {
    return "Today's the day! →";
  } else if (daysUntil === 1) {
    return "Due tomorrow — you've got this →";
  } else if (daysUntil <= 3) {
    return `${daysUntil} days left — small step today? →`;
  } else if (daysUntil <= 7) {
    return "On track — keep the momentum →";
  } else {
    return "Plenty of time — stay steady →";
  }
}

/**
 * Dashboard - Main home page after onboarding
 *
 * Purpose: Progress overview & today's focus
 * Shows momentum, quick stats, and next best action.
 */
export default function DashboardPage() {
  const router = useRouter();
  
  // Check onboarding status synchronously - redirect if not completed
  const onboardingComplete = isOnboardingCompleted();
  
  // Initialize state with lazy initializers (only runs if onboarding is complete)
  const [goals] = useState<Goal[]>(() => onboardingComplete ? getGoals() : []);
  const [showCheckInPrompt] = useState(() => onboardingComplete ? !hasCheckedInThisWeek() : false);
  const [momentum] = useState(() => onboardingComplete ? getMomentumDays() : 0);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!onboardingComplete) {
      router.replace("/onboarding/welcome");
    }
  }, [onboardingComplete, router]);

  // Show nothing while redirecting
  if (!onboardingComplete) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-brand-surface">
        <div className="animate-pulse text-text-subtle">Loading...</div>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.status === "active");
  const totalMilestones = activeGoals.reduce(
    (sum, g) => sum + g.milestones.length,
    0
  );
  const completedMilestones = activeGoals.reduce(
    (sum, g) => sum + g.milestones.filter((m) => m.completed).length,
    0
  );

  // Time-based greeting with icon
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const GreetingIcon = hour < 12 ? Sun : hour < 18 ? Sunset : Moon;

  // Find the next milestone to complete
  const nextMilestone = activeGoals
    .flatMap((goal) =>
      goal.milestones
        .filter((m) => !m.completed)
        .map((m) => ({ ...m, goalTitle: goal.title, goalId: goal.id }))
    )
    .sort((a, b) => {
      if (a.targetDate && b.targetDate) {
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      }
      return a.targetDate ? -1 : 1;
    })[0];

  return (
    <div className="min-h-dvh bg-brand-surface pb-20">
      <div className="px-6 pt-8 pb-4">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl text-[var(--color-charcoal)] mb-1 flex items-center gap-2">
            <GreetingIcon className="w-6 h-6 text-brand-primary" />
            {greeting}
          </h1>
          <p className="text-text-muted">Small steps, real progress</p>
        </header>

        {/* Weekly Check-in Prompt */}
        {showCheckInPrompt && (
          <section className="mb-6">
            <Link href="/checkin">
              <div className="bg-brand-gradient rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Weekly check-in</p>
                    <p className="text-lg font-medium">How are you doing?</p>
                  </div>
                  <div className="p-2 bg-white/20 rounded-full">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Stats + Quote Row - responsive layout */}
        <section className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Quick Stats - stacks vertically in left column on large screens */}
            <div className="lg:col-span-1">
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
                {/* Momentum */}
                <div className="bg-warm-ivory rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-brand-primary flex items-center justify-center gap-1">
                    {momentum > 0 ? (
                      <><Flame className="w-5 h-5 text-brand-primary" />{momentum}</>
                    ) : "—"}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {momentum === 1 ? "week" : "weeks"}
                  </p>
                </div>

                {/* Active Goals */}
                <div className="bg-warm-ivory rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-[var(--color-charcoal)]">
                    {activeGoals.length}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {activeGoals.length === 1 ? "goal" : "goals"}
                  </p>
                </div>

                {/* Milestones Progress */}
                <div className="bg-warm-ivory rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-[var(--color-charcoal)]">
                    {completedMilestones}/{totalMilestones}
                  </p>
                  <p className="text-xs text-text-muted mt-1">done</p>
                </div>
              </div>
            </div>

            {/* Daily Quote - takes 2 columns on large screens */}
            <div className="lg:col-span-2 h-full">
              <DailyQuote className="h-full" />
            </div>
          </div>
        </section>

        {/* Next Best Action */}
        {nextMilestone && (
          <section className="mb-6">
            <h2 className="text-sm text-text-muted uppercase tracking-wide mb-3">
              Focus Today
            </h2>
            <Link href={`/goals/${nextMilestone.goalId}`}>
              <div className="bg-brand-primary rounded-2xl p-4 hover:shadow-lg transition-all duration-200 group cursor-pointer">
                <div className="flex items-stretch gap-4">
                  {/* Content column */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 mb-1">{nextMilestone.goalTitle}</p>
                    <p className="text-white font-medium">
                      {nextMilestone.title}
                    </p>
                    <p className="text-sm text-white/80 mt-1">
                      {getCoachingMessage(nextMilestone.targetDate)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Goals Overview (condensed) */}
        {activeGoals.length > 0 ? (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm text-text-muted uppercase tracking-wide">
                Your Goals
              </h2>
              <Link
                href="/goals"
                className="text-brand-primary text-sm hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {activeGoals.slice(0, 2).map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
              {activeGoals.length > 2 && (
                <Link
                  href="/goals"
                  className="block text-center text-sm text-text-muted py-2 hover:text-brand-primary"
                >
                  +{activeGoals.length - 2} more goal
                  {activeGoals.length - 2 !== 1 ? "s" : ""}
                </Link>
              )}
            </div>
          </section>
        ) : (
          /* Empty State - simpler dotted line style with explainer */
          <section className="mb-6">
            <Link href="/goals/new">
              <div className="border-2 border-dashed border-warm-ivory rounded-2xl p-6 text-center hover:border-brand-primary hover:bg-brand-primary/5 transition-colors">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Plus className="w-5 h-5 text-brand-primary" />
                  <span className="text-brand-primary">Set your first goal</span>
                </div>
                <p className="text-sm text-text-muted">
                  Start with something that matters to you
                </p>
              </div>
            </Link>
          </section>
        )}

        {/* Quick Action: Add Goal */}
        {activeGoals.length > 0 && activeGoals.length < 3 && (
          <section>
            <Link href="/goals/new">
              <div className="border-2 border-dashed border-warm-ivory rounded-2xl p-4 text-center hover:border-brand-primary hover:bg-brand-primary/5 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-5 h-5 text-text-subtle" />
                <span className="text-text-muted hover:text-brand-primary">
                  Add another goal
                </span>
              </div>
            </Link>
          </section>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
