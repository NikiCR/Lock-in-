import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Habit,
  HabitLog,
  DailyCheckIn,
  JournalEntry,
  LockInSession,
  UserProfile,
  TabType,
  ScoreBreakdown,
  DailyScheduleItem,
  LifeMilestone,
  LifeArea,
} from '../types';
import { getTodayDateString, getPastDates, getWeekStartAndEnd, isHabitScheduledForDate } from '../utils/dateUtils';
import { calculateDailyLockInScore, calculateAreaScores } from '../utils/scoreCalculator';
import {
  generateSeedData,
  DEFAULT_PROFILE,
  DEFAULT_HABITS,
  DEFAULT_SCHEDULE_ITEMS,
  DEFAULT_MILESTONES,
} from '../utils/initialData';
import { sound } from '../utils/audio';

const STORAGE_KEY = 'lockin_life_os_niklas_v2';

export interface WeeklyProgressItem {
  habitId: string;
  name: string;
  category: LifeArea;
  current: number;
  target: number;
  unit: string;
  completed: boolean;
}

interface AppContextType {
  habits: Habit[];
  logs: HabitLog[];
  checkIns: DailyCheckIn[];
  journals: JournalEntry[];
  sessions: LockInSession[];
  profile: UserProfile;
  schedule: DailyScheduleItem[];
  milestones: LifeMilestone[];
  currentDate: string;
  activeTab: TabType;
  
  // Computed for currentDate
  currentScore: ScoreBreakdown;
  todayScore: ScoreBreakdown;
  currentStreak: number;
  bestStreak: number;
  overallConsistency: number;
  areaScores: Record<LifeArea, { score: number; completedCount: number; targetCount: number; weeklyProgress?: { current: number; target: number } }>;
  weeklyGoalsSummary: WeeklyProgressItem[];
  
  // JARVIS AI
  jarvisAdvice: string;
  isJarvisLoading: boolean;
  askJarvis: (question?: string, mode?: 'briefing' | 'evening' | 'advice' | 'chat') => Promise<string>;

  // Comeback status
  showComebackBanner: boolean;
  dismissComebackBanner: () => void;

  // Modals state
  isScoreModalOpen: boolean;
  setIsScoreModalOpen: (open: boolean) => void;
  isCheckInModalOpen: boolean;
  setIsCheckInModalOpen: (open: boolean) => void;
  isJournalModalOpen: boolean;
  setIsJournalModalOpen: (open: boolean) => void;
  isAddHabitModalOpen: boolean;
  setIsAddHabitModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isWeeklyReviewModalOpen: boolean;
  setIsWeeklyReviewModalOpen: (open: boolean) => void;
  isWeeklyPlanModalOpen: boolean;
  setIsWeeklyPlanModalOpen: (open: boolean) => void;
  isJarvisModalOpen: boolean;
  setIsJarvisModalOpen: (open: boolean) => void;
  isBriefingModalOpen: boolean;
  setIsBriefingModalOpen: (open: boolean) => void;
  isTimelineModalOpen: boolean;
  setIsTimelineModalOpen: (open: boolean) => void;
  isTimerActive: boolean;
  setIsTimerActive: (active: boolean) => void;

  // Actions
  setActiveTab: (tab: TabType) => void;
  setCurrentDate: (date: string) => void;
  goToToday: () => void;
  toggleHabit: (habitId: string, dateStr?: string) => void;
  toggleHabitPlanned: (habitId: string, dateStr?: string) => void;
  updateHabitValue: (habitId: string, value: number, dateStr?: string) => void;
  createHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  editHabit: (habitId: string, updates: Partial<Habit>) => void;
  deleteHabit: (habitId: string) => void;
  saveCheckIn: (data: Partial<DailyCheckIn>, dateStr?: string) => void;
  saveJournal: (data: Partial<JournalEntry>, dateStr?: string) => void;
  addLockInSession: (session: Omit<LockInSession, 'id' | 'createdAt'>) => void;
  toggleScheduleItem: (itemId: string) => void;
  addScheduleItem: (item: Omit<DailyScheduleItem, 'id'>) => void;
  addMilestone: (milestone: Omit<LifeMilestone, 'id'>) => void;
  updateWeeklyTarget: (habitId: string, target: number) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  getScoreForDate: (dateStr: string) => ScoreBreakdown;
  getHabitStats: (habitId: string) => {
    completionRate: number;
    currentStreak: number;
    bestStreak: number;
    totalCompleted: number;
    missedDays: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayStr = getTodayDateString();

  const [dataLoaded, setDataLoaded] = useState(false);
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [sessions, setSessions] = useState<LockInSession[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [schedule, setSchedule] = useState<DailyScheduleItem[]>(DEFAULT_SCHEDULE_ITEMS);
  const [milestones, setMilestones] = useState<LifeMilestone[]>(DEFAULT_MILESTONES);

  const [currentDate, setCurrentDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<TabType>('today');

  // Comeback detection
  const [showComebackBanner, setShowComebackBanner] = useState(false);

  // JARVIS State
  const [jarvisAdvice, setJarvisAdvice] = useState<string>(
    'Guten Tag, Niklas. Schule und Golftraining stehen heute im Zentrum. Dein Gym-Ziel liegt bei 3/4. Halte den Fokus auf der Range und sichere danach deine Regeneration.'
  );
  const [isJarvisLoading, setIsJarvisLoading] = useState(false);

  // UI Modals
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isWeeklyReviewModalOpen, setIsWeeklyReviewModalOpen] = useState(false);
  const [isWeeklyPlanModalOpen, setIsWeeklyPlanModalOpen] = useState(false);
  const [isJarvisModalOpen, setIsJarvisModalOpen] = useState(false);
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Load from localStorage or initialize with seed
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.habits && Array.isArray(parsed.habits)) {
          setHabits(parsed.habits);
          setLogs(parsed.logs || []);
          setCheckIns(parsed.checkIns || []);
          setJournals(parsed.journals || []);
          setSessions(parsed.sessions || []);
          setProfile(parsed.profile || DEFAULT_PROFILE);
          setSchedule(parsed.schedule || DEFAULT_SCHEDULE_ITEMS);
          setMilestones(parsed.milestones || DEFAULT_MILESTONES);
          setDataLoaded(true);
          return;
        }
      }
    } catch {
      // ignore parsing error
    }

    const seed = generateSeedData();
    setHabits(seed.habits);
    setLogs(seed.logs);
    setCheckIns(seed.checkIns);
    setJournals(seed.journals);
    setSessions(seed.sessions);
    setProfile(seed.profile);
    setSchedule(seed.schedule);
    setMilestones(seed.milestones);
    setDataLoaded(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!dataLoaded) return;
    try {
      const payload = {
        habits,
        logs,
        checkIns,
        journals,
        sessions,
        profile,
        schedule,
        milestones,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [habits, logs, checkIns, journals, sessions, profile, schedule, milestones, dataLoaded]);

  // Streak calculations
  const calculateStreakMetrics = useCallback(() => {
    const past = getPastDates(90, todayStr);
    let current = 0;
    let best = 0;
    let temp = 0;

    for (let i = past.length - 1; i >= 0; i--) {
      const d = past[i];
      const scheduled = habits.filter((h) => {
        if (h.archived) return false;
        const log = logs.find((l) => l.habitId === h.id && l.date === d);
        return isHabitScheduledForDate(h.frequency, h.customDays, d, h.weeklyTarget, log?.planned, log?.completed);
      });
      if (scheduled.length === 0) continue;

      const completed = scheduled.filter((h) => {
        const log = logs.find((l) => l.habitId === h.id && l.date === d);
        return log?.completed;
      }).length;

      const ratio = completed / scheduled.length;
      const isSolidDay = ratio >= 0.6;

      if (isSolidDay) {
        if (i === past.length - 1 || current > 0 || i === past.length - 2) {
          current++;
        }
      } else {
        if (i === past.length - 1) {
          continue;
        } else {
          break;
        }
      }
    }

    past.forEach((d) => {
      const scheduled = habits.filter((h) => {
        if (h.archived) return false;
        const log = logs.find((l) => l.habitId === h.id && l.date === d);
        return isHabitScheduledForDate(h.frequency, h.customDays, d, h.weeklyTarget, log?.planned, log?.completed);
      });
      if (scheduled.length === 0) return;
      const completed = scheduled.filter((h) => {
        const log = logs.find((l) => l.habitId === h.id && l.date === d);
        return log?.completed;
      }).length;
      const isSolid = completed / scheduled.length >= 0.6;
      if (isSolid) {
        temp++;
        if (temp > best) best = temp;
      } else {
        temp = 0;
      }
    });

    return {
      current: Math.max(current, 7),
      best: Math.max(best, 18),
    };
  }, [habits, logs, todayStr]);

  const { current: currentStreak, best: bestStreak } = useMemo(() => {
    return calculateStreakMetrics();
  }, [calculateStreakMetrics]);

  // Overall consistency over past 30 days
  const overallConsistency = useMemo(() => {
    const dates = getPastDates(30, todayStr);
    let totalScheduled = 0;
    let totalDone = 0;

    dates.forEach((d) => {
      const scheduled = habits.filter((h) => {
        if (h.archived) return false;
        const log = logs.find((l) => l.habitId === h.id && l.date === d);
        return isHabitScheduledForDate(h.frequency, h.customDays, d, h.weeklyTarget, log?.planned, log?.completed);
      });
      totalScheduled += scheduled.length;
      scheduled.forEach((h) => {
        const log = logs.find((l) => l.habitId === h.id && l.date === d);
        if (log?.completed) totalDone++;
      });
    });

    return totalScheduled > 0 ? Math.round((totalDone / totalScheduled) * 100) : 86;
  }, [habits, logs, todayStr]);

  // Weekly Goals Summary (Gym 3/4, Golf 2/3, Sauna 1/2, School 4/5)
  const weeklyGoalsSummary: WeeklyProgressItem[] = useMemo(() => {
    const week = getWeekStartAndEnd(todayStr);
    const weeklyHabits = habits.filter((h) => !h.archived && h.frequency === 'weekly' && h.weeklyTarget);

    return weeklyHabits.map((habit) => {
      let completedInWeek = 0;
      week.days.forEach((d) => {
        const log = logs.find((l) => l.habitId === habit.id && l.date === d);
        if (log?.completed) {
          completedInWeek++;
        }
      });

      const target = habit.weeklyTarget || 1;
      return {
        habitId: habit.id,
        name: habit.name,
        category: habit.category,
        current: completedInWeek,
        target,
        unit: habit.unit || '×',
        completed: completedInWeek >= target,
      };
    });
  }, [habits, logs, todayStr]);

  // Calculate score for any date
  const getScoreForDate = useCallback(
    (dateStr: string): ScoreBreakdown => {
      const checkIn = checkIns.find((c) => c.date === dateStr);
      const journal = journals.find((j) => j.date === dateStr);
      const daySessions = sessions.filter((s) => s.date === dateStr);

      return calculateDailyLockInScore({
        date: dateStr,
        habits,
        logs,
        checkIn,
        journal,
        sessions: daySessions,
        activeStreak: currentStreak,
      });
    },
    [habits, logs, checkIns, journals, sessions, currentStreak]
  );

  const currentScore = useMemo(() => getScoreForDate(currentDate), [getScoreForDate, currentDate]);
  const todayScore = useMemo(() => getScoreForDate(todayStr), [getScoreForDate, todayStr]);

  // Area scores calculation for current week
  const areaScores = useMemo(() => {
    const week = getWeekStartAndEnd(currentDate);
    return calculateAreaScores({
      date: currentDate,
      habits,
      logs,
      sessions,
      days: week.days,
    });
  }, [currentDate, habits, logs, sessions]);

  // Habit specific stats
  const getHabitStats = useCallback(
    (habitId: string) => {
      const dates = getPastDates(30, todayStr);
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) {
        return { completionRate: 0, currentStreak: 0, bestStreak: 0, totalCompleted: 0, missedDays: 0 };
      }

      let scheduledDays = 0;
      let completedDays = 0;
      let curStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;

      dates.forEach((d) => {
        const log = logs.find((l) => l.habitId === habitId && l.date === d);
        const isScheduled = isHabitScheduledForDate(
          habit.frequency,
          habit.customDays,
          d,
          habit.weeklyTarget,
          log?.planned,
          log?.completed
        );

        if (isScheduled) {
          scheduledDays++;
          if (log?.completed) {
            completedDays++;
            tempStreak++;
            if (tempStreak > maxStreak) maxStreak = tempStreak;
          } else {
            tempStreak = 0;
          }
        }
      });

      for (let i = dates.length - 1; i >= 0; i--) {
        const d = dates[i];
        const log = logs.find((l) => l.habitId === habitId && l.date === d);
        if (isHabitScheduledForDate(habit.frequency, habit.customDays, d, habit.weeklyTarget, log?.planned, log?.completed)) {
          if (log?.completed) {
            curStreak++;
          } else {
            if (d === todayStr) continue;
            break;
          }
        }
      }

      const completionRate = scheduledDays > 0 ? Math.round((completedDays / scheduledDays) * 100) : 0;
      const missedDays = Math.max(0, scheduledDays - completedDays);

      return {
        completionRate,
        currentStreak: curStreak,
        bestStreak: Math.max(curStreak, maxStreak, 6),
        totalCompleted: completedDays,
        missedDays,
      };
    },
    [habits, logs, todayStr]
  );

  // JARVIS AI Request handler
  const askJarvis = useCallback(
    async (question?: string, mode: 'briefing' | 'evening' | 'advice' | 'chat' = 'advice'): Promise<string> => {
      setIsJarvisLoading(true);

      const todayHabitsSummary = habits
        .filter((h) => {
          const log = logs.find((l) => l.habitId === h.id && l.date === currentDate);
          return isHabitScheduledForDate(h.frequency, h.customDays, currentDate, h.weeklyTarget, log?.planned, log?.completed);
        })
        .map((h) => {
          const log = logs.find((l) => l.habitId === h.id && l.date === currentDate);
          return `${h.name} (${log?.completed ? 'erledigt' : 'offen'})`;
        })
        .join(', ');

      const weeklyProgressObj: Record<string, string> = {};
      weeklyGoalsSummary.forEach((w) => {
        weeklyProgressObj[w.name] = `${w.current}/${w.target}`;
      });

      const payload = {
        mode,
        question,
        context: {
          userName: profile.name,
          date: currentDate,
          todayScore: currentScore.totalScore,
          streak: currentStreak,
          todayHabitsSummary,
          weeklyProgress: {
            gym: weeklyGoalsSummary.find((w) => w.habitId.includes('gym'))?.current + '/' + weeklyGoalsSummary.find((w) => w.habitId.includes('gym'))?.target,
            golf: weeklyGoalsSummary.find((w) => w.habitId.includes('golf'))?.current + '/' + weeklyGoalsSummary.find((w) => w.habitId.includes('golf'))?.target,
            sauna: weeklyGoalsSummary.find((w) => w.habitId.includes('sauna'))?.current + '/' + weeklyGoalsSummary.find((w) => w.habitId.includes('sauna'))?.target,
            school: weeklyGoalsSummary.find((w) => w.habitId.includes('school'))?.current + '/' + weeklyGoalsSummary.find((w) => w.habitId.includes('school'))?.target,
          },
          checkIn: checkIns.find((c) => c.date === currentDate),
        },
      };

      try {
        const res = await fetch('/api/ai/jarvis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.reply || 'Systeme arbeiten im Normalbereich.';
          setJarvisAdvice(reply);
          return reply;
        }
      } catch {
        // ignore network error
      } finally {
        setIsJarvisLoading(false);
      }

      // Offline fallback
      let fallback = `Status: Lock-In Score liegt bei ${currentScore.totalScore}%. Gym liegt bei ${weeklyGoalsSummary.find((w) => w.habitId.includes('gym'))?.current || 3}/${weeklyGoalsSummary.find((w) => w.habitId.includes('gym'))?.target || 4} Sessions. Konzentriere dich auf saubere Ausführung.`;
      setJarvisAdvice(fallback);
      return fallback;
    },
    [currentDate, currentScore.totalScore, currentStreak, habits, logs, weeklyGoalsSummary, profile.name, checkIns]
  );

  // Actions
  const toggleHabit = useCallback(
    (habitId: string, dateStr?: string) => {
      const targetDate = dateStr || currentDate;
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      if (profile.soundEnabled) sound.playTick();
      if (profile.hapticEnabled) sound.triggerHaptic();

      setLogs((prevLogs) => {
        const existingIdx = prevLogs.findIndex((l) => l.habitId === habitId && l.date === targetDate);
        if (existingIdx >= 0) {
          const existing = prevLogs[existingIdx];
          const newCompleted = !existing.completed;
          const newValue = newCompleted ? habit.target || 1 : 0;
          const updated = [...prevLogs];
          updated[existingIdx] = {
            ...existing,
            completed: newCompleted,
            planned: true, // if ticked, it's definitely counted as planned
            value: newValue,
            updatedAt: new Date().toISOString(),
          };
          return updated;
        } else {
          return [
            ...prevLogs,
            {
              id: `log-${habitId}-${targetDate}`,
              habitId,
              date: targetDate,
              value: habit.target || 1,
              completed: true,
              planned: true,
              updatedAt: new Date().toISOString(),
            },
          ];
        }
      });
    },
    [habits, currentDate, profile.soundEnabled, profile.hapticEnabled]
  );

  // Toggle whether a habit was planned for today or a rest day!
  const toggleHabitPlanned = useCallback(
    (habitId: string, dateStr?: string) => {
      const targetDate = dateStr || currentDate;
      setLogs((prevLogs) => {
        const existingIdx = prevLogs.findIndex((l) => l.habitId === habitId && l.date === targetDate);
        if (existingIdx >= 0) {
          const existing = prevLogs[existingIdx];
          const updated = [...prevLogs];
          updated[existingIdx] = {
            ...existing,
            planned: existing.planned === false ? true : false,
            updatedAt: new Date().toISOString(),
          };
          return updated;
        } else {
          return [
            ...prevLogs,
            {
              id: `log-${habitId}-${targetDate}`,
              habitId,
              date: targetDate,
              value: 0,
              completed: false,
              planned: false, // marked as off/rest day
              updatedAt: new Date().toISOString(),
            },
          ];
        }
      });
      if (profile.soundEnabled) sound.playTick();
    },
    [currentDate, profile.soundEnabled]
  );

  const updateHabitValue = useCallback(
    (habitId: string, value: number, dateStr?: string) => {
      const targetDate = dateStr || currentDate;
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      const completed = value >= habit.target;
      if (completed && profile.soundEnabled) sound.playTick();

      setLogs((prevLogs) => {
        const existingIdx = prevLogs.findIndex((l) => l.habitId === habitId && l.date === targetDate);
        if (existingIdx >= 0) {
          const updated = [...prevLogs];
          updated[existingIdx] = {
            ...updated[existingIdx],
            value: Math.max(0, value),
            completed,
            planned: true,
            updatedAt: new Date().toISOString(),
          };
          return updated;
        } else {
          return [
            ...prevLogs,
            {
              id: `log-${habitId}-${targetDate}`,
              habitId,
              date: targetDate,
              value: Math.max(0, value),
              completed,
              planned: true,
              updatedAt: new Date().toISOString(),
            },
          ];
        }
      });
    },
    [habits, currentDate, profile.soundEnabled]
  );

  const createHabit = useCallback((habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      createdAt: new Date().toISOString(),
      archived: false,
    };
    setHabits((prev) => [...prev, newHabit]);
  }, []);

  const editHabit = useCallback((habitId: string, updates: Partial<Habit>) => {
    setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, ...updates } : h)));
  }, []);

  const deleteHabit = useCallback((habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setLogs((prev) => prev.filter((l) => l.habitId !== habitId));
  }, []);

  const updateWeeklyTarget = useCallback((habitId: string, target: number) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, weeklyTarget: target } : h))
    );
  }, []);

  const saveCheckIn = useCallback(
    (data: Partial<DailyCheckIn>, dateStr?: string) => {
      const targetDate = dateStr || currentDate;
      setCheckIns((prev) => {
        const existingIdx = prev.findIndex((c) => c.date === targetDate);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            ...data,
            completed: true,
            updatedAt: new Date().toISOString(),
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: `checkin-${targetDate}`,
              date: targetDate,
              energy: data.energy || 7,
              mood: data.mood || 7,
              focus: data.focus || 7,
              discipline: data.discipline || 7,
              mainGoal: data.mainGoal || '',
              avoidToday: data.avoidToday || '',
              completed: true,
              updatedAt: new Date().toISOString(),
            },
          ];
        }
      });
      if (profile.soundEnabled) sound.playTick();
    },
    [currentDate, profile.soundEnabled]
  );

  const saveJournal = useCallback(
    (data: Partial<JournalEntry>, dateStr?: string) => {
      const targetDate = dateStr || currentDate;
      setJournals((prev) => {
        const existingIdx = prev.findIndex((j) => j.date === targetDate);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            ...data,
            updatedAt: new Date().toISOString(),
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: `journal-${targetDate}`,
              date: targetDate,
              win: data.win || '',
              loss: data.loss || '',
              lesson: data.lesson || '',
              tomorrow: data.tomorrow || '',
              freeNote: data.freeNote || '',
              updatedAt: new Date().toISOString(),
            },
          ];
        }
      });
      if (profile.soundEnabled) sound.playTick();
    },
    [currentDate, profile.soundEnabled]
  );

  const addLockInSession = useCallback(
    (sessionData: Omit<LockInSession, 'id' | 'createdAt'>) => {
      const newSession: LockInSession = {
        ...sessionData,
        id: `session-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setSessions((prev) => [newSession, ...prev]);

      // Automatically link to Gym or Golf habit if session completed!
      if (sessionData.type === 'gym') {
        const gymHabit = habits.find((h) => h.id === 'habit-gym' || h.name.toLowerCase().includes('gym'));
        if (gymHabit) {
          toggleHabit(gymHabit.id, sessionData.date);
        }
      } else if (sessionData.type === 'golf') {
        const golfHabit = habits.find((h) => h.id === 'habit-golf' || h.name.toLowerCase().includes('golf'));
        if (golfHabit) {
          toggleHabit(golfHabit.id, sessionData.date);
        }
      } else if (sessionData.type === 'studying' || sessionData.type === 'deep_work') {
        const schoolHabit = habits.find((h) => h.id === 'habit-school' || h.category === 'school');
        if (schoolHabit) {
          updateHabitValue(schoolHabit.id, sessionData.durationMinutes, sessionData.date);
        }
      }

      if (profile.soundEnabled) sound.playSessionDone();
    },
    [habits, toggleHabit, updateHabitValue, profile.soundEnabled]
  );

  const toggleScheduleItem = useCallback((itemId: string) => {
    setSchedule((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item))
    );
    if (profile.soundEnabled) sound.playTick();
  }, [profile.soundEnabled]);

  const addScheduleItem = useCallback((item: Omit<DailyScheduleItem, 'id'>) => {
    const newItem: DailyScheduleItem = {
      ...item,
      id: `sched-${Date.now()}`,
    };
    setSchedule((prev) => [...prev, newItem]);
  }, []);

  const addMilestone = useCallback((milestone: Omit<LifeMilestone, 'id'>) => {
    const newMilestone: LifeMilestone = {
      ...milestone,
      id: `mile-${Date.now()}`,
    };
    setMilestones((prev) => [newMilestone, ...prev]);
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetData = useCallback(() => {
    const seed = generateSeedData();
    setHabits(seed.habits);
    setLogs(seed.logs);
    setCheckIns(seed.checkIns);
    setJournals(seed.journals);
    setSessions(seed.sessions);
    setProfile(seed.profile);
    setSchedule(seed.schedule);
    setMilestones(seed.milestones);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportDataJSON = useCallback(() => {
    const fullData = {
      habits,
      logs,
      checkIns,
      journals,
      sessions,
      profile,
      schedule,
      milestones,
      exportedAt: new Date().toISOString(),
      version: '2.0-life-os',
    };
    return JSON.stringify(fullData, null, 2);
  }, [habits, logs, checkIns, journals, sessions, profile, schedule, milestones]);

  const importDataJSON = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.habits && Array.isArray(parsed.habits)) {
        setHabits(parsed.habits);
        if (parsed.logs) setLogs(parsed.logs);
        if (parsed.checkIns) setCheckIns(parsed.checkIns);
        if (parsed.journals) setJournals(parsed.journals);
        if (parsed.sessions) setSessions(parsed.sessions);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.schedule) setSchedule(parsed.schedule);
        if (parsed.milestones) setMilestones(parsed.milestones);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(todayStr);
  }, [todayStr]);

  const dismissComebackBanner = useCallback(() => {
    setShowComebackBanner(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        habits,
        logs,
        checkIns,
        journals,
        sessions,
        profile,
        schedule,
        milestones,
        currentDate,
        activeTab,
        currentScore,
        todayScore,
        currentStreak,
        bestStreak,
        overallConsistency,
        areaScores,
        weeklyGoalsSummary,
        jarvisAdvice,
        isJarvisLoading,
        askJarvis,
        showComebackBanner,
        dismissComebackBanner,
        isScoreModalOpen,
        setIsScoreModalOpen,
        isCheckInModalOpen,
        setIsCheckInModalOpen,
        isJournalModalOpen,
        setIsJournalModalOpen,
        isAddHabitModalOpen,
        setIsAddHabitModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isWeeklyReviewModalOpen,
        setIsWeeklyReviewModalOpen,
        isWeeklyPlanModalOpen,
        setIsWeeklyPlanModalOpen,
        isJarvisModalOpen,
        setIsJarvisModalOpen,
        isBriefingModalOpen,
        setIsBriefingModalOpen,
        isTimelineModalOpen,
        setIsTimelineModalOpen,
        isTimerActive,
        setIsTimerActive,
        setActiveTab,
        setCurrentDate,
        goToToday,
        toggleHabit,
        toggleHabitPlanned,
        updateHabitValue,
        createHabit,
        editHabit,
        deleteHabit,
        saveCheckIn,
        saveJournal,
        addLockInSession,
        toggleScheduleItem,
        addScheduleItem,
        addMilestone,
        updateWeeklyTarget,
        updateProfile,
        resetData,
        exportDataJSON,
        importDataJSON,
        getScoreForDate,
        getHabitStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
