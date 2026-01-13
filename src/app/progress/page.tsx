"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/ui/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import {
  getBaselineResponse,
  getCheckIns,
  getGoals,
  getGoalProgress,
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
        <header className="flex items-center gap-3 mb-6">
          <BackButton href="/" />
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
            {/* Momentum & Stats */}
            <section className="mb-6">
              <div
                className={`bg-brand-gradient rounded-2xl p-5 text-white transition-transform ${
                  checkInDue ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : ""
                }`}
                onClick={() => checkInDue && router.push("/checkin")}
                role={checkInDue ? "button" : undefined}
                tabIndex={checkInDue ? 0 : undefined}
                onKeyDown={(e) => checkInDue && e.key === "Enter" && router.push("/checkin")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Your Momentum</p>
                    <p className="text-4xl font-bold flex items-center gap-2">
                      {momentum > 0 ? (
                        <><Flame className="w-8 h-8" />{momentum}</>
                      ) : "—"}
                    </p>
                    <p className="text-white/80 text-sm">
                      {momentum === 0
                        ? "Complete a check-in to start"
                        : checkInDue
                        ? "Tap to check in this week"
                        : momentum === 1
                        ? "week streak"
                        : "weeks in a row"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

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

            <section className="mb-6">
              <h2 className="text-xs font-medium text-text-muted mb-3">
                Goals Progress
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-warm-ivory rounded-2xl p-4 text-center aspect-square flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-[var(--color-charcoal)]">
                    {completedGoals.length}
                  </p>
                  <p className="text-xs text-text-muted mt-1">Goals completed</p>
                </div>
                <div className="bg-warm-ivory rounded-2xl p-4 text-center aspect-square flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-[var(--color-charcoal)]">
                    {completedMilestones}/{totalMilestones}
                  </p>
                  <p className="text-xs text-text-muted mt-1">Milestones done</p>
                </div>
              </div>
            </section>

            {/* Energy Level */}
            {recentCheckIns.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xs font-medium text-text-muted mb-1">
                  This Week&apos;s Energy
                </h2>
                <p className="text-xs text-text-subtle mb-3">vs last check-in</p>
                <div className="bg-warm-ivory rounded-2xl p-5 text-center">
                  {(() => {
                    // Get most recent check-in
                    const latest = recentCheckIns[recentCheckIns.length - 1];
                    const currentEnergy = latest.energyLevel;
                    
                    // Get previous check-in for comparison, or fall back to baseline
                    const previous = recentCheckIns.length > 1 
                      ? recentCheckIns[recentCheckIns.length - 2] 
                      : null;
                    
                    // Compare to previous check-in if available, otherwise compare to baseline
                    const previousEnergy = previous 
                      ? previous.energyLevel 
                      : baseline.energyLevel;
                    
                    const delta = previousEnergy !== undefined ? currentEnergy - previousEnergy : null;
                    const comparisonLabel = previous ? "from last week" : "from baseline";
                    
                    // Determine trend indicator
                    let trendIcon: string;
                    let trendLabel: string;
                    
                    if (delta === null) {
                      trendIcon = "";
                      trendLabel = "No previous data";
                    } else if (delta > 0) {
                      trendIcon = "↑";
                      trendLabel = `+${delta} ${comparisonLabel}`;
                    } else if (delta < 0) {
                      trendIcon = "↓";
                      trendLabel = `${delta} ${comparisonLabel}`;
                    } else {
                      trendIcon = "";
                      trendLabel = `Same as ${previous ? "last week" : "baseline"}`;
                    }
                    
                    return (
                      <>
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-5xl font-light text-brand-primary">
                            {currentEnergy}
                          </span>
                          {trendIcon && (
                            <span className="text-3xl text-brand-primary">
                              {trendIcon}
                            </span>
                          )}
                        </div>
                        {trendLabel && (
                          <p className="text-sm text-text-muted mt-2">
                            {trendLabel}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </section>
            )}

            {/* Impact Measures (Baseline Comparison) */}
            {hasBaseline && (
              <section className="mb-6">
                <h2 className="text-xs font-medium text-text-muted mb-1">
                  Where You Stand Now
                </h2>
                <p className="text-xs text-text-subtle mb-3">vs where you started</p>
                <div className="grid grid-cols-3 gap-4">
                  {impactMeasures
                    .filter((m) => m.baseline !== undefined)
                    .map((measure) => {
                      const IconComponent = measure.icon;
                      const baselineValue = measure.baseline!;
                      const currentValue = measure.current;
                      
                      // Show current value if available, otherwise baseline
                      const displayValue = currentValue !== undefined && currentValue !== null
                        ? Math.round(currentValue)
                        : baselineValue;
                      
                      // Calculate delta from baseline if current data exists
                      let deltaDisplay = null;
                      if (currentValue !== undefined && currentValue !== null) {
                        const delta = currentValue - baselineValue;
                        if (Math.round(delta) !== 0) {
                          const sign = delta > 0 ? "+" : "";
                          const arrow = delta > 0 ? "↑" : "↓";
                          deltaDisplay = `${arrow} ${sign}${Math.round(delta)}`;
                        }
                      }
                      
                      return (
                      <div
                        key={measure.label}
                        className="bg-warm-ivory rounded-2xl p-3 text-center aspect-square flex flex-col items-center justify-center"
                      >
                        {/* Icon and stat in a row */}
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-4 border-warm-ivory flex-shrink-0">
                            <IconComponent className="w-5 h-5 text-brand-primary" />
                          </div>
                          <span className="text-4xl font-bold text-brand-primary">
                            {displayValue}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mt-1 leading-tight">{measure.label}</p>
                        {deltaDisplay && (
                          <p className="text-xs text-brand-primary mt-1 font-medium">
                            {deltaDisplay}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-text-subtle text-center mt-3">
                  Baseline recorded{" "}
                  {new Date(baseline.completedAt!).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </section>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
