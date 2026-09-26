import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getPastDates, getTodayDateString } from '../utils/dateUtils';
import { HabitIcon } from './HabitIcon';
import { HabitTrendCharts } from './HabitTrendCharts';
import { HistoryCalendar } from './HistoryCalendar';
import { Flame, Award, Zap, Clock, TrendingUp, Sparkles, BookOpen, Calendar, CalendarDays } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    habits,
    logs,
    journals,
    sessions,
    currentStreak,
    bestStreak,
    overallConsistency,
    getScoreForDate,
    getHabitStats,
    setIsWeeklyReviewModalOpen,
  } = useApp();

  const [subView, setSubView] = useState<'analytics' | 'history'>('analytics');
  const [timeframe, setTimeframe] = useState<'7' | '30' | '90'>('30');
  const todayStr = getTodayDateString();

  const daysCount = Number(timeframe);
  const dates = useMemo(() => getPastDates(daysCount, todayStr), [daysCount, todayStr]);

  // Aggregate metrics over timeframe
  const metrics = useMemo(() => {
    let totalScoreSum = 0;
    let daysWithJournal = 0;
    let totalSessionMinutes = 0;

    dates.forEach((d) => {
      const score = getScoreForDate(d);
      totalScoreSum += score.totalScore;

      const hasJournal = journals.some(
        (j) => j.date === d && (j.win || j.lesson || j.loss || j.freeNote)
      );
      if (hasJournal) daysWithJournal++;

      const daySessions = sessions.filter((s) => s.date === d && s.completed);
      daySessions.forEach((s) => {
        totalSessionMinutes += s.durationMinutes || 0;
      });
    });

    const avgScore = dates.length > 0 ? Math.round(totalScoreSum / dates.length) : 0;
    const deepWorkHours = Math.floor(totalSessionMinutes / 60);
    const deepWorkMins = totalSessionMinutes % 60;

    return {
      avgScore,
      daysWithJournal,
      deepWorkFormatted: `${deepWorkHours}h ${deepWorkMins}m`,
      totalSessionMinutes,
    };
  }, [dates, getScoreForDate, journals, sessions]);

  // Personal algorithmic data-grounded insights (Requirement 17)
  const insights = useMemo(() => {
    const list: string[] = [];

    // 1. Journal vs non-journal score comparison
    let journalScoreSum = 0;
    let journalDaysCount = 0;
    let nonJournalScoreSum = 0;
    let nonJournalDaysCount = 0;

    dates.forEach((d) => {
      const s = getScoreForDate(d);
      const hasJ = journals.some((j) => j.date === d && (j.win || j.lesson));
      if (hasJ) {
        journalScoreSum += s.totalScore;
        journalDaysCount++;
      } else {
        nonJournalScoreSum += s.totalScore;
        nonJournalDaysCount++;
      }
    });

    if (journalDaysCount > 2 && nonJournalDaysCount > 2) {
      const avgWith = Math.round(journalScoreSum / journalDaysCount);
      const avgWithout = Math.round(nonJournalScoreSum / nonJournalDaysCount);
      const diff = avgWith - avgWithout;
      if (diff > 0) {
        list.push(`Dein Lock-In Score ist an Tagen mit Tages-Journaling durchschnittlich um ${diff} Punkte höher.`);
      }
    }

    // 2. Best performing habit
    let bestHabitName = '';
    let highestRate = -1;
    habits.forEach((h) => {
      const stats = getHabitStats(h.id);
      if (stats.completionRate > highestRate) {
        highestRate = stats.completionRate;
        bestHabitName = h.name;
      }
    });
    if (bestHabitName && highestRate >= 70) {
      list.push(`Deine konstanteste Gewohnheit ist '${bestHabitName}' mit ${highestRate}% Zuverlässigkeit.`);
    }

    // 3. Deep Work Volume
    const sessionCount = sessions.filter((s) => s.completed && dates.includes(s.date)).length;
    if (sessionCount > 0) {
      list.push(`Du hast im gewählten Zeitraum ${sessionCount} ungestörte Focus-Sessions absolviert.`);
    }

    // 4. Streak observation
    if (currentStreak >= 7) {
      list.push(`Seit ${currentStreak} Tagen hältst du deinen Mindeststandard ohne Unterbrechung.`);
    }

    return list;
  }, [dates, getScoreForDate, journals, habits, getHabitStats, sessions, currentStreak]);

  return (
    <div className="space-y-4">
      {/* Top Navigation Switch: Analytics vs Calendar History */}
      <div className="flex items-center gap-1 bg-[#121216] p-1 rounded-2xl border border-[#1E1E24]">
        <button
          onClick={() => setSubView('analytics')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold tracking-tight flex items-center justify-center gap-1.5 transition-all ${
            subView === 'analytics'
              ? 'bg-[#1C1F26] text-[#D4FF00] border border-[#D4FF00]/30 shadow-sm'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>METRIKEN & TRENDS</span>
        </button>

        <button
          onClick={() => setSubView('history')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold tracking-tight flex items-center justify-center gap-1.5 transition-all ${
            subView === 'history'
              ? 'bg-[#1C1F26] text-[#D4FF00] border border-[#D4FF00]/30 shadow-sm'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>KALENDER-VERLAUF</span>
        </button>
      </div>

      {subView === 'history' ? (
        <HistoryCalendar />
      ) : (
        <>
          {/* Timeframe Selector & Weekly Review Trigger */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-[#141418] p-1 rounded-xl border border-[#202026]">
              {(['7', '30', '90'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold tracking-tight transition-all ${
                    timeframe === t
                      ? 'bg-[#D4FF00] text-black shadow-sm'
                      : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  {t} DAYS
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsWeeklyReviewModalOpen(true)}
              className="px-3 py-1.5 bg-[#1B1B22] hover:bg-[#252530] border border-[#2B2B36] rounded-xl text-xs font-semibold text-[#D4FF00] flex items-center gap-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>WOCHEN-REVIEW</span>
            </button>
          </div>

      {/* Primary KPI Grid (WHOOP-style clean numbers) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Streak */}
        <div className="p-4 bg-[#111114] border border-[#1F1F24] rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8E8E93]">
            <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">CURRENT STREAK</span>
            <Flame className="w-4 h-4 text-[#D4FF00]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black font-mono tracking-tight text-[#F4F4F6] tabular-nums">
              {currentStreak}
            </span>
            <span className="text-xs text-[#8E8E93] ml-1 uppercase font-semibold">DAYS</span>
          </div>
          <div className="text-[11px] text-[#71717A] font-mono">
            BEST: <strong className="text-[#A1A1AA]">{bestStreak} DAYS</strong>
          </div>
        </div>

        {/* Consistency */}
        <div className="p-4 bg-[#111114] border border-[#1F1F24] rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8E8E93]">
            <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">KONSISTENZ</span>
            <TrendingUp className="w-4 h-4 text-[#22E58B]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black font-mono tracking-tight text-[#22E58B] tabular-nums">
              {overallConsistency}%
            </span>
          </div>
          <div className="text-[11px] text-[#71717A]">
            Geplante Habits erfüllt
          </div>
        </div>

        {/* Avg Lock-In Score */}
        <div className="p-4 bg-[#111114] border border-[#1F1F24] rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8E8E93]">
            <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">Ø LOCK-IN</span>
            <Zap className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black font-mono tracking-tight text-[#38BDF8] tabular-nums">
              {metrics.avgScore}
            </span>
            <span className="text-xs text-[#71717A] ml-1">/100</span>
          </div>
          <div className="text-[11px] text-[#71717A]">
            Durchschnittlicher Tageswert
          </div>
        </div>

        {/* Deep Work */}
        <div className="p-4 bg-[#111114] border border-[#1F1F24] rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8E8E93]">
            <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">DEEP WORK</span>
            <Clock className="w-4 h-4 text-[#A855F7]" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black font-mono tracking-tight text-[#F4F4F6] tabular-nums">
              {metrics.deepWorkFormatted}
            </span>
          </div>
          <div className="text-[11px] text-[#71717A]">
            {metrics.daysWithJournal} Tage reflektiert
          </div>
        </div>
      </div>

      {/* 30-Day Habit Completion Trend Line Visualization */}
      <HabitTrendCharts habits={habits} logs={logs} todayStr={todayStr} />

      {/* Personal Insights (Requirement 17) */}
      {insights.length > 0 && (
        <div className="p-4 bg-[#131418] border border-[#22232B] rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D4FF00] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>DATENGETRIEBENE INSIGHTS</span>
          </div>
          <div className="space-y-2">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-[#D4D4D8] leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] shrink-0 mt-1.5" />
                <span>{ins}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-Habit Breakdown (Requirement 14) */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-mono font-bold tracking-wider text-[#71717A] uppercase block">
          HABIT PERFORMANCE (LETZTE {timeframe} TAGE)
        </span>

        {habits.map((habit) => {
          const stats = getHabitStats(habit.id);

          return (
            <div
              key={habit.id}
              className="p-3.5 bg-[#111114] border border-[#1F1F24] rounded-2xl space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#18181D] flex items-center justify-center text-[#D4FF00]">
                    <HabitIcon name={habit.icon} className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-tight block text-[#F4F4F6]">
                      {habit.name}
                    </span>
                    <span className="text-[10px] text-[#71717A] capitalize">
                      {habit.category} · {habit.frequency}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-base font-extrabold text-[#F4F4F6] tabular-nums">
                    {stats.completionRate}%
                  </span>
                  <span className="block text-[10px] font-mono text-[#71717A]">
                    {stats.currentStreak}D STREAK
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#1A1A20] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.completionRate}%`,
                    backgroundColor: stats.completionRate >= 80 ? '#D4FF00' : stats.completionRate >= 60 ? '#22E58B' : '#38BDF8',
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A] pt-0.5">
                <span>{stats.totalCompleted} Tage abgeschlossen</span>
                <span>Best: {stats.bestStreak} Tage · {stats.missedDays} verpasst</span>
              </div>
            </div>
          );
        })}
      </div>
        </>
      )}
    </div>
  );
};
