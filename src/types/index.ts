export type HabitType = 'boolean' | 'numeric' | 'time' | 'rating';

export type LifeArea = 'body' | 'mind' | 'school' | 'golf' | 'discipline' | 'life';

export type HabitCategory = LifeArea;

export type HabitPriority = 'MUST' | 'SHOULD' | 'OPTIONAL';

export type HabitFrequency = 'daily' | 'weekly' | 'weekdays' | 'custom';

export interface Habit {
  id: string;
  name: string;
  category: LifeArea;
  icon: string; // Lucide icon identifier
  type: HabitType;
  target: number; // e.g. 1 for boolean, 20 for pages, 120 for min
  unit: string;   // e.g. '', 'Pages', 'Min', 'L', 'Steps', 'Runden'
  frequency: HabitFrequency;
  weeklyTarget?: number; // e.g. 4x/week for Gym, 3x/week for Golf, 2x for Sauna
  priority: HabitPriority;
  customDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  color?: string;
  archived?: boolean;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  value: number;
  completed: boolean;
  planned?: boolean; // if false/undefined on a weekly habit, today is a rest/off day and doesn't penalize score!
  notes?: string;
  updatedAt: string;
}

export interface DailyScheduleItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "07:30"
  title: string;
  category: LifeArea;
  completed: boolean;
}

export interface LifeMilestone {
  id: string;
  date: string;
  title: string;
  category: LifeArea;
  description: string;
  tag?: string;
}

export interface DailyCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  energy: number; // 1-10
  mood: number; // 1-10
  focus: number; // 1-10
  discipline: number; // 1-10
  mainGoal: string; // "Heute werde ich..."
  avoidToday: string; // "Was darf heute nicht passieren?"
  completed: boolean;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  win: string; // Was lief heute gut?
  loss: string; // Was lief heute schlecht?
  lesson: string; // Was habe ich daraus gelernt?
  tomorrow: string; // Was mache ich morgen besser?
  freeNote?: string;
  updatedAt: string;
}

export type SessionType = 'deep_work' | 'studying' | 'coding' | 'gym' | 'golf' | 'reading' | 'meditation' | 'custom';

export interface LockInSession {
  id: string;
  date: string; // YYYY-MM-DD
  type: SessionType;
  title: string;
  durationMinutes: number;
  completed: boolean;
  pointsAwarded: number;
  createdAt: string;
}

export interface ScoreBreakdown {
  habitScore: number;     // max 50
  checkInScore: number;   // max 10
  journalScore: number;   // max 10
  sessionScore: number;   // max 15
  consistencyScore: number; // max 15
  totalScore: number;     // 0 - 100
  habitCompletedCount: number;
  habitTotalCount: number; // Only planned habits!
  sessionMinutes: number;
  activeStreak: number;
}

export interface DailyScore extends ScoreBreakdown {
  id: string;
  date: string;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string; // YYYY-MM-DD (Monday)
  weekEndDate: string;   // YYYY-MM-DD (Sunday)
  avgScore: number;
  habitsCompleted: number;
  habitsTotal: number;
  deepWorkMinutes: number;
  bestDay: string;
  longestStreak: number;
  win: string;
  challenge: string;
  nextWeekFocus: string;
  aiSummary?: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  tagline: string;
  bio: string;
  age: number;
  schoolGrade: string;
  targetScore: number;
  onboardingCompleted: boolean;
  morningReminder: string;
  eveningReminder: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  accentColor: string; // 'lime' | 'emerald' | 'cyan' | 'monochrome'
  enabledAreas: LifeArea[];
}

export type TabType = 'today' | 'habits' | 'jarvis' | 'areas' | 'history' | 'insights';
