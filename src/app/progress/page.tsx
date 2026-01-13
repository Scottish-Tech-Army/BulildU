"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/ui/BottomNav";

import {
  getBaselineResponse,
  getCheckIns,
  getGoals,
  getMomentumDays,
  hasCheckedInThisWeek,
  CheckIn,
  Goal,
  BaselineResponse,
} from "@/lib/storage";
import {
  Flame,
  BarChart3,
  Heart,
  Sparkles,
  Target,
  BookOpen,
  Zap,
  Trophy,
  TrendingUp,
  X,
} from "lucide-react";

/**
 * Progress page - Visual progress across impact measures
 *
 * Shows:
 * - Baseline vs current comparison
 * - Energy trend from check-ins
 * - Goals/milestones completion stats
 * - Celebrate wins
 */
export default function ProgressPage() {
  const router = useRouter();
  const [baseline] = useState<BaselineResponse>(() => getBaselineResponse());
  const [checkIns] = useState<CheckIn[]>(() => getCheckIns());
  const [goals] = useState<Goal[]>(() => getGoals());
  const [momentum] = useState(() => getMomentumDays());
  const [checkInDue] = useState(() => !hasCheckedInThisWeek());
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");



  // Calculate stats
  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const totalMilestones = goals.reduce((sum, g) => sum + g.milestones.length, 0);
  const completedMilestones = goals.reduce(
    (sum, g) => sum + g.milestones.filter((m) => m.completed).length,
    0
  );

  // Get recent energy levels (last 4 check-ins)
  const recentCheckIns = [...checkIns]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
    .reverse();

  // Average current energy
  const avgEnergy =
    recentCheckIns.length > 0
      ? recentCheckIns.reduce((sum, c) => sum + c.energyLevel, 0) /
        recentCheckIns.length
      : null;

  // Baseline sections for comparison - using Lucide icon components
  const impactMeasures = [
    {
      label: "Confidence",
      baseline: baseline.confidence,
      icon: TrendingUp,
      iconColor: "text-brand-primary",
      category: "mindset",
    },
    {
      label: "Self-Esteem",
      baseline: baseline.selfEsteem,
      icon: Heart,
      iconColor: "text-brand-primary",
      category: "mindset",
    },
    {
      label: "Future Clarity",
      baseline: baseline.futureClarity,
      icon: Target,
      iconColor: "text-brand-primary",
      category: "vision",
    },
    {
      label: "Future Hope",
      baseline: baseline.futureHope,
      icon: Sparkles,
      iconColor: "text-brand-primary",
      category: "vision",
    },
    {
      label: "Learning Motivation",
      baseline: baseline.learningMotivation,
      icon: BookOpen,
      iconColor: "text-brand-primary",
      category: "growth",
    },
    {
      label: "Energy Level",
      baseline: baseline.energyLevel,
      current: avgEnergy,
      icon: Zap,
      iconColor: "text-brand-primary",
      category: "wellbeing",
    },
  ];

  const hasBaseline = baseline.completedAt;
  const hasData = checkIns.length > 0 || goals.length > 0;

  return (
    <div className="min-h-dvh bg-brand-surface pb-20">
      <div className="px-6 pt-8 pb-4">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl text-[var(--color-charcoal)]">Progress</h1>
        </header>

        {!hasData && !hasBaseline ? (
          /* Empty State */
          <section className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-brand-primary" />
            </div>
            <h2 className="text-xl text-[var(--color-charcoal)] mb-2">Your journey starts here</h2>
            <p className="text-text-muted max-w-xs">
              Complete your first check-in and set a goal to start tracking your
              progress.
            </p>
          </section>
        ) : (
          <>
            {/* Celebration - dismissible */}
            {!celebrationDismissed && (completedMilestones > 0 || completedGoals.length > 0) && (
              <section className="mb-6">
                <div className="bg-brand-primary/10 rounded-2xl p-4 text-center relative">
                  <button
                    onClick={() => setCelebrationDismissed(true)}
                    className="absolute top-2 right-2 p-1 text-text-muted hover:text-[var(--color-charcoal)] transition-colors"
                    aria-label="Dismiss"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="w-12 h-12 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-6 h-6 text-brand-primary" />
                  </div>
                  <p className="text-[var(--color-charcoal)] font-medium">
                    {completedGoals.length > 0
                      ? `You've completed ${completedGoals.length} goal${
                          completedGoals.length !== 1 ? "s" : ""
                        }!`
                      : `You've hit ${completedMilestones} milestone${
                          completedMilestones !== 1 ? "s" : ""
                        }!`}
                  </p>
                  <p className="text-text-muted text-sm mt-1">
                    Keep up the amazing work!
                  </p>
                </div>
              </section>
            )}

            {/* Your Momentum Section */}
            <section className="mb-6">
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                {/* Header with period tabs */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--color-charcoal)]">
                      Your Momentum
                    </h2>
                    <p className="text-sm text-text-muted">
                      {period === "week" && "This week's stats"}
                      {period === "month" && "This month's stats"}
                      {period === "year" && "This year's stats"}
                    </p>
                  </div>
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {(["week", "month", "year"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          period === p
                            ? "bg-white text-[var(--color-charcoal)] shadow-sm"
                            : "text-text-muted hover:text-[var(--color-charcoal)]"
                        }`}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {/* Goals Completed */}
                  <div className="bg-warm-ivory rounded-xl p-4 min-h-[120px] flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
                      Goals Completed
                    </p>
                    <p className="text-3xl font-bold text-[var(--color-charcoal)]">
                      {completedGoals.length}
                    </p>
                    <p className="text-xs text-text-subtle mt-2">
                      {goals.length > 0 ? `${goals.length} total` : "Set your first goal"}
                    </p>
                  </div>

                  {/* Milestones Done */}
                  <div className="bg-warm-ivory rounded-xl p-4 min-h-[120px] flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
                      Milestones Done
                    </p>
                    <p className="text-3xl font-bold text-[var(--color-charcoal)]">
                      {completedMilestones}/{totalMilestones}
                    </p>
                    <p className="text-xs text-text-subtle mt-2">
                      {totalMilestones > 0 
                        ? `${Math.round((completedMilestones / totalMilestones) * 100)}% complete`
                        : "Add milestones to goals"}
                    </p>
                  </div>

                  {/* Streak */}
                  <div className="bg-warm-ivory rounded-xl p-4 min-h-[120px] flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
                      Streak
                    </p>
                    <p className="text-3xl font-bold text-[var(--color-charcoal)] flex items-center gap-1">
                      {momentum > 0 && <Flame className="w-6 h-6 text-brand-primary" />}
                      {momentum}
                      <span className="text-sm font-normal text-text-muted">
                        {momentum === 1 ? "week" : "weeks"}
                      </span>
                    </p>
                    <p className="text-xs text-text-subtle mt-2">
                      {checkInDue ? "Check in to extend!" : "Keep it going!"}
                    </p>
                  </div>
                </div>

                {/* Check-in prompt */}
                {checkInDue && (
                  <button
                    onClick={() => router.push("/checkin")}
                    className="w-full mt-4 py-3 text-brand-primary font-medium text-sm hover:bg-brand-primary/5 rounded-lg transition-colors"
                  >
                    Complete your weekly check-in →
                  </button>
                )}
              </div>
            </section>

            {/* Where You Stand Now */}
            {hasBaseline && (
              <section className="mb-6">
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-[var(--color-charcoal)]">
                      Where You Stand Now
                    </h2>
                    <p className="text-sm text-text-muted">vs where you started</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {impactMeasures
                      .filter((m) => m.baseline !== undefined)
                      .map((measure) => {
                        const IconComponent = measure.icon;
                        const baselineValue = measure.baseline!;
                        const currentValue = measure.current;
                        
                        const displayValue = currentValue !== undefined && currentValue !== null
                          ? Math.round(currentValue)
                          : baselineValue;
                        
                        let deltaDisplay = null;
                        if (currentValue !== undefined && currentValue !== null) {
                          const delta = currentValue - baselineValue;
                          if (Math.round(delta) !== 0) {
                            const arrow = delta > 0 ? "↗" : "↘";
                            deltaDisplay = `${arrow} ${Math.abs(Math.round(delta * 20))}%`;
                          }
                        }
                        
                        return (
                          <div
                            key={measure.label}
                            className="bg-warm-ivory rounded-2xl p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center">
                                <IconComponent className="w-5 h-5 text-brand-primary" />
                              </div>
                              {deltaDisplay && (
                                <span className="text-xs font-medium text-brand-primary">
                                  {deltaDisplay}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-text-muted mb-1">{measure.label}</p>
                            <p className="text-3xl font-bold text-[var(--color-charcoal)]">
                              {displayValue}
                              <span className="text-base font-normal text-text-muted ml-1">/ 5</span>
                            </p>
                          </div>
                        );
                      })}
                  </div>
                  <p className="text-xs text-text-subtle text-center mt-4">
                    Baseline recorded{" "}
                    {new Date(baseline.completedAt!).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
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
