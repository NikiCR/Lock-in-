import { calculateDailyLockInScore, getScoreTier, DEFAULT_SCORE_WEIGHTS } from '../utils/scoreCalculator';
import {
  formatDateToLocal,
  parseLocalDate,
  getTodayDateString,
  isHabitScheduledForDate,
  getWeekStartAndEnd,
} from '../utils/dateUtils';
import { Habit, HabitLog, DailyCheckIn, JournalEntry, LockInSession } from '../types';

function runTestSuite() {
  console.log('--- STARTING LOCK-IN BUSINESS LOGIC TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${desc}`);
      failed++;
    }
  }

  // TEST 1: Score Calculator - Zero State
  const sampleHabit: Habit = {
    id: 'h1',
    name: 'TEST HABIT',
    category: 'fitness',
    icon: 'dumbbell',
    type: 'boolean',
    target: 1,
    unit: '',
    frequency: 'daily',
    createdAt: '2026-09-01',
  };

  const zeroScore = calculateDailyLockInScore({
    date: '2026-09-26',
    habits: [sampleHabit],
    logs: [],
  });
  assert(zeroScore.totalScore === 0, 'Zero logs yields 0 total score');
  assert(zeroScore.habitScore === 0, 'Habit score is 0 without completed logs');

  // TEST 2: Habit Completion - 100% completion gives full 50 points
  const fullLog: HabitLog = {
    id: 'l1',
    habitId: 'h1',
    date: '2026-09-26',
    value: 1,
    completed: true,
    updatedAt: '',
  };
  const habitOnlyScore = calculateDailyLockInScore({
    date: '2026-09-26',
    habits: [sampleHabit],
    logs: [fullLog],
  });
  assert(habitOnlyScore.habitScore === 50, '100% completed habit yields 50 points');
  assert(habitOnlyScore.totalScore === 50, 'Total score is 50 with habits only');

  // TEST 3: Check-In Score adds 10 points
  const checkIn: DailyCheckIn = {
    id: 'c1',
    date: '2026-09-26',
    energy: 8,
    mood: 8,
    focus: 9,
    discipline: 9,
    mainGoal: 'Pass test',
    avoidToday: 'None',
    completed: true,
    updatedAt: '',
  };
  const withCheckInScore = calculateDailyLockInScore({
    date: '2026-09-26',
    habits: [sampleHabit],
    logs: [fullLog],
    checkIn,
  });
  assert(withCheckInScore.checkInScore === 10, 'Completed check-in yields 10 points');
  assert(withCheckInScore.totalScore === 60, 'Habit + Check-in yields 60 points');

  // TEST 4: Journal Entry adds 10 points
  const journal: JournalEntry = {
    id: 'j1',
    date: '2026-09-26',
    win: 'Good job',
    loss: 'None',
    lesson: 'Discipline',
    tomorrow: 'Repeat',
    updatedAt: '',
  };
  const withJournalScore = calculateDailyLockInScore({
    date: '2026-09-26',
    habits: [sampleHabit],
    logs: [fullLog],
    checkIn,
    journal,
  });
  assert(withJournalScore.journalScore === 10, 'Full reflection journal yields 10 points');
  assert(withJournalScore.totalScore === 70, 'Habit + CheckIn + Journal yields 70 points');

  // TEST 5: Focus Sessions (60+ min) adds 15 points
  const session: LockInSession = {
    id: 's1',
    date: '2026-09-26',
    type: 'deep_work',
    title: 'Focus block',
    durationMinutes: 75,
    completed: true,
    pointsAwarded: 15,
    createdAt: '',
  };
  const withSessionScore = calculateDailyLockInScore({
    date: '2026-09-26',
    habits: [sampleHabit],
    logs: [fullLog],
    checkIn,
    journal,
    sessions: [session],
  });
  assert(withSessionScore.sessionScore === 15, '75 min session yields full 15 session points');
  assert(withSessionScore.totalScore === 85, 'Total score is 85 before streak bonus');

  // TEST 6: Consistency Streak Bonus (7+ days) adds 13-15 points, total capped at 100
  const maxScore = calculateDailyLockInScore({
    date: '2026-09-26',
    habits: [sampleHabit],
    logs: [fullLog],
    checkIn,
    journal,
    sessions: [session],
    activeStreak: 14,
  });
  assert(maxScore.consistencyScore === 15, '14-day streak yields max 15 consistency points');
  assert(maxScore.totalScore === 100, 'Max score reaches exactly 100 points');
  assert(getScoreTier(100).label === 'LOCKED IN', '100 score is classified as LOCKED IN');

  // TEST 7: Numeric habit partial credit calculation
  const numericHabit: Habit = {
    id: 'h2',
    name: '10K STEPS',
    category: 'health',
    icon: 'footprints',
    type: 'numeric',
    target: 10000,
    unit: 'Steps',
    frequency: 'daily',
    createdAt: '',
  };
  const partialLog: HabitLog = {
    id: 'l2',
    habitId: 'h2',
    date: '2026-09-26',
    value: 5000,
    completed: false,
    updatedAt: '',
  };
  const partialScore = calculateDailyLockInScore({
    date: '2026-09-26',
    habits: [numericHabit],
    logs: [partialLog],
  });
  assert(partialScore.habitScore === 25, '5000/10000 steps yields exactly 25 points (50% of 50)');

  // TEST 8: Date Utils - Weekday and local time parsing
  assert(isHabitScheduledForDate('daily', undefined, '2026-09-26') === true, 'Daily habit scheduled on Saturday');
  // 2026-09-26 is a Saturday (day 6)
  assert(isHabitScheduledForDate('weekdays', undefined, '2026-09-26') === false, 'Weekday habit NOT scheduled on Saturday');
  // 2026-09-28 is a Monday (day 1)
  assert(isHabitScheduledForDate('weekdays', undefined, '2026-09-28') === true, 'Weekday habit IS scheduled on Monday');

  const week = getWeekStartAndEnd('2026-09-26');
  assert(week.start === '2026-09-21' && week.end === '2026-09-27', 'ISO week range correctly calculated Monday-Sunday');

  console.log(`\nTEST RESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
