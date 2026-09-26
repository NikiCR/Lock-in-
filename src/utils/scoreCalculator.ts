import { Habit, HabitLog, DailyCheckIn, JournalEntry, LockInSession, ScoreBreakdown, LifeArea } from '../types';
import { isHabitScheduledForDate } from './dateUtils';

export interface ScoreWeights {
  habitWeight: number;      // e.g. 50
  checkInWeight: number;    // e.g. 10
  journalWeight: number;    // e.g. 10
  sessionWeight: number;    // e.g. 15
  consistencyWeight: number;// e.g. 15
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  habitWeight: 50,
  checkInWeight: 10,
  journalWeight: 10,
  sessionWeight: 15,
  consistencyWeight: 15,
};

const PRIORITY_MULTIPLIERS = {
  MUST: 1.5,
  SHOULD: 1.0,
  OPTIONAL: 0.5,
};

/**
 * Calculates the modular Lock-In Score (0-100) for a given day.
 * Respects:
 * 1. Only scheduled/planned habits count for the day! Unscheduled habits do NOT penalize score.
 * 2. Priorities (MUST > SHOULD > OPTIONAL).
 */
export function calculateDailyLockInScore(params: {
  date: string;
  habits: Habit[];
  logs: HabitLog[];
  checkIn?: DailyCheckIn;
  journal?: JournalEntry;
  sessions?: LockInSession[];
  activeStreak?: number;
  weights?: ScoreWeights;
}): ScoreBreakdown {
  const {
    date,
    habits,
    logs,
    checkIn,
    journal,
    sessions = [],
    activeStreak = 0,
    weights = DEFAULT_SCORE_WEIGHTS,
  } = params;

  // 1. Filter habits scheduled for this day
  const scheduledHabits = habits.filter((h) => {
    if (h.archived) return false;
    const log = logs.find((l) => l.habitId === h.id && l.date === date);
    return isHabitScheduledForDate(
      h.frequency,
      h.customDays,
      date,
      h.weeklyTarget,
      log?.planned,
      log?.completed
    );
  });

  let totalWeightedTarget = 0;
  let totalWeightedCompleted = 0;
  let rawHabitCompletedCount = 0;
  const habitTotalCount = scheduledHabits.length;

  scheduledHabits.forEach((habit) => {
    const priorityWeight = PRIORITY_MULTIPLIERS[habit.priority || 'SHOULD'];
    totalWeightedTarget += priorityWeight;

    const log = logs.find((l) => l.habitId === habit.id && l.date === date);
    if (log?.completed) {
      totalWeightedCompleted += priorityWeight;
      rawHabitCompletedCount++;
    } else if (log && habit.type === 'numeric' && habit.target > 0) {
      const ratio = Math.min(1, Math.max(0, log.value / habit.target));
      totalWeightedCompleted += ratio * priorityWeight;
      rawHabitCompletedCount += ratio;
    }
  });

  // If no habits were scheduled today (e.g. pure recovery day), ratio is 100%
  const habitRatio = totalWeightedTarget > 0 ? totalWeightedCompleted / totalWeightedTarget : 1;
  const habitScore = Math.round(habitRatio * weights.habitWeight);

  // 2. Daily Check-in Score (up to 10 points)
  let checkInScore = 0;
  if (checkIn && checkIn.completed) {
    checkInScore = weights.checkInWeight;
  } else if (checkIn && (checkIn.energy > 0 || checkIn.focus > 0 || checkIn.mainGoal?.trim())) {
    checkInScore = Math.round(weights.checkInWeight * 0.5);
  }

  // 3. Journal Entry Score (up to 10 points)
  let journalScore = 0;
  if (journal) {
    const hasWin = Boolean(journal.win?.trim());
    const hasLoss = Boolean(journal.loss?.trim());
    const hasLesson = Boolean(journal.lesson?.trim());
    const hasTomorrow = Boolean(journal.tomorrow?.trim());
    const hasFree = Boolean(journal.freeNote?.trim());

    const fieldsCompleted = [hasWin, hasLoss, hasLesson, hasTomorrow].filter(Boolean).length;
    if (fieldsCompleted >= 2 || (hasFree && fieldsCompleted >= 1)) {
      journalScore = weights.journalWeight;
    } else if (fieldsCompleted === 1 || hasFree) {
      journalScore = Math.round(weights.journalWeight * 0.6);
    }
  }

  // 4. Lock-In Sessions Score (up to 15 points)
  const daySessions = sessions.filter((s) => s.date === date && s.completed);
  const totalSessionMinutes = daySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  let sessionScore = 0;
  if (totalSessionMinutes >= 60) {
    sessionScore = weights.sessionWeight;
  } else if (totalSessionMinutes >= 45) {
    sessionScore = Math.round(weights.sessionWeight * 0.85);
  } else if (totalSessionMinutes >= 30) {
    sessionScore = Math.round(weights.sessionWeight * 0.65);
  } else if (totalSessionMinutes >= 15) {
    sessionScore = Math.round(weights.sessionWeight * 0.4);
  } else if (totalSessionMinutes > 0) {
    sessionScore = Math.round(weights.sessionWeight * 0.2);
  }

  // 5. Consistency & Streak Score (up to 15 points)
  let consistencyScore = 0;
  if (activeStreak >= 14) {
    consistencyScore = weights.consistencyWeight;
  } else if (activeStreak >= 7) {
    consistencyScore = Math.round(weights.consistencyWeight * 0.85);
  } else if (activeStreak >= 4) {
    consistencyScore = Math.round(weights.consistencyWeight * 0.7);
  } else if (activeStreak >= 2) {
    consistencyScore = Math.round(weights.consistencyWeight * 0.5);
  } else if (activeStreak === 1) {
    consistencyScore = Math.round(weights.consistencyWeight * 0.35);
  }

  const rawTotal = habitScore + checkInScore + journalScore + sessionScore + consistencyScore;
  const totalScore = Math.min(100, Math.max(0, rawTotal));

  return {
    habitScore,
    checkInScore,
    journalScore,
    sessionScore,
    consistencyScore,
    totalScore,
    habitCompletedCount: Math.round(rawHabitCompletedCount * 10) / 10,
    habitTotalCount,
    sessionMinutes: totalSessionMinutes,
    activeStreak,
  };
}

export function getScoreTier(score: number): {
  label: string;
  badge: string;
  color: string;
  description: string;
} {
  if (score >= 85) {
    return {
      label: 'LOCKED IN',
      badge: 'ELITE',
      color: '#D4FF00', // Volt
      description: 'Höchste Disziplin. Tag perfekt durchgezogen.',
    };
  }
  if (score >= 70) {
    return {
      label: 'SOLID',
      badge: 'STARK',
      color: '#22E58B', // Emerald
      description: 'Starke Performance. Prioritäten erreicht.',
    };
  }
  if (score >= 50) {
    return {
      label: 'ON PACE',
      badge: 'MODERAT',
      color: '#38BDF8', // Cyan
      description: 'Guter Anfang, Potenzial noch offen.',
    };
  }
  return {
    label: 'OFF PACE',
    badge: 'RESET',
    color: '#71717A', // Muted
    description: 'Fokus verloren. Zeig morgen wieder Präsenz.',
  };
}

/**
 * Calculates performance scores for specific Life Areas (BODY, MIND, SCHOOL, GOLF, DISCIPLINE, LIFE)
 */
export function calculateAreaScores(params: {
  date: string;
  habits: Habit[];
  logs: HabitLog[];
  sessions: LockInSession[];
  days: string[]; // Week days or month days
}): Record<LifeArea, { score: number; completedCount: number; targetCount: number; weeklyProgress?: { current: number; target: number } }> {
  const { habits, logs, sessions, days } = params;

  const areas: LifeArea[] = ['body', 'mind', 'school', 'golf', 'discipline', 'life'];
  const result = {} as Record<LifeArea, { score: number; completedCount: number; targetCount: number; weeklyProgress?: { current: number; target: number } }>;

  areas.forEach((area) => {
    const areaHabits = habits.filter((h) => !h.archived && h.category === area);
    let totalScheduled = 0;
    let totalCompleted = 0;

    days.forEach((d) => {
      areaHabits.forEach((h) => {
        const log = logs.find((l) => l.habitId === h.id && l.date === d);
        const isScheduled = isHabitScheduledForDate(
          h.frequency,
          h.customDays,
          d,
          h.weeklyTarget,
          log?.planned,
          log?.completed
        );

        if (isScheduled) {
          totalScheduled++;
          if (log?.completed) {
            totalCompleted++;
          }
        }
      });
    });

    // Session bonus for body, school, golf, mind
    const areaSessions = sessions.filter((s) => {
      if (!days.includes(s.date) || !s.completed) return false;
      if (area === 'body' && s.type === 'gym') return true;
      if (area === 'golf' && s.type === 'golf') return true;
      if (area === 'school' && (s.type === 'studying' || s.type === 'deep_work')) return true;
      if (area === 'mind' && (s.type === 'meditation' || s.type === 'reading')) return true;
      return false;
    });

    const sessionBonus = Math.min(15, areaSessions.length * 5);
    const baseRate = totalScheduled > 0 ? (totalCompleted / totalScheduled) * 85 : 80;
    const score = Math.min(100, Math.round(baseRate + sessionBonus));

    // Weekly progress for first main weekly habit in this area if any
    const weeklyHabit = areaHabits.find((h) => h.frequency === 'weekly');
    let weeklyProgress: { current: number; target: number } | undefined = undefined;
    if (weeklyHabit && weeklyHabit.weeklyTarget) {
      const completedInWeek = days.filter((d) => {
        const log = logs.find((l) => l.habitId === weeklyHabit.id && l.date === d);
        return log?.completed;
      }).length;
      weeklyProgress = {
        current: completedInWeek,
        target: weeklyHabit.weeklyTarget,
      };
    }

    result[area] = {
      score,
      completedCount: totalCompleted,
      targetCount: totalScheduled,
      weeklyProgress,
    };
  });

  return result;
}
