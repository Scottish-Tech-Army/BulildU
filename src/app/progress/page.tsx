"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/ui/BottomNav";
import DailyQuote from "@/components/ui/DailyQuote";

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
  Sparkles,
  Target,
  Zap,
  Trophy,
  TrendingUp,
  BarChart3,
  X,
  Activity,
  ListTodo,
} from "lucide-react";

/**
 * Progress page - Visual progress across impact measures
 *
 * Shows:
 * - Baseline vs current comparison
 * - Energy trend from check-ins
 * - Goals/steps completion stats
 * - Celebrate wins
 */
export default function ProgressPage() {
  const router = useRouter();
  
  // Use lazy initializers that are safe for SSR
  const [baseline] = useState<BaselineResponse>(() => 
    typeof window !== 'undefined' ? getBaselineResponse() : {}
  );
  const [checkIns] = useState<CheckIn[]>(() => 
    typeof window !== 'undefined' ? getCheckIns() : []
  );
  const [goals] = useState<Goal[]>(() => 
    typeof window !== 'undefined' ? getGoals() : []
  );
  const [momentum] = useState(() => 
    typeof window !== 'undefined' ? getMomentumDays() : 0
  );
  const [checkInDue] = useState(() => 
    typeof window !== 'undefined' ? !hasCheckedInThisWeek() : false
  );
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");



  // Calculate stats
  const completedGoals = goals.filter((g) => g.status === "completed");
  const totalSteps = goals.reduce((sum, g) => sum + g.steps.length, 0);
  const completedSteps = goals.reduce(
    (sum, g) => sum + g.steps.filter((s) => s.completed).length,
    0
  );

  // Get recent energy levels from check-ins
  const recentCheckIns = [...checkIns]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
  
  const latestEnergy = recentCheckIns.length > 0 ? recentCheckIns[0].energyLevel : null;
  const previousEnergy = recentCheckIns.length > 1 ? recentCheckIns[1].energyLevel : null;

  // Baseline sections for comparison - using Lucide icon components
  const impactMeasures = [
    {
      label: "Satisfaction",
      baseline: baseline.situationSatisfaction,
      icon: Flame,
      category: "situation",
    },
    {
      label: "Confidence",
      baseline: baseline.confidence,
      icon: TrendingUp,
      category: "mindset",
    },
    {
      label: "Future Clarity",
      baseline: baseline.futureClarity,
      icon: Target,
      category: "vision",
    },
    {
      label: "Future Positivity",
      baseline: baseline.futureHope,
      icon: Sparkles,
      category: "vision",
    },
    {
      label: "State of Calm",
      baseline: baseline.stressLevel,
      icon: Activity,
      category: "wellbeing",
    },
    {
      label: "Energy Level",
      baseline: baseline.energyLevel,
      icon: Zap,
      category: "wellbeing",
    },
    {
      label: "Balance",
      baseline: baseline.lifeBalance,
      icon: BarChart3,
      category: "wellbeing",
    },
  ];

  const hasBaseline = baseline.completedAt;
  const hasData = checkIns.length > 0 || goals.length > 0;

  return (
    <div className="min-h-dvh bg-bg-card pb-32 overflow-y-auto">
      {/* Header */}
      <header className="pt-6 pb-4 bg-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-brand-primary" />
          <h1 className="text-2xl text-[var(--color-charcoal)]">Progress</h1>
        </div>
      </header>

      <div className="px-6 pb-4 max-w-5xl mx-auto w-full pt-4">
        {/* Inspirational Quote */}
        <div className="mb-6">
          <DailyQuote 
            quote="The smallest of actions is always better than the noblest of intentions."
            author="Robin Sharma"
          />
        </div>

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
            {!celebrationDismissed && (completedSteps > 0 || completedGoals.length > 0) && (
              <section className="mb-6">
                <div className="bg-brand-gradient rounded-2xl p-4 text-center relative shadow-[0_0_15px_rgba(0,0,0,0.08)]">
                  <button
                    onClick={() => setCelebrationDismissed(true)}
                    className="absolute top-2 right-2 p-1 text-white/70 hover:text-white transition-colors"
                    aria-label="Dismiss"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-medium">
                    {completedGoals.length > 0
                      ? `You've achieved ${completedGoals.length} goal${
                          completedGoals.length !== 1 ? "s" : ""
                        }!`
                      : `You've hit ${completedSteps} step${
                          completedSteps !== 1 ? "s" : ""
                        }!`}
                  </p>
                  <p className="text-white/80 text-sm mt-1">
                    Keep up the amazing work!
                  </p>
                </div>
              </section>
            )}

            {/* Your Achievements Section */}
            <section className="mb-6">
              <div>
                {/* Header with period tabs */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--color-charcoal)]">
                      Your Achievements
                    </h2>
                    <p className="text-sm text-text-muted">
                      {period === "week" && "This week's progress"}
                      {period === "month" && "This month's stats"}
                      {period === "year" && "This year's stats"}
                    </p>
                  </div>
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1 shadow-[0_0_15px_rgba(0,0,0,0.08)]">
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
                  {/* Streak - First */}
                  <div className="bg-white rounded-xl p-4 min-h-[120px] flex flex-col items-center justify-center text-center border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.08)]">
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
                      Weeks Streak
                    </p>
                    <p className="text-3xl font-bold text-brand-primary flex items-center gap-1">
                      {momentum > 0 && <Flame className="w-6 h-6" />}
                      {momentum}
                    </p>
                    <p className="text-xs text-text-subtle mt-2">
                      {checkInDue ? "Check in to extend!" : "Keep it going!"}
                    </p>
                  </div>

                  {/* Goals Completed */}
                  <div className="bg-white rounded-xl p-4 min-h-[120px] flex flex-col items-center justify-center text-center border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.08)]">
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
                      Goals Achieved
                    </p>
                    <p className="text-3xl font-bold text-[var(--color-charcoal)]">
                      {completedGoals.length}
                    </p>
                    <p className="text-xs text-text-subtle mt-2">
                      {goals.length > 0 ? `${goals.length} total` : "Set your first goal"}
                    </p>
                  </div>

                  {/* Steps Done */}
                  <div className="bg-white rounded-xl p-4 min-h-[120px] flex flex-col items-center justify-center text-center border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.08)]">
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
                      Steps Done
                    </p>
                    <p className="text-3xl font-bold text-[var(--color-charcoal)]">
                      {completedSteps}/{totalSteps}
                    </p>
                    <p className="text-xs text-text-subtle mt-2">
                      {totalSteps > 0 
                        ? `${Math.round((completedSteps / totalSteps) * 100)}% complete`
                        : "Add steps to goals"}
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
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.08)]">
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
                        const displayValue = measure.baseline!;
                        
                        return (
                          <div
                            key={measure.label}
                            className="bg-warm-ivory rounded-2xl p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center">
                                <IconComponent className="w-5 h-5 text-brand-primary" />
                              </div>
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

            {/* Energy Level from Check-ins */}
            {latestEnergy !== null && (
              <section className="mb-6">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.08)]">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-[var(--color-charcoal)]">
                      Energy Level
                    </h2>
                    <p className="text-sm text-text-muted">from your weekly check-ins</p>
                  </div>
                  <div className="bg-warm-ivory rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center">
                        <Zap className="w-5 h-5 text-brand-primary" />
                      </div>
                      {previousEnergy !== null && latestEnergy !== previousEnergy && (
                        <span className="text-xs font-medium text-brand-primary">
                          {latestEnergy > previousEnergy ? "↗" : "↘"} {latestEnergy > previousEnergy ? "+" : ""}{latestEnergy - previousEnergy} from last week
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-muted mb-1">Current Energy</p>
                    <p className="text-3xl font-bold text-[var(--color-charcoal)]">
                      {latestEnergy}
                      <span className="text-base font-normal text-text-muted ml-1">/ 5</span>
                    </p>
                  </div>
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
