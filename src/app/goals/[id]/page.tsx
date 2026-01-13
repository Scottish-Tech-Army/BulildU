"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { BackButton } from "@/components/ui/BackButton";
import { AppButton } from "@/components/ui/AppButton";
import BottomNav from "@/components/ui/BottomNav";
import {
  Goal,
  getGoalById,
  toggleMilestone,
  updateGoal,
  deleteGoal,
  getGoalProgress,
  addMilestone,
  deleteMilestone,
} from "@/lib/storage";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  PlayCircle,
  PauseCircle,
  Trash2,
  Check,
  Search,
  Trophy,
  Heart,
  Plus,
  X,
} from "lucide-react";

export default function GoalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = params.id as string;

  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const loadedGoal = getGoalById(goalId);
      setGoal(loadedGoal);

      if (loadedGoal?.targetDate) {
        const now = new Date();
        const target = new Date(loadedGoal.targetDate);
        const diffTime = target.getTime() - now.getTime();
        const remaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysRemaining(remaining);
      }

      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [goalId]);

  // Animated progress counter
  useEffect(() => {
    if (!goal || isLoading) return;

    const targetProgress = getGoalProgress(goal);
    const duration = 800; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedProgress(Math.round(eased * targetProgress));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [goal, isLoading]);

  const handleMilestoneToggle = (milestoneId: string) => {
    if (!goal) return;
    toggleMilestone(goal.id, milestoneId);
    setGoal(getGoalById(goalId));
  };

  const handleAddMilestone = () => {
    if (!goal || !newMilestoneTitle.trim()) return;
    
    addMilestone(goal.id, {
      title: newMilestoneTitle.trim(),
    });
    
    setGoal(getGoalById(goalId));
    setNewMilestoneTitle("");
    setIsAddingMilestone(false);
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    if (!goal) return;
    deleteMilestone(goal.id, milestoneId);
    setGoal(getGoalById(goalId));
  };

  const handlePauseResume = () => {
    if (!goal) return;
    const newStatus = goal.status === "paused" ? "active" : "paused";
    updateGoal(goal.id, { status: newStatus });
    setGoal(getGoalById(goalId));
  };

  const handleMarkComplete = () => {
    if (!goal) return;
    updateGoal(goal.id, { status: "completed" });
    setGoal(getGoalById(goalId));
  };

  const handleDelete = () => {
    if (!goal) return;
    deleteGoal(goal.id);
    router.push("/goals");
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-white">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-white px-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-xl text-gray-900 mb-2">Goal not found</h1>
        <p className="text-gray-500 mb-6">
          This goal may have been deleted or doesn&apos;t exist.
        </p>
        <AppButton variant="secondary" onClick={() => router.push("/goals")}>
          Back to Goals
        </AppButton>
      </div>
    );
  }

  const progress = getGoalProgress(goal);
  const completedMilestones = goal.milestones.filter((m) => m.completed).length;
  const isCompleted = goal.status === "completed";

  return (
    <div className="min-h-dvh bg-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <BackButton href="/goals" />
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
              goal.status === "active"
                ? "bg-green-100 text-green-700"
                : goal.status === "paused"
                ? "bg-amber-100 text-amber-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {goal.status}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 space-y-6">
        {/* Hero: Animated Progress */}
        <section className="text-center py-8">
          <div className="text-7xl font-light text-brand-primary mb-2">
            {animatedProgress}%
          </div>
          <p className="text-sm text-gray-500">
            {completedMilestones} of {goal.milestones.length} milestones complete
          </p>
        </section>

        {/* Goal Title & Category */}
        <section className="text-center border-b border-gray-100 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {goal.title}
          </h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {goal.category}
          </span>
        </section>

        {/* Why This Matters */}
        <section className="bg-gray-50 rounded-2xl p-5">
          <h2 className="text-xs font-medium text-brand-primary uppercase tracking-wide mb-3 flex items-center gap-2">
            <Heart className="w-3.5 h-3.5" />
            Why this matters
          </h2>
          <p className="text-gray-700 italic">
            &ldquo;{goal.whyMatters}&rdquo;
          </p>
          {goal.feelWhenDone && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                When I achieve this
              </p>
              <p className="text-gray-700 text-sm">{goal.feelWhenDone}</p>
            </div>
          )}
        </section>

        {/* Timeline */}
        {goal.targetDate && (
          <section className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-900 font-medium">
                  {new Date(goal.targetDate).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-gray-500">Target Date</p>
              </div>
            </div>
            {daysRemaining !== null && (
              <span
                className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 ${
                  daysRemaining < 0
                    ? "bg-red-50 text-red-700"
                    : daysRemaining <= 7
                    ? "bg-amber-50 text-amber-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {daysRemaining < 0
                  ? `${Math.abs(daysRemaining)}d overdue`
                  : daysRemaining === 0
                  ? "Due today"
                  : `${daysRemaining}d left`}
              </span>
            )}
          </section>
        )}

        {/* Milestones */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Milestones
            </h2>
            <span className="text-xs text-gray-400">Tap to check</span>
          </div>

          {goal.milestones.length > 0 ? (
            <ul className="space-y-2 mb-4">
              {goal.milestones.map((milestone) => (
                <li key={milestone.id} className="group relative">
                  <button
                    onClick={() =>
                      !isCompleted && handleMilestoneToggle(milestone.id)
                    }
                    disabled={isCompleted}
                    className={`w-full flex items-start gap-3 text-left py-3 px-4 rounded-xl transition-all border ${
                      milestone.completed
                        ? "bg-gray-50 border-transparent"
                        : "bg-white border-gray-100 hover:border-brand-primary/30"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 mt-0.5 ${
                        milestone.completed
                          ? "text-brand-primary"
                          : "text-gray-300"
                      }`}
                    >
                      {milestone.completed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <p
                        className={`text-gray-900 text-sm ${
                          milestone.completed
                            ? "line-through text-gray-400"
                            : ""
                        }`}
                      >
                        {milestone.title}
                      </p>
                      {milestone.targetDate && !milestone.completed && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(milestone.targetDate).toLocaleDateString(
                            "en-AU",
                            { day: "numeric", month: "short" }
                          )}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Delete Button - Only visible on non-completed goals */}
                  {!isCompleted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMilestone(milestone.id);
                      }}
                      className="absolute right-3 top-3 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Delete milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
             !isAddingMilestone && (
              <p className="text-gray-400 text-sm text-center py-8 bg-gray-50 rounded-xl mb-4">
                No milestones yet
              </p>
            )
          )}

          {/* Add Milestone Input */}
          {!isCompleted && (
            <div className="mt-2">
              {isAddingMilestone ? (
                <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-brand-primary/30 shadow-sm animate-in fade-in slide-in-from-top-1">
                  <div className="flex-shrink-0 pl-2">
                    <Circle className="w-5 h-5 text-gray-300" />
                  </div>
                  <input
                    type="text"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    placeholder="What's the next step?"
                    className="flex-1 text-sm border-none focus:ring-0 placeholder:text-gray-400"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddMilestone();
                      if (e.key === "Escape") {
                        setIsAddingMilestone(false);
                        setNewMilestoneTitle("");
                      }
                    }}
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setIsAddingMilestone(false);
                        setNewMilestoneTitle("");
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleAddMilestone}
                      className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg"
                      disabled={!newMilestoneTitle.trim()}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingMilestone(true)}
                  className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-brand-primary/30 hover:text-brand-primary hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add milestone
                </button>
              )}
            </div>
          )}
        </section>

        {/* Actions */}
        <section className="space-y-3 pt-4">
          {!isCompleted && (
            <>
              {progress === 100 ? (
                <AppButton
                  onClick={handleMarkComplete}
                  className="bg-brand-primary"
                >
                  <Check className="w-5 h-5" />
                  Mark Goal as Complete
                </AppButton>
              ) : (
                <AppButton
                  onClick={handlePauseResume}
                  variant={goal.status === "paused" ? "primary" : "secondary"}
                >
                  {goal.status === "paused" ? (
                    <PlayCircle className="w-5 h-5" />
                  ) : (
                    <PauseCircle className="w-5 h-5" />
                  )}
                  {goal.status === "paused" ? "Resume Goal" : "Pause Goal"}
                </AppButton>
              )}
            </>
          )}

          {isCompleted && (
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-gray-900 font-bold text-xl mb-2">
                Goal Completed!
              </h3>
              <p className="text-gray-500">
                You&apos;ve achieved what you set out to do.
              </p>
            </div>
          )}

          {/* Delete */}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 py-2 text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Goal
            </button>
          ) : (
            <div className="bg-red-50 rounded-xl p-4 space-y-3 border border-red-100">
              <p className="text-sm text-red-800 text-center font-medium">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <AppButton
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 !py-2"
                >
                  Cancel
                </AppButton>
                <AppButton
                  variant="danger"
                  onClick={handleDelete}
                  className="flex-1 !py-2"
                >
                  Delete
                </AppButton>
              </div>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
