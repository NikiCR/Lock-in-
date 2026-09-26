import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ScoreRing } from './ScoreRing';
import { HabitCard } from './HabitCard';
import { WeeklyGoalsWidget } from './WeeklyGoalsWidget';
import { DailyScheduleWidget } from './DailyScheduleWidget';
import { JarvisCard } from './JarvisCard';
import {
  getGreeting,
  formatDisplayDate,
  getPastDates,
  isHabitScheduledForDate,
  getTodayDateString,
} from '../utils/dateUtils';
import {
  Plus,
  Play,
  Award,
  BatteryCharging,
  ArrowRight,
  Flame,
  CheckCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface DailyDashboardProps {
  onStartTimer: () => void;
  onOpenCheckIn: () => void;
  onOpenJournal: () => void;
  onOpenScoreBreakdown: () => void;
  onOpenAddHabit: () => void;
  onOpenWeeklyPlan: () => void;
  onOpenJarvisCoach: () => void;
}

export const DailyDashboard: React.FC<DailyDashboardProps> = ({
  onStartTimer,
  onOpenCheckIn,
  onOpenJournal,
  onOpenScoreBreakdown,
  onOpenAddHabit,
  onOpenWeeklyPlan,
  onOpenJarvisCoach,
}) => {
  const {
    currentDate,
    setCurrentDate,
    currentScore,
    habits,
    logs,
    checkIns,
    journals,
    toggleHabit,
    toggleHabitPlanned,
    updateHabitValue,
    getScoreForDate,
    profile,
    weeklyGoalsSummary,
    askJarvis,
  } = useApp();

  const todayStr = getTodayDateString();
  const greeting = getGreeting();
  const displayDate = formatDisplayDate(currentDate);

  // 7-day horizontal strip
  const dateStrip = useMemo(() => getPastDates(7, todayStr), [todayStr]);

  // Scheduled habits for currentDate
  const todayHabits = useMemo(() => {
    return habits.filter(
      (h) => !h.archived && isHabitScheduledForDate(h.frequency, h.customDays, currentDate)
    );
  }, [habits, currentDate]);

  const currentCheckIn = checkIns.find((c) => c.date === currentDate);
  const currentJournal = journals.find((j) => j.date === currentDate);

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* 1. Date Scroller Bar (Last 7 Days) */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        {dateStrip.map((dStr) => {
          const info = formatDisplayDate(dStr);
          const isSelected = dStr === currentDate;
          const isToday = dStr === todayStr;
          const score = getScoreForDate(dStr);

          return (
            <button
              key={dStr}
              onClick={() => setCurrentDate(dStr)}
              className={`flex-1 min-w-[44px] py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-[#1D2027] border border-[#D4FF00] shadow-sm shadow-[#D4FF00]/10'
                  : 'bg-[#121215] border border-[#1C1C22] hover:border-[#2C2C35]'
              }`}
            >
              <span className={`text-[10px] font-mono font-medium ${isSelected ? 'text-[#D4FF00]' : 'text-[#71717A]'}`}>
                {info.dayName}
              </span>
              <span className={`text-xs font-mono font-bold mt-0.5 ${isSelected ? 'text-white' : isToday ? 'text-[#F4F4F6]' : 'text-[#A1A1AA]'}`}>
                {info.dayNumber}
              </span>

              {/* Status micro indicator */}
              <span
                className="w-1.5 h-1.5 rounded-full mt-1.5"
                style={{
                  backgroundColor:
                    score.totalScore >= 80 ? '#D4FF00' : score.totalScore >= 50 ? '#38BDF8' : '#27272A',
                }}
              />
            </button>
          );
        })}
      </div>

      {/* 2. Header Salutation with Niklas context */}
      <div className="text-center pt-1">
        <span className="text-[10px] font-mono tracking-[0.25em] text-[#8E8E93] uppercase font-semibold">
          {greeting}, {profile.name}
        </span>
        <h1 className="text-xl font-black tracking-tight text-[#F4F4F6] font-mono uppercase mt-0.5">
          {displayDate.fullDate} {displayDate.isToday && '· HEUTE'}
        </h1>
      </div>

      {/* 3. Hero Score Ring (Central Focal Anchor) */}
      <div className="flex justify-center">
        <ScoreRing scoreData={currentScore} onClickBreakdown={onOpenScoreBreakdown} size={200} />
      </div>

      {/* 4. Action Strip: Quick Focus Session / Check-In / Journal triggers */}
      <div className="grid grid-cols-3 gap-2">
        {/* Check-In */}
        <button
          onClick={onOpenCheckIn}
          className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
            currentCheckIn?.completed
              ? 'bg-[#121613] border-[#22C55E]/30'
              : 'bg-[#121216] border-[#202028] hover:border-[#2E2E38]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-[#71717A] uppercase">
              CHECK-IN
            </span>
            {currentCheckIn?.completed ? (
              <CheckCircle className="w-3.5 h-3.5 text-[#22E58B]" />
            ) : (
              <BatteryCharging className="w-3.5 h-3.5 text-[#38BDF8]" />
            )}
          </div>
          <div className="mt-2">
            <span className="text-xs font-bold text-[#F4F4F6] block truncate">
              {currentCheckIn?.completed ? 'ERLEDIGT' : 'STARTEN'}
            </span>
            <span className="text-[10px] font-mono text-[#8E8E93]">
              {currentCheckIn ? `Fokus: ${currentCheckIn.focus}/10` : '+10 Punkte'}
            </span>
          </div>
        </button>

        {/* Lock-In Timer */}
        <button
          onClick={onStartTimer}
          className="p-3 rounded-2xl bg-[#141812] border border-[#D4FF00]/40 hover:border-[#D4FF00] text-left flex flex-col justify-between transition-all shadow-sm shadow-[#D4FF00]/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-[#D4FF00] uppercase">
              LOCK IN
            </span>
            <Play className="w-3.5 h-3.5 text-[#D4FF00] fill-current" />
          </div>
          <div className="mt-2">
            <span className="text-xs font-bold text-[#F4F4F6] block truncate">
              TIMER
            </span>
            <span className="text-[10px] font-mono text-[#D4FF00]">
              {currentScore.sessionMinutes > 0 ? `${currentScore.sessionMinutes}m geloggt` : 'Focus starten'}
            </span>
          </div>
        </button>

        {/* Journal */}
        <button
          onClick={onOpenJournal}
          className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
            currentJournal?.win || currentJournal?.lesson
              ? 'bg-[#151318] border-[#A855F7]/30'
              : 'bg-[#121216] border-[#202028] hover:border-[#2E2E38]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-[#71717A] uppercase">
              JOURNAL
            </span>
            <Award className="w-3.5 h-3.5 text-[#A855F7]" />
          </div>
          <div className="mt-2">
            <span className="text-xs font-bold text-[#F4F4F6] block truncate">
              {currentJournal?.win ? 'REFLEKTIERT' : 'SCHREIBEN'}
            </span>
            <span className="text-[10px] font-mono text-[#8E8E93]">
              {currentJournal?.win ? 'Win geloggt' : '+10 Punkte'}
            </span>
          </div>
        </button>
      </div>

      {/* 5. JARVIS AI Coach Card */}
      <JarvisCard
        onOpenJarvisModal={onOpenJarvisCoach}
        onOpenBriefingModal={() => {
          onOpenJarvisCoach();
          askJarvis(undefined, 'briefing');
        }}
      />

      {/* 6. Weekly Goals Widget (Gym 4x, Golf 3x, Sauna 2x, School 5x) */}
      <WeeklyGoalsWidget onOpenWeeklyPlan={onOpenWeeklyPlan} />

      {/* 7. Daily Schedule Time Blocks */}
      <DailyScheduleWidget />

      {/* 8. Today's Habits Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-[#8E8E93] uppercase">
              HEUTIGE HABITS
            </span>
            <span className="text-xs font-mono font-semibold text-[#D4FF00]">
              {currentScore.habitCompletedCount} / {currentScore.habitTotalCount}
            </span>
          </div>

          <button
            onClick={onOpenAddHabit}
            className="flex items-center gap-1 text-[11px] font-mono text-[#8E8E93] hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NEU</span>
          </button>
        </div>

        {/* List of Habits */}
        <div className="space-y-2">
          {todayHabits.map((habit) => {
            const log = logs.find((l) => l.habitId === habit.id && l.date === currentDate);
            const weeklySummaryItem = weeklyGoalsSummary.find((g) => g.habitId === habit.id);

            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                log={log}
                weeklyCompleted={weeklySummaryItem?.current}
                onToggle={() => toggleHabit(habit.id, currentDate)}
                onUpdateValue={(val) => updateHabitValue(habit.id, val, currentDate)}
                onTogglePlanned={() => toggleHabitPlanned(habit.id, currentDate)}
                onStartSession={habit.type === 'time' ? onStartTimer : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* 9. Quick Reflection Snapshot Preview (if written today) */}
      {currentJournal && (currentJournal.win || currentJournal.lesson) && (
        <div
          onClick={onOpenJournal}
          className="p-4 bg-[#121216] border border-[#1F1F26] rounded-2xl cursor-pointer hover:border-[#2C2C36] transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#A855F7] uppercase">
              TAGES-REFLEXION
            </span>
            <span className="text-[10px] text-[#71717A] hover:text-white flex items-center gap-1">
              Öffnen <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {currentJournal.win && (
            <p className="text-xs text-[#E4E4E7] leading-relaxed">
              <strong className="text-[#22E58B] font-semibold">WIN:</strong> {currentJournal.win}
            </p>
          )}
          {currentJournal.lesson && (
            <p className="text-xs text-[#E4E4E7] leading-relaxed">
              <strong className="text-[#D4FF00] font-semibold">LESSON:</strong> {currentJournal.lesson}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
