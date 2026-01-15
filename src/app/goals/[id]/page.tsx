"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppButton } from "@/components/ui/AppButton";
import {
  Goal,
  Milestone,
  getGoalById,
  toggleMilestone,
  updateGoal,
  deleteGoal,
  getGoalProgress,
  addMilestone,
  deleteMilestone,
  updateMilestone,
} from "@/lib/storage";
import {
  Calendar,
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
  Sparkles,
  ListTodo,
  Pencil,
  Target,
  ChevronDown,
} from "lucide-react";

export default function GoalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = params.id as string;

  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");
  
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDate, setEditingDate] = useState("");
  
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editGoalTitle, setEditGoalTitle] = useState("");
  const [editGoalWhy, setEditGoalWhy] = useState("");
  const [editGoalDate, setEditGoalDate] = useState("");
  const [editGoalSuccess, setEditGoalSuccess] = useState("");
  const [editGoalConfidence, setEditGoalConfidence] = useState<number | null>(null);
  
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const loadedGoal = getGoalById(goalId);
      setGoal(loadedGoal);



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
      targetDate: newMilestoneDate || undefined,
    });
    
    setGoal(getGoalById(goalId));
    setNewMilestoneTitle("");
    setNewMilestoneDate("");
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

  const handleStartEdit = (m: Milestone) => {
    setEditingMilestoneId(m.id);
    setEditingTitle(m.title);
    setEditingDate(m.targetDate || "");
  };

  const handleSaveMilestoneEdit = () => {
    if (!goal || !editingMilestoneId || !editingTitle.trim()) return;
    
    updateMilestone(goal.id, editingMilestoneId, {
      title: editingTitle.trim(),
      targetDate: editingDate || undefined,
    });
    
    setGoal(getGoalById(goalId));
    setEditingMilestoneId(null);
  };

  const handleStartEditGoal = () => {
    if (!goal) return;
    setEditGoalTitle(goal.title);
    setEditGoalWhy(goal.whyMatters);
    setEditGoalDate(goal.targetDate || "");
    setEditGoalSuccess(goal.successCriteria || "");
    setEditGoalConfidence(goal.confidence ?? null);
    setIsEditingGoal(true);
  };

  const handleSaveGoalEdit = () => {
    if (!goal || !editGoalTitle.trim() || !editGoalWhy.trim()) return;
    
    updateGoal(goal.id, {
      title: editGoalTitle.trim(),
      whyMatters: editGoalWhy.trim(),
      targetDate: editGoalDate || undefined,
      successCriteria: editGoalSuccess.trim() || undefined,
      confidence: editGoalConfidence ?? undefined,
    });
    
    setGoal(getGoalById(goalId));
    setIsEditingGoal(false);
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
  const isCompleted = goal.status === "completed";

  return (
    <div className="min-h-dvh bg-white pb-24 flex flex-col">

      {/* Goal Title & Steps */}
      <section className="bg-white px-6 lg:px-4 py-10">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between">
          <div>
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Goal
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              {goal.title}
            </h1>
            
            {/* Pills: category, date, status */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                {goal.category}
              </span>
              {goal.targetDate && (
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(goal.targetDate).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${
                goal.status === "active"
                  ? "bg-green-100 text-green-700"
                  : goal.status === "paused"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-brand-primary text-white"
              }`}>
                {goal.status}
              </span>
            </div>
          </div>
          
          {/* Progress Display */}
          <div className="text-center flex-shrink-0">
            <div className="text-5xl font-light text-brand-primary">
              {animatedProgress}%
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              Complete
            </p>
          </div>
        </div>
        <hr className="max-w-[1000px] mx-auto mt-10 border-gray-200" />
      </section>

      {/* Main Content */}
      <main className="flex-1 bg-white px-6 lg:px-4 pt-2 pb-10">
        <div className="max-w-[1000px] mx-auto space-y-8">

        {/* Why This Matters - Quote Card */}
        <section className="bg-brand-gradient rounded-3xl px-8 py-10">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-white" />
            <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">
              Why this matters to me
            </span>
          </div>
          <p className="text-2xl text-white font-medium leading-relaxed">
            &ldquo;{goal.whyMatters}&rdquo;
          </p>
          
          {/* Expandable More Details Section */}
          {(goal.successCriteria || goal.confidence) && (
            <>
              <button
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                className="mt-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showMoreDetails ? 'rotate-180' : ''}`} />
                {showMoreDetails ? 'Less details' : 'More details'}
              </button>
              
              {showMoreDetails && (
                <div className="mt-4 pt-4 border-t border-white/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                  {goal.successCriteria && (
                    <div>
                      <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        How I&apos;ll Know
                      </p>
                      <p className="text-white/90 text-sm leading-relaxed">
                        {goal.successCriteria}
                      </p>
                    </div>
                  )}
                  {goal.confidence && (
                    <div>
                      <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Confidence Level
                      </p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-6 h-2 rounded-full ${
                              level <= goal.confidence!
                                ? 'bg-white'
                                : 'bg-white/30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        {/* Divider */}
        <hr className="border-gray-200" />

        {/* Action Plan */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <ListTodo className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Action Plan</h2>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  Your next steps forward
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowAIInsights(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-sm font-semibold hover:bg-brand-primary/15 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              AI Insights
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Add Milestone Input - Always first */}
            {!isCompleted && (
              <div className="md:col-span-1">
                {isAddingMilestone ? (
                  <div className="md:col-span-1 p-4 bg-white rounded-2xl border-2 border-brand-primary shadow-xl animate-in fade-in zoom-in-95 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                        Step Title
                      </label>
                      <input
                        type="text"
                        value={newMilestoneTitle}
                        onChange={(e) => setNewMilestoneTitle(e.target.value)}
                        placeholder="What needs to be done?"
                        className="w-full text-base font-medium border-none focus:ring-0 placeholder:text-gray-300 bg-transparent p-0"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newMilestoneTitle.trim()) handleAddMilestone();
                          if (e.key === "Escape") {
                            setIsAddingMilestone(false);
                            setNewMilestoneTitle("");
                            setNewMilestoneDate("");
                          }
                        }}
                      />
                    </div>
                    
                    <div className="flex items-end justify-between gap-4 pt-3 border-t border-gray-50">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Set Deadline
                        </label>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
                          <Calendar className="w-4 h-4 text-brand-primary group-hover:scale-110 transition-transform" />
                          <input
                            type="date"
                            value={newMilestoneDate}
                            onChange={(e) => setNewMilestoneDate(e.target.value)}
                            className="flex-1 text-sm border-none focus:ring-0 p-0 text-gray-700 bg-transparent cursor-pointer"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pb-1">
                        <button
                          onClick={() => {
                            setIsAddingMilestone(false);
                            setNewMilestoneTitle("");
                            setNewMilestoneDate("");
                          }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleAddMilestone}
                          className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary/20 disabled:opacity-30 disabled:shadow-none transition-all active:scale-95"
                          disabled={!newMilestoneTitle.trim()}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingMilestone(true)}
                    className="w-full h-full min-h-[80px] flex items-center justify-between px-6 py-4 border-2 border-dashed border-gray-300 rounded-2xl text-sm text-gray-600 hover:border-brand-primary/30 hover:text-brand-primary hover:bg-brand-primary/5 transition-all group"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-semibold text-gray-700">Add new action step</span>
                      <span className="text-xs text-gray-500 group-hover:text-brand-primary/60">Break it down into smaller tasks</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 transform group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6" />
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Existing Milestones - sorted by urgency (earliest deadline first) */}
            {[...goal.milestones]
              .sort((a, b) => {
                // Completed items go to the end
                if (a.completed && !b.completed) return 1;
                if (!a.completed && b.completed) return -1;
                // Items with dates come before items without
                if (a.targetDate && !b.targetDate) return -1;
                if (!a.targetDate && b.targetDate) return 1;
                // Sort by date (earliest first)
                if (a.targetDate && b.targetDate) {
                  return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
                }
                return 0;
              })
              .map((milestone) => (
              <div key={milestone.id} className="group relative">
                {editingMilestoneId === milestone.id ? (
                  <div className="p-4 bg-white rounded-2xl border-2 border-brand-primary shadow-lg space-y-3 animate-in fade-in zoom-in-95">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="w-full text-sm font-medium border-none focus:ring-0 p-0 bg-transparent"
                      autoFocus
                    />
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-2 flex-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-primary/60" />
                        <input
                          type="date"
                          value={editingDate}
                          onChange={(e) => setEditingDate(e.target.value)}
                          className="flex-1 text-[10px] border-none focus:ring-0 p-0 text-gray-600 bg-transparent"
                        />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingMilestoneId(null)}
                          className="p-1.5 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleSaveMilestoneEdit}
                          className="p-1.5 bg-brand-primary text-white rounded-lg"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => !isCompleted && handleMilestoneToggle(milestone.id)}
                      disabled={isCompleted}
                      className={`w-full flex items-center gap-3 text-left p-5 rounded-2xl transition-all border h-full ${
                        milestone.completed
                          ? "bg-warm-ivory border-brand-primary/20 text-brand-primary shadow-sm"
                          : "bg-white border-gray-100 hover:border-brand-primary/20 text-gray-900"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors ${
                          milestone.completed
                            ? "bg-brand-primary border-brand-primary text-white"
                            : "bg-transparent border-gray-200"
                        }`}
                      >
                        {milestone.completed && <Check className="w-4 h-4" />}
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-24">
                        <p className={`text-sm font-medium leading-tight ${
                          milestone.completed ? "text-brand-primary" : "text-gray-900"
                        }`}>
                          {milestone.title}
                        </p>
                        {milestone.targetDate && !milestone.completed && (() => {
                          const now = new Date();
                          now.setHours(0, 0, 0, 0);
                          const target = new Date(milestone.targetDate);
                          target.setHours(0, 0, 0, 0);
                          const diffTime = target.getTime() - now.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          return (
                            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold ring-1 ring-brand-primary/20">
                              <Clock className="w-3.5 h-3.5" />
                              {diffDays < 0 
                                ? `${Math.abs(diffDays)}d overdue` 
                                : diffDays === 0 
                                ? "Due today" 
                                : `${diffDays}d left`}
                            </div>
                          );
                        })()}
                        {!milestone.targetDate && !milestone.completed && (
                          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                            <Calendar className="w-3.5 h-3.5" />
                            No date set
                          </div>
                        )}
                        {milestone.completed && (
                          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold ring-1 ring-brand-primary/20">
                            <Check className="w-3.5 h-3.5" />
                            Completed
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Milestone Actions - Only visible on non-completed goals */}
                    {!isCompleted && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(milestone);
                          }}
                          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all text-brand-primary hover:bg-brand-primary/10"
                          aria-label="Edit milestone"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMilestone(milestone.id);
                          }}
                          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all text-brand-primary hover:bg-brand-primary/10"
                          aria-label="Delete milestone"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>



          {isCompleted && (
            <div className="bg-brand-primary/5 rounded-3xl p-8 text-center border border-brand-primary/10">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-gray-900 font-bold text-xl mb-2">Goal Completed!</h3>
              <p className="text-gray-500 text-sm">You&apos;ve achieved what you set out to do.</p>
            </div>
          )}
        </section>
        </div>
      </main>

      {/* Contextual Action Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {/* Done - Back to Goals */}
          <button
            onClick={() => router.push("/goals")}
            className="flex flex-col items-center justify-center w-full h-full text-brand-primary transition-colors"
          >
            <Check className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Done</span>
          </button>
          
          {/* Edit */}
          <button
            onClick={handleStartEditGoal}
            className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-brand-primary transition-colors"
          >
            <Pencil className="w-6 h-6" />
            <span className="text-xs mt-1">Edit</span>
          </button>
          
          {/* Pause/Resume */}
          {!isCompleted && (
            <button
              onClick={progress === 100 ? handleMarkComplete : handlePauseResume}
              className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-brand-primary transition-colors"
            >
              {progress === 100 ? (
                <>
                  <Check className="w-6 h-6" />
                  <span className="text-xs mt-1">Complete</span>
                </>
              ) : goal.status === "paused" ? (
                <>
                  <PlayCircle className="w-6 h-6" />
                  <span className="text-xs mt-1">Resume</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-6 h-6" />
                  <span className="text-xs mt-1">Pause</span>
                </>
              )}
            </button>
          )}
          
          {/* Delete */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-6 h-6" />
            <span className="text-xs mt-1">Delete</span>
          </button>
        </div>
      </nav>

      {/* Goal Edit Modal Overlay */}
      {isEditingGoal && (
        <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-bottom-full flex flex-col">
          
          {/* Content - Static display with edit buttons */}
          <div className="flex-1 overflow-y-auto pb-24">
            <div className="max-w-sm lg:max-w-2xl mx-auto px-6 py-8 space-y-4">
              
              {/* Page Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Goal</h1>
              
              {/* Goal Title Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 relative group">
                <div className="pr-10">
                  <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center gap-1 mb-2">
                    <Target className="w-3 h-3" /> What
                  </p>
                  {editingMilestoneId === "goal-title" ? (
                    <input
                      type="text"
                      value={editGoalTitle}
                      onChange={(e) => setEditGoalTitle(e.target.value)}
                      onBlur={() => setEditingMilestoneId(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingMilestoneId(null)}
                      autoFocus
                      className="w-full text-lg font-medium text-gray-900 border-b-2 border-brand-primary focus:outline-none bg-transparent"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900 leading-snug">
                      {editGoalTitle || "Untitled Goal"}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditingMilestoneId(editingMilestoneId === "goal-title" ? null : "goal-title")}
                  className="absolute top-5 right-5 p-2 rounded-lg text-brand-primary/50 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {/* Why Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 relative group">
                <div className="pr-10">
                  <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center gap-1 mb-2">
                    <Heart className="w-3 h-3" /> Why
                  </p>
                  {editingMilestoneId === "goal-why" ? (
                    <textarea
                      value={editGoalWhy}
                      onChange={(e) => setEditGoalWhy(e.target.value)}
                      onBlur={() => setEditingMilestoneId(null)}
                      autoFocus
                      rows={3}
                      className="w-full text-base text-gray-700 border-b-2 border-brand-primary focus:outline-none bg-transparent resize-none leading-relaxed"
                    />
                  ) : (
                    <p className="text-base text-gray-700 leading-relaxed">
                      {editGoalWhy || "No motivation set"}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditingMilestoneId(editingMilestoneId === "goal-why" ? null : "goal-why")}
                  className="absolute top-5 right-5 p-2 rounded-lg text-brand-primary/50 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {/* When Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 relative group">
                <div className="pr-10">
                  <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center gap-1 mb-2">
                    <Calendar className="w-3 h-3" /> When
                  </p>
                  {editingMilestoneId === "goal-date" ? (
                    <input
                      type="date"
                      value={editGoalDate}
                      onChange={(e) => setEditGoalDate(e.target.value)}
                      onBlur={() => setEditingMilestoneId(null)}
                      autoFocus
                      className="w-full text-lg font-medium text-gray-900 border-b-2 border-brand-primary focus:outline-none bg-transparent"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">
                      {editGoalDate 
                        ? new Date(editGoalDate).toLocaleDateString("en-AU", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "No date set"}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditingMilestoneId(editingMilestoneId === "goal-date" ? null : "goal-date")}
                  className="absolute top-5 right-5 p-2 rounded-lg text-brand-primary/50 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {/* Success Criteria Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 relative group">
                <div className="pr-10">
                  <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center gap-1 mb-2">
                    <Target className="w-3 h-3" /> How I&apos;ll Know
                  </p>
                  {editingMilestoneId === "goal-success" ? (
                    <textarea
                      value={editGoalSuccess}
                      onChange={(e) => setEditGoalSuccess(e.target.value)}
                      onBlur={() => setEditingMilestoneId(null)}
                      autoFocus
                      rows={2}
                      placeholder="How will you know when you've achieved this?"
                      className="w-full text-base text-gray-700 border-b-2 border-brand-primary focus:outline-none bg-transparent resize-none leading-relaxed"
                    />
                  ) : (
                    <p className="text-base text-gray-700 leading-relaxed">
                      {editGoalSuccess || "Not set"}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditingMilestoneId(editingMilestoneId === "goal-success" ? null : "goal-success")}
                  className="absolute top-5 right-5 p-2 rounded-lg text-brand-primary/50 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {/* Confidence Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm text-brand-primary uppercase tracking-wide flex items-center gap-1 mb-4">
                  <Heart className="w-3 h-3" /> Confidence Level
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setEditGoalConfidence(level)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                        editGoalConfidence === level
                          ? "bg-brand-primary text-white"
                          : "bg-gray-50 text-gray-600 hover:bg-brand-primary/10"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center mt-3">
                  1 = Not confident &nbsp;·&nbsp; 5 = Very confident
                </p>
              </div>
              
            </div>
          </div>

          {/* Contextual Action Bar */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
              {/* Cancel */}
              <button
                onClick={() => setIsEditingGoal(false)}
                className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
                <span className="text-xs mt-1">Cancel</span>
              </button>
              
              {/* Save */}
              <button
                onClick={() => handleSaveGoalEdit()}
                disabled={!editGoalTitle.trim() || !editGoalWhy.trim()}
                className="flex flex-col items-center justify-center w-full h-full text-brand-primary disabled:text-gray-300 transition-colors"
              >
                <Check className="w-6 h-6" />
                <span className="text-xs mt-1 font-medium">Save</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* AI Insights Coming Soon Modal */}
      {showAIInsights && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 animate-in fade-in" onClick={() => setShowAIInsights(false)}>
          <div 
            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-gradient flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              AI Insights
            </h3>
            <p className="text-brand-primary font-semibold text-sm uppercase tracking-widest mb-4">
              Coming Soon
            </p>
            <p className="text-gray-500 mb-8 leading-relaxed">
              We&apos;re building something special to help you achieve your goals faster with personalised AI-powered recommendations.
            </p>
            
            <button
              onClick={() => setShowAIInsights(false)}
              className="w-full py-4 bg-brand-primary text-white font-semibold rounded-2xl hover:bg-brand-primary/90 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 animate-in fade-in" onClick={() => setShowDeleteConfirm(false)}>
          <div 
            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Delete Goal?
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              This will permanently delete this goal and all its milestones. This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
