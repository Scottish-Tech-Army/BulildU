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
  BarChart3,
  X,
  Sprout,
  Smile,
  Shield,
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

  const hasBaseline = baseline.completedAt;
  const hasData = checkIns.length > 0 || goals.length > 0;

  return (
    <div className="min-h-dvh bg-bg-card pb-32 overflow-y-auto">
      {/* Header */}
      <header className="pt-6 pb-4 bg-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-brand-primary" />
            <h1 className="text-2xl text-[var(--color-charcoal)]">Progress</h1>
          </div>
          <p className="text-text-muted mt-1">Move towards your potential</p>
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

        {/* Divider */}
        <hr className="border-gray-200 mb-6" />

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

            {/* Your Achievements Section - Bento Row */}
            <section className="mb-6">
              <div className="grid grid-cols-4 gap-3">
                {/* Left Column - 25% Weekly Energy */}
                <div className="col-span-1 bg-brand-primary rounded-2xl p-5 flex flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Energy Level</h3>
                      <p className="text-xs text-white/70">from weekly check-ins</p>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-5xl font-bold text-white mb-1">
                      {latestEnergy ?? baseline.energyLevel ?? 0}<span className="text-xl font-normal text-white/70">/5</span>
                    </p>
                    {previousEnergy !== null && latestEnergy !== null && latestEnergy !== previousEnergy ? (
                      <p className="text-xs text-white/80 uppercase tracking-wide">
                        {latestEnergy > previousEnergy ? "↑" : "↓"} {Math.abs(latestEnergy - previousEnergy)} vs last week
                      </p>
                    ) : (
                      <p className="text-xs text-white/80 uppercase tracking-wide">No Change</p>
                    )}
                  </div>
                  {/* Motivational Quote */}
                  <p className="text-sm text-white/70 italic text-center mt-4">
                    Energy flows where attention goes.
                  </p>
                </div>

                {/* Right Column - 75% Achievements */}
                <div className="col-span-3 mt-5 mx-4 mb0">
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
                  <div className="grid grid-cols-3 gap-3 mb-0">
                    {/* Streak - First */}
                    <div className="bg-white rounded-xl p-4 min-h-[120px] flex flex-col items-center justify-center text-center border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.08)]">
                      <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
                        Check-in Streak
                      </p>
                      <p className="text-3xl font-bold text-brand-primary flex items-center gap-1">
                        {momentum > 0 && <Flame className="w-6 h-6" />}
                        {momentum}
                      </p>
                      <p className="text-xs text-text-subtle mt-2 italic">
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
                      <p className="text-xs text-text-subtle mt-2 italic">
                        {completedGoals.length === 0 
                          ? "Your journey begins now" 
                          : completedGoals.length === 1 
                          ? "Great start!" 
                          : "You're making progress!"}
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
                      <p className="text-xs text-text-subtle mt-2 italic">
                        {totalSteps === 0 
                          ? "Plan your first steps" 
                          : completedSteps === 0 
                          ? "Take that first step!" 
                          : completedSteps >= totalSteps 
                          ? "Amazing work!" 
                          : "Keep moving forward!"}
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
              </div>
            </section>

            {/* Divider */}
            <hr className="border-gray-200 my-6" />

            {/* Bento Grid Section */}
            <section className="mb-6">
              {/* Section Header */}
              <div className="mb-4 mx-4">
                <h2 className="text-lg font-semibold text-[var(--color-charcoal)]">
                  Where You Stand Now
                </h2>
                <p className="text-sm text-text-muted">vs where you started</p>
              </div>

              {/* Row 1: 2 columns + 1 column */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                {/* Wellbeing Card */}
                <div className="col-span-2 bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.08)] min-h-[180px] relative overflow-hidden">
                  {/* Decorative Icon */}
                  <Sprout className="absolute right-8 bottom-4 w-48 h-48 text-brand-primary/5 transform rotate-12" />
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                      <Sprout className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--color-charcoal)]">Wellbeing</h3>
                  </div>
                  {/* Stats Row */}
                  <div className="flex justify-between mb-5">
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wide mb-2">State of Calm</p>
                      <p className="text-2xl font-bold text-[var(--color-charcoal)]">
                        {baseline.stressLevel === 5 ? "Very High" :
                         baseline.stressLevel === 4 ? "High" :
                         baseline.stressLevel === 3 ? "Moderate" :
                         baseline.stressLevel === 2 ? "Low" : "Very Low"}
                      </p>
                      <p className="text-[10px] text-brand-primary uppercase tracking-wide mt-1">No Change</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wide mb-2">Balance</p>
                      <p className="text-2xl font-bold text-[var(--color-charcoal)]">
                        {baseline.lifeBalance}<span className="text-base font-normal text-text-muted">/5</span>
                      </p>
                      <p className="text-[10px] text-brand-primary uppercase tracking-wide mt-1">No Change</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wide mb-2">Energy</p>
                      {(() => {
                        const baselineEnergy = baseline.energyLevel ?? 0;
                        const currentEnergy = latestEnergy ?? baselineEnergy;
                        if (baselineEnergy === 0) return <p className="text-2xl font-bold text-brand-primary">+0%</p>;
                        const percentChange = Math.round(((currentEnergy - baselineEnergy) / baselineEnergy) * 100);
                        const arrow = percentChange > 0 ? "↑" : percentChange < 0 ? "↓" : "";
                        const isNegative = percentChange < 0;
                        return (
                          <p className={`text-2xl font-bold flex items-center gap-1 ${isNegative ? "text-[var(--color-charcoal)]" : "text-brand-primary"}`}>
                            {arrow}
                            {percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                  {/* State-based message */}
                  <p className="text-base text-text-muted italic">
                    {(baseline.stressLevel ?? 0) >= 4 
                      ? "Your energy is currently grounded and stable."
                      : (baseline.stressLevel ?? 0) === 3
                      ? "You're finding your balance. Keep nurturing yourself."
                      : "Small steps forward still count. You've got this."}
                  </p>
                </div>
                {/* Satisfaction Card - Gradient */}
                <div className="col-span-1 bg-brand-gradient rounded-2xl p-8 min-h-[180px] flex flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Smile className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Satisfaction</h3>
                  </div>
                  {/* Content */}
                  <div className="flex flex-col items-center justify-center text-center mb-4">
                    <p className="text-7xl font-bold text-white mb-1">
                      {baseline.situationSatisfaction ?? 0}<span className="text-2xl font-normal text-white/70">/5</span>
                    </p>
                    <p className="text-xs text-white/80 uppercase tracking-wide">No Change</p>
                  </div>
                  {/* Motivational tagline - pushed to bottom */}
                  <p className="text-base text-white/80 italic text-center mt-auto">
                    {(baseline.situationSatisfaction ?? 0) >= 4 
                      ? "You're on a great path!"
                      : (baseline.situationSatisfaction ?? 0) === 3
                      ? "Room to grow, and that's exciting."
                      : "Every step forward counts."}
                  </p>
                </div>
              </div>

              {/* Row 2: 3 equal columns */}
              <div className="grid grid-cols-3 gap-3">
                {/* Confidence Card */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.08)] min-h-[160px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                  {/* Decorative Icon */}
                  <Shield className="absolute -left-6 -top-6 w-28 h-28 text-brand-primary/5 transform -rotate-12" />
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mb-3">
                    <Shield className="w-5 h-5 text-brand-primary" />
                  </div>
                  <p className="text-sm font-medium text-[var(--color-charcoal)] mb-1">Confidence</p>
                  <p className="text-xl font-bold text-brand-primary mb-1">
                    {baseline.confidence === 5 ? "Very Strong" :
                     baseline.confidence === 4 ? "Strong" :
                     baseline.confidence === 3 ? "Moderate" :
                     baseline.confidence === 2 ? "Low" : "Very Low"}
                  </p>
                  <p className="text-[10px] text-brand-primary uppercase tracking-wide mb-2">No Change</p>
                  <p className="text-sm text-text-muted italic">
                    {(baseline.confidence ?? 0) >= 4 
                      ? "You believe in yourself!"
                      : (baseline.confidence ?? 0) === 3
                      ? "Building momentum."
                      : "One step at a time."}
                  </p>
                </div>

                {/* Future Clarity Card */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.08)] min-h-[160px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                  {/* Decorative Icon */}
                  <Target className="absolute -right-4 -bottom-4 w-24 h-24 text-brand-primary/5 transform rotate-6" />
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mb-3">
                    <Target className="w-5 h-5 text-brand-primary" />
                  </div>
                  <p className="text-sm font-medium text-[var(--color-charcoal)] mb-1">Future Clarity</p>
                  <p className="text-xl font-bold text-brand-primary mb-1">
                    {baseline.futureClarity === 5 ? "Very Clear" :
                     baseline.futureClarity === 4 ? "Clear" :
                     baseline.futureClarity === 3 ? "Moderate" :
                     baseline.futureClarity === 2 ? "Unclear" : "Very Unclear"}
                  </p>
                  <p className="text-[10px] text-brand-primary uppercase tracking-wide mb-2">No Change</p>
                  <p className="text-sm text-text-muted italic">
                    {(baseline.futureClarity ?? 0) >= 4 
                      ? "Your path is clear."
                      : (baseline.futureClarity ?? 0) === 3
                      ? "Clarity comes with action."
                      : "Explore your possibilities."}
                  </p>
                </div>

                {/* Future Positivity Card */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.08)] min-h-[160px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                  {/* Decorative Icon */}
                  <Sparkles className="absolute -right-4 top-1/2 -translate-y-1/2 w-24 h-24 text-brand-primary/5 transform rotate-6" />
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5 text-brand-primary" />
                  </div>
                  <p className="text-sm font-medium text-[var(--color-charcoal)] mb-1">Future Positivity</p>
                  <p className="text-xl font-bold text-brand-primary mb-1">
                    {baseline.futureHope === 5 ? "Very High" :
                     baseline.futureHope === 4 ? "High" :
                     baseline.futureHope === 3 ? "Moderate" :
                     baseline.futureHope === 2 ? "Low" : "Very Low"}
                  </p>
                  <p className="text-[10px] text-brand-primary uppercase tracking-wide mb-2">No Change</p>
                  <p className="text-sm text-text-muted italic">
                    {(baseline.futureHope ?? 0) >= 4 
                      ? "The future looks bright!"
                      : (baseline.futureHope ?? 0) === 3
                      ? "Hope is growing."
                      : "Every day is a fresh start."}
                  </p>
                </div>
              </div>

              {/* Baseline date */}
              {baseline.completedAt && (
                <p className="text-xs text-brand-primary text-center mt-8">
                  Baseline recorded{" "}
                  {new Date(baseline.completedAt).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </section>

          </>
        )}

      </div>

      <BottomNav />
    </div>
  );
}
