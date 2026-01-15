/**
 * localStorage helpers for EmpwrU PWA
 *
 * All keys are prefixed with 'empwru:' to avoid collisions.
 * Data is stored as JSON.
 */

const STORAGE_PREFIX = "empwru:";

// Storage keys
export const STORAGE_KEYS = {
  ONBOARDING: `${STORAGE_PREFIX}onboarding`,
  BASELINE: `${STORAGE_PREFIX}baseline`,
  CATEGORY: `${STORAGE_PREFIX}category`,
  GOALS: `${STORAGE_PREFIX}goals`,
  CHECKINS: `${STORAGE_PREFIX}checkins`,
  PREFERENCES: `${STORAGE_PREFIX}preferences`,
  DAILY_QUOTE: "empwru_daily_quote", // Standardized name
} as const;

// Onboarding state
export interface OnboardingState {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  completed: boolean;
  reminderTime?: "morning" | "evening";
  reminderDate?: string; // ISO date string - one week from setup
}

const DEFAULT_ONBOARDING: OnboardingState = {
  currentStep: 1,
  completed: false,
};

/**
 * Check if code is running in browser (not SSR)
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Get onboarding state from localStorage
 */
export function getOnboardingState(): OnboardingState {
  if (!isBrowser()) return DEFAULT_ONBOARDING;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
    if (!stored) return DEFAULT_ONBOARDING;
    return JSON.parse(stored) as OnboardingState;
  } catch {
    return DEFAULT_ONBOARDING;
  }
}

/**
 * Save onboarding state to localStorage
 */
export function saveOnboardingState(state: Partial<OnboardingState>): void {
  if (!isBrowser()) return;

  const current = getOnboardingState();
  const updated = { ...current, ...state };
  localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(updated));
}

/**
 * Check if onboarding is completed
 */
export function isOnboardingCompleted(): boolean {
  return getOnboardingState().completed;
}

/**
 * Mark onboarding as completed
 */
export function completeOnboarding(): void {
  saveOnboardingState({ completed: true });
}

/**
 * Reset all app data (for testing/debugging)
 */
export function resetAllData(): void {
  if (!isBrowser()) return;

  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

// =============================================================================
// Baseline Quiz Responses
// =============================================================================

export type WorkStatus =
  | "unemployed"
  | "employed"
  | "self-employed"
  | "studying"
  | "other";

export interface BaselineResponse {
  // Section 1: Current Situation
  workStatus?: WorkStatus;
  situationSatisfaction?: number; // 1-5

  // Section 2: Confidence & Self-Esteem
  confidence?: number; // 1-5
  selfEsteem?: number; // 1-5

  // Section 3: Aspirations
  futureClarity?: number; // 1-5
  futureHope?: number; // 1-5

  // Section 4: Skills & Learning
  buildingSkills?: "yes" | "no";
  learningMotivation?: number; // 1-5

  // Section 5: Wellbeing
  energyLevel?: number; // 1-5
  stressLevel?: number; // 1-5 (inverted: 1=high stress, 5=low stress)
  lifeBalance?: number; // 1-5
  hasBalance?: "yes" | "no" | "unsure"; // Legacy field

  // Metadata
  completedAt?: string; // ISO date string
}

const DEFAULT_BASELINE: BaselineResponse = {};

/**
 * Get baseline responses from localStorage
 */
export function getBaselineResponse(): BaselineResponse {
  if (!isBrowser()) return DEFAULT_BASELINE;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BASELINE);
    if (!stored) return DEFAULT_BASELINE;
    return JSON.parse(stored) as BaselineResponse;
  } catch {
    return DEFAULT_BASELINE;
  }
}

/**
 * Save baseline responses to localStorage
 */
export function saveBaselineResponse(response: Partial<BaselineResponse>): void {
  if (!isBrowser()) return;

  const current = getBaselineResponse();
  const updated = { ...current, ...response };
  localStorage.setItem(STORAGE_KEYS.BASELINE, JSON.stringify(updated));
}

/**
 * Mark baseline as completed with timestamp
 */
export function completeBaseline(): void {
  saveBaselineResponse({ completedAt: new Date().toISOString() });
}

// =============================================================================
// Goals
// =============================================================================

export type GoalCategory = "Wellbeing" | "Career" | "Finances" | "Growth" | "Family";

export interface Action {
  id: string;
  title: string;
  completed: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate?: string; // ISO date
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;

  // SMART Framework fields
  whyMatters: string;        // Relevant - why this goal matters
  successCriteria?: string;  // Measurable - how they'll know they achieved it
  confidence?: number;       // Achievable - 1-5 confidence rating
  targetDate?: string;       // Time-bound - ISO date

  // Legacy fields (kept for backwards compatibility)
  feelWhenDone: string;
  holdingBack?: string;

  // Timeline
  createdAt: string; // ISO date

  // Progress
  status: "active" | "completed" | "paused";
  milestones: Milestone[];
  actions: Action[];
}

/**
 * Generate a unique ID for goals/milestones/actions
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all goals from localStorage
 */
export function getGoals(): Goal[] {
  if (!isBrowser()) return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!stored) return [];
    return JSON.parse(stored) as Goal[];
  } catch {
    return [];
  }
}

/**
 * Get a single goal by ID
 */
export function getGoalById(id: string): Goal | null {
  const goals = getGoals();
  return goals.find((g) => g.id === id) || null;
}

/**
 * Save all goals to localStorage
 */
function saveGoals(goals: Goal[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
}

/**
 * Create a new goal
 */
export function createGoal(
  goal: Omit<Goal, "id" | "createdAt" | "status">
): Goal {
  const newGoal: Goal = {
    ...goal,
    id: generateId(),
    createdAt: new Date().toISOString(),
    status: "active",
  };

  const goals = getGoals();
  goals.push(newGoal);
  saveGoals(goals);

  return newGoal;
}

/**
 * Update an existing goal
 */
export function updateGoal(id: string, updates: Partial<Goal>): Goal | null {
  const goals = getGoals();
  const index = goals.findIndex((g) => g.id === id);

  if (index === -1) return null;

  goals[index] = { ...goals[index], ...updates };
  saveGoals(goals);

  return goals[index];
}

/**
 * Delete a goal
 */
export function deleteGoal(id: string): boolean {
  const goals = getGoals();
  const filtered = goals.filter((g) => g.id !== id);

  if (filtered.length === goals.length) return false;

  saveGoals(filtered);
  return true;
}

/**
 * Helper to sync goal status based on milestone completion
 */
function syncGoalStatus(goal: Goal): Goal {
  if (goal.milestones.length === 0) {
    if (goal.status === "completed") {
      goal.status = "active";
    }
    return goal;
  }

  const allCompleted = goal.milestones.every((m) => m.completed);
  
  if (allCompleted && goal.status !== "completed") {
    goal.status = "completed";
  } else if (!allCompleted && goal.status === "completed") {
    goal.status = "active";
  }

  return goal;
}

/**
 * Add a milestone to a goal
 */
export function addMilestone(
  goalId: string,
  milestone: Omit<Milestone, "id" | "completed">
): Milestone | null {
  const goal = getGoalById(goalId);
  if (!goal) return null;

  const newMilestone: Milestone = {
    ...milestone,
    id: generateId(),
    completed: false,
  };

  goal.milestones.push(newMilestone);
  
  // Sync status
  syncGoalStatus(goal);
  
  updateGoal(goalId, { 
    milestones: goal.milestones,
    status: goal.status 
  });

  return newMilestone;
}

/**
 * Toggle milestone completion
 */
export function toggleMilestone(
  goalId: string,
  milestoneId: string
): boolean {
  const goal = getGoalById(goalId);
  if (!goal) return false;

  const milestone = goal.milestones.find((m) => m.id === milestoneId);
  if (!milestone) return false;

  milestone.completed = !milestone.completed;
  
  // Sync status
  syncGoalStatus(goal);
  
  updateGoal(goalId, { 
    milestones: goal.milestones,
    status: goal.status 
  });

  return true;
}

/**
 * Delete a milestone from a goal
 */
export function deleteMilestone(goalId: string, milestoneId: string): boolean {
  const goal = getGoalById(goalId);
  if (!goal) return false;

  const initialLength = goal.milestones.length;
  goal.milestones = goal.milestones.filter((m) => m.id !== milestoneId);

  if (goal.milestones.length === initialLength) return false;

  // Sync status
  syncGoalStatus(goal);

  updateGoal(goalId, { 
    milestones: goal.milestones,
    status: goal.status 
  });
  return true;
}

/**
 * Update a milestone's details
 */
export function updateMilestone(
  goalId: string,
  milestoneId: string,
  updates: Partial<Omit<Milestone, "id">>
): boolean {
  const goal = getGoalById(goalId);
  if (!goal) return false;

  const milestone = goal.milestones.find((m) => m.id === milestoneId);
  if (!milestone) return false;

  Object.assign(milestone, updates);
  
  // Sync status (in case completion was updated manually via updates)
  syncGoalStatus(goal);

  updateGoal(goalId, { 
    milestones: goal.milestones,
    status: goal.status 
  });
  return true;
}

/**
 * Add an action to a goal
 */
export function addAction(
  goalId: string,
  action: Omit<Action, "id" | "completed">
): Action | null {
  const goal = getGoalById(goalId);
  if (!goal) return null;

  const newAction: Action = {
    ...action,
    id: generateId(),
    completed: false,
  };

  goal.actions.push(newAction);
  updateGoal(goalId, { actions: goal.actions });

  return newAction;
}

/**
 * Toggle action completion
 */
export function toggleAction(goalId: string, actionId: string): boolean {
  const goal = getGoalById(goalId);
  if (!goal) return false;

  const action = goal.actions.find((a) => a.id === actionId);
  if (!action) return false;

  action.completed = !action.completed;
  updateGoal(goalId, { actions: goal.actions });

  return true;
}

/**
 * Get active goals count
 */
export function getActiveGoalsCount(): number {
  return getGoals().filter((g) => g.status === "active").length;
}

/**
 * Calculate goal progress (percentage of milestones completed)
 */
export function getGoalProgress(goal: Goal): number {
  if (goal.milestones.length === 0) return 0;
  const completed = goal.milestones.filter((m) => m.completed).length;
  return Math.round((completed / goal.milestones.length) * 100);
}

// =============================================================================
// Weekly Check-ins
// =============================================================================

export interface CheckIn {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  energyLevel: number; // 1-5 scale
  reflection?: string; // Optional weekly reflection
  milestonesCompleted: string[]; // IDs of milestones marked complete this session
  createdAt: string; // ISO datetime
}

/**
 * Get all check-ins from localStorage
 */
export function getCheckIns(): CheckIn[] {
  if (!isBrowser()) return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CHECKINS);
    if (!stored) return [];
    return JSON.parse(stored) as CheckIn[];
  } catch {
    return [];
  }
}

/**
 * Get the most recent check-in
 */
export function getLastCheckIn(): CheckIn | null {
  const checkIns = getCheckIns();
  if (checkIns.length === 0) return null;
  
  // Sort by date descending and return the most recent
  return checkIns.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
}

/**
 * Save a new check-in to localStorage
 */
export function saveCheckIn(
  checkIn: Omit<CheckIn, "id" | "createdAt">
): CheckIn {
  const newCheckIn: CheckIn = {
    ...checkIn,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  const checkIns = getCheckIns();
  checkIns.push(newCheckIn);
  
  if (!isBrowser()) return newCheckIn;
  localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkIns));

  return newCheckIn;
}

/**
 * Get the start of the current week (Monday)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Check if user has checked in during the current week
 */
export function hasCheckedInThisWeek(): boolean {
  const lastCheckIn = getLastCheckIn();
  if (!lastCheckIn) return false;

  const now = new Date();
  const weekStart = getWeekStart(now);
  const checkInDate = new Date(lastCheckIn.createdAt);

  return checkInDate >= weekStart;
}

/**
 * Calculate momentum days (consecutive weeks with check-ins)
 */
export function getMomentumDays(): number {
  const checkIns = getCheckIns();
  if (checkIns.length === 0) return 0;

  // Sort check-ins by date descending
  const sorted = checkIns.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  let momentum = 0;
  let currentWeekStart = getWeekStart(new Date());

  for (const checkIn of sorted) {
    const checkInDate = new Date(checkIn.createdAt);
    const checkInWeekStart = getWeekStart(checkInDate);

    // If this check-in is in the current week we're checking
    if (checkInWeekStart.getTime() === currentWeekStart.getTime()) {
      momentum++;
      // Move to previous week
      currentWeekStart = new Date(currentWeekStart);
      currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    } else if (checkInWeekStart.getTime() < currentWeekStart.getTime()) {
      // Gap in weeks, streak broken
      break;
    }
    // If same week as already counted, continue to next check-in
  }

  return momentum;
}

// =============================================================================
// Weekly Momentum Data for Charts
// =============================================================================

export interface WeeklyMomentumData {
  weekStart: Date;
  weekLabel: string; // e.g., "Jan 01"
  hasCheckIn: boolean;
  avgEnergy: number | null; // 1-5 scale, null if no check-in
  milestonesCompleted: number;
  score: number; // 0-100 performance velocity score
}

/**
 * Get weekly momentum data for the past N weeks (default 8)
 * Used for rendering the momentum line chart
 */
export function getWeeklyMomentumData(weeksCount: number = 8): WeeklyMomentumData[] {
  const checkIns = getCheckIns();
  const goals = getGoals();
  const totalMilestones = goals.reduce((sum, g) => sum + g.milestones.length, 0);
  
  const weeks: WeeklyMomentumData[] = [];
  const now = new Date();
  
  for (let i = weeksCount - 1; i >= 0; i--) {
    const weekStart = getWeekStart(new Date(now));
    weekStart.setDate(weekStart.getDate() - (i * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    // Find check-ins for this week
    const weekCheckIns = checkIns.filter(c => {
      const checkInDate = new Date(c.createdAt);
      return checkInDate >= weekStart && checkInDate < weekEnd;
    });
    
    const hasCheckIn = weekCheckIns.length > 0;
    
    // Calculate average energy for the week
    const avgEnergy = hasCheckIn
      ? weekCheckIns.reduce((sum, c) => sum + c.energyLevel, 0) / weekCheckIns.length
      : null;
    
    // Count milestones completed this week
    const milestonesCompleted = weekCheckIns.reduce(
      (sum, c) => sum + c.milestonesCompleted.length,
      0
    );
    
    // Calculate performance velocity score (0-100)
    // - Check-in completion: 40 points (did they check in?)
    // - Energy level: 30 points (normalized from 1-5 to 0-30)
    // - Milestone progress: 30 points (based on total milestones)
    let score = 0;
    
    if (hasCheckIn) {
      score += 40; // Check-in bonus
      score += avgEnergy ? ((avgEnergy - 1) / 4) * 30 : 0; // Energy (1-5 -> 0-30)
      score += totalMilestones > 0 
        ? Math.min(30, (milestonesCompleted / totalMilestones) * 100 * 0.3)
        : 0;
    }
    
    // Format week label
    const weekLabel = weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
    
    weeks.push({
      weekStart,
      weekLabel,
      hasCheckIn,
      avgEnergy,
      milestonesCompleted,
      score: Math.round(score),
    });
  }
  
  return weeks;
}
