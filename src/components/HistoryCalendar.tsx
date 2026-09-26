import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDisplayDate, getTodayDateString } from '../utils/dateUtils';
import { getScoreTier } from '../utils/scoreCalculator';
import { ChevronLeft, ChevronRight, Calendar, Check, Clock, Award, BatteryCharging } from 'lucide-react';
import { HabitIcon } from './HabitIcon';

export const HistoryCalendar: React.FC = () => {
  const {
    getScoreForDate,
    currentDate,
    setCurrentDate,
    habits,
    logs,
    checkIns,
    journals,
    sessions,
    toggleHabit,
  } = useApp();

  const todayStr = getTodayDateString();

  // Calendar month state
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = currentDate.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Build grid days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  const startDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Mon=0
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'JANUAR', 'FEBRUAR', 'MÄRZ', 'APRIL', 'MAI', 'JUNI',
    'JULI', 'AUGUST', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DEZEMBER'
  ];

  // Selected date details
  const selectedDateScore = getScoreForDate(currentDate);
  const selectedTier = getScoreTier(selectedDateScore.totalScore);
  const selectedCheckIn = checkIns.find((c) => c.date === currentDate);
  const selectedJournal = journals.find((j) => j.date === currentDate);
  const selectedSessions = sessions.filter((s) => s.date === currentDate);
  const displayDate = formatDisplayDate(currentDate);

  const getDayDotColor = (score: number) => {
    if (score >= 85) return '#D4FF00'; // Elite Volt
    if (score >= 70) return '#22E58B'; // Solid Emerald
    if (score >= 50) return '#38BDF8'; // On pace Cyan
    if (score > 0) return '#71717A';  // Low Gray
    return '#27272A'; // Empty
  };

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="p-4 bg-[#111114] border border-[#1F1F24] rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D4FF00]" />
            <span className="text-xs font-mono font-bold tracking-widest text-[#F4F4F6]">
              {monthNames[month]} {year}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              aria-label="Vorheriger Monat"
              className="w-7 h-7 rounded-lg bg-[#18181D] hover:bg-[#23232A] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Nächster Monat"
              className="w-7 h-7 rounded-lg bg-[#18181D] hover:bg-[#23232A] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'].map((d) => (
            <span key={d} className="text-[10px] font-mono font-medium text-[#71717A]">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty prefix slots */}
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === currentDate;
            const dayScore = getScoreForDate(dateStr);
            const dotColor = getDayDotColor(dayScore.totalScore);

            return (
              <button
                key={dateStr}
                onClick={() => setCurrentDate(dateStr)}
                className={`h-11 rounded-xl flex flex-col items-center justify-center transition-all relative ${
                  isSelected
                    ? 'bg-[#1F2128] border border-[#D4FF00] shadow-md shadow-[#D4FF00]/10'
                    : 'bg-[#151519] border border-[#1E1E23] hover:border-[#2C2C35]'
                }`}
              >
                <span
                  className={`text-[11px] font-mono font-bold leading-none ${
                    isSelected ? 'text-[#D4FF00]' : isToday ? 'text-white' : 'text-[#A1A1AA]'
                  }`}
                >
                  {dayNum}
                </span>

                {/* Score indicator dot */}
                <div className="flex items-center gap-0.5 mt-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: dotColor }}
                  />
                  {dayScore.totalScore > 0 && (
                    <span className="text-[8px] font-mono text-[#71717A]">
                      {dayScore.totalScore}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Color Legend */}
        <div className="mt-3 pt-3 border-t border-[#1C1C22] flex items-center justify-between text-[10px] text-[#71717A] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D4FF00]" />
            <span>≥85 ELITE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22E58B]" />
            <span>70-84 STARK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
            <span>50-69 MODERAT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#71717A]" />
            <span>&lt;50 RESET</span>
          </div>
        </div>
      </div>

      {/* Selected Day Inspection Card */}
      <div className="p-4 bg-[#111114] border border-[#1F1F24] rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E1E24]">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase">
              HISTORIE DETAILS
            </span>
            <h3 className="text-base font-bold text-[#F4F4F6] mt-0.5 uppercase">
              {displayDate.fullDate} {displayDate.isToday && '(HEUTE)'}
            </h3>
          </div>

          <div className="flex items-baseline gap-1 font-mono text-right">
            <span className="text-2xl font-black text-[#F4F4F6]">{selectedDateScore.totalScore}</span>
            <span className="text-xs text-[#71717A]">/100</span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded ml-1"
              style={{ color: selectedTier.color, backgroundColor: `${selectedTier.color}20` }}
            >
              {selectedTier.label}
            </span>
          </div>
        </div>

        {/* Habits of this day */}
        <div>
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#71717A] uppercase block mb-2">
            HABITS ({selectedDateScore.habitCompletedCount} / {selectedDateScore.habitTotalCount})
          </span>
          <div className="space-y-1.5">
            {habits.map((habit) => {
              const log = logs.find((l) => l.habitId === habit.id && l.date === currentDate);
              const isDone = log?.completed;

              return (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id, currentDate)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                    isDone
                      ? 'bg-[#131714] border-[#22C55E]/30 text-white'
                      : 'bg-[#15151A] border-[#1E1E24] text-[#8E8E93] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <HabitIcon name={habit.icon} className="w-3.5 h-3.5 text-[#D4FF00]" />
                    <span className="font-semibold uppercase tracking-tight">{habit.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {habit.type !== 'boolean' && log && (
                      <span className="font-mono text-[11px] text-[#A1A1AA]">
                        {log.value} {habit.unit}
                      </span>
                    )}
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center ${
                        isDone ? 'bg-[#D4FF00] text-black' : 'border border-[#3F3F46]'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CheckIn & Journal Snapshot */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Check-In Summary */}
          <div className="p-3 bg-[#15151A] border border-[#1E1E24] rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-[#22E58B] font-bold text-[11px]">
              <BatteryCharging className="w-3.5 h-3.5" />
              <span>CHECK-IN</span>
            </div>
            {selectedCheckIn ? (
              <div className="space-y-0.5 text-[11px] text-[#A1A1AA]">
                <div className="flex justify-between font-mono">
                  <span>Energie / Fokus:</span>
                  <span className="text-[#F4F4F6]">{selectedCheckIn.energy}/10 · {selectedCheckIn.focus}/10</span>
                </div>
                {selectedCheckIn.mainGoal && (
                  <p className="text-[10px] text-[#71717A] italic line-clamp-2 mt-1">
                    „{selectedCheckIn.mainGoal}“
                  </p>
                )}
              </div>
            ) : (
              <span className="text-[11px] text-[#52525B]">Kein Eintrag</span>
            )}
          </div>

          {/* Journal Summary */}
          <div className="p-3 bg-[#15151A] border border-[#1E1E24] rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-[#A855F7] font-bold text-[11px]">
              <Award className="w-3.5 h-3.5" />
              <span>JOURNAL</span>
            </div>
            {selectedJournal ? (
              <div className="space-y-1 text-[11px] text-[#A1A1AA]">
                {selectedJournal.win && (
                  <p className="text-[10px] line-clamp-1">
                    <strong className="text-[#22E58B]">WIN:</strong> {selectedJournal.win}
                  </p>
                )}
                {selectedJournal.lesson && (
                  <p className="text-[10px] line-clamp-1">
                    <strong className="text-[#D4FF00]">LESSON:</strong> {selectedJournal.lesson}
                  </p>
                )}
              </div>
            ) : (
              <span className="text-[11px] text-[#52525B]">Keine Reflexion</span>
            )}
          </div>
        </div>

        {/* Sessions */}
        {selectedSessions.length > 0 && (
          <div className="p-3 bg-[#15151A] border border-[#1E1E24] rounded-xl text-xs">
            <div className="flex items-center gap-1.5 text-[#38BDF8] font-bold text-[11px] mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>FOKUS SESSIONS</span>
            </div>
            {selectedSessions.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] text-[#A1A1AA]">
                <span>{s.title}</span>
                <span className="font-mono text-[#F4F4F6]">{s.durationMinutes} Min.</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
