import React from 'react';
import { Habit, HabitLog } from '../types';
import { HabitIcon } from './HabitIcon';
import { Check, Plus, Minus, Play, Moon, Sparkles } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  weeklyCompleted?: number;
  onToggle: () => void;
  onUpdateValue: (val: number) => void;
  onTogglePlanned?: () => void;
  onStartSession?: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  log,
  weeklyCompleted,
  onToggle,
  onUpdateValue,
  onTogglePlanned,
  onStartSession,
}) => {
  const isCompleted = log?.completed ?? false;
  const isOffDay = log?.planned === false;
  const currentValue = log?.value ?? 0;
  const target = habit.target || 1;

  // Handle Stepper for numeric
  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const step = habit.target >= 1000 ? 500 : habit.target >= 100 ? 10 : 1;
    onUpdateValue(currentValue + step);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const step = habit.target >= 1000 ? 500 : habit.target >= 100 ? 10 : 1;
    onUpdateValue(Math.max(0, currentValue - step));
  };

  const progressPercent = Math.min(100, Math.round((currentValue / target) * 100));

  const priorityColor =
    habit.priority === 'MUST'
      ? 'text-[#D4FF00] border-[#D4FF00]/40 bg-[#D4FF00]/10'
      : habit.priority === 'SHOULD'
      ? 'text-[#38BDF8] border-[#38BDF8]/40 bg-[#38BDF8]/10'
      : 'text-[#71717A] border-[#71717A]/40 bg-[#71717A]/10';

  return (
    <div
      onClick={!isOffDay && habit.type === 'boolean' ? onToggle : undefined}
      className={`group relative p-3.5 rounded-2xl border transition-all duration-200 select-none ${
        isOffDay
          ? 'bg-[#0E0E12] border-[#1A1A22] opacity-65'
          : isCompleted
          ? 'bg-[#121413] border-[#22C55E]/30 text-[#F4F4F6]'
          : 'bg-[#111114] border-[#1F1F24] hover:border-[#2C2C35] text-[#F4F4F6]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Icon & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isOffDay
                ? 'bg-[#16161D] text-[#52525B]'
                : isCompleted
                ? 'bg-[#D4FF00]/15 text-[#D4FF00]'
                : 'bg-[#18181D] text-[#8E8E93] group-hover:text-white'
            }`}
          >
            <HabitIcon name={habit.icon} className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight uppercase truncate">
                {habit.name}
              </span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${priorityColor}`}>
                {habit.priority || 'SHOULD'}
              </span>
            </div>

            {/* Subtext info */}
            <div className="flex items-center gap-2 text-[11px] text-[#71717A] mt-0.5">
              <span className="uppercase font-mono text-[10px] text-[#A1A1AA]">{habit.category}</span>
              
              {habit.frequency === 'weekly' && habit.weeklyTarget && (
                <>
                  <span>·</span>
                  <span className="font-mono text-[#D4FF00] font-semibold">
                    {weeklyCompleted !== undefined ? weeklyCompleted : (isCompleted ? 1 : 0)} / {habit.weeklyTarget} diese Woche
                  </span>
                </>
              )}

              {habit.type === 'numeric' && (
                <>
                  <span>·</span>
                  <span className="font-mono tabular-nums text-[#A1A1AA]">
                    {currentValue.toLocaleString()} / {target.toLocaleString()} {habit.unit}
                  </span>
                </>
              )}
              {habit.type === 'time' && (
                <>
                  <span>·</span>
                  <span className="font-mono tabular-nums text-[#A1A1AA]">
                    {currentValue} / {target} Min
                  </span>
                </>
              )}

              {isOffDay && (
                <>
                  <span>·</span>
                  <span className="text-[#F59E0B] font-mono text-[10px]">RUHETAG / OFF</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Interactive Trigger Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Rest day toggle for weekly habits */}
          {habit.frequency === 'weekly' && onTogglePlanned && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlanned();
              }}
              title={isOffDay ? 'Als geplant markieren' : 'Heute als Ruhetag markieren'}
              className={`p-1.5 rounded-lg text-[10px] font-mono transition-colors ${
                isOffDay
                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                  : 'text-[#52525B] hover:text-[#8E8E93] hover:bg-[#18181F]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Numeric Stepper */}
          {habit.type === 'numeric' && !isOffDay && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleDecrement}
                disabled={currentValue <= 0}
                aria-label="Verringern"
                className="w-7 h-7 rounded-lg bg-[#18181D] hover:bg-[#232328] disabled:opacity-30 flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={handleIncrement}
                aria-label="Erhöhen"
                className="w-7 h-7 rounded-lg bg-[#18181D] hover:bg-[#232328] flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Time Focus Session Link */}
          {habit.type === 'time' && onStartSession && !isCompleted && !isOffDay && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartSession();
              }}
              title="Focus Session starten"
              className="px-2 py-1.5 rounded-lg bg-[#18181D] hover:bg-[#232328] flex items-center gap-1 text-[10px] font-mono font-medium text-[#38BDF8] transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>TIMER</span>
            </button>
          )}

          {/* Completion Check Trigger Button */}
          {!isOffDay && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              aria-label={isCompleted ? `${habit.name} als unerledigt markieren` : `${habit.name} abhaken`}
              className={`min-w-[42px] min-h-[42px] rounded-xl flex items-center justify-center transition-all ${
                isCompleted
                  ? 'bg-[#D4FF00] text-black shadow-lg shadow-[#D4FF00]/15'
                  : 'bg-[#18181D] text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#202026]'
              }`}
            >
              {isCompleted ? (
                <Check className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <div className="w-5 h-5 rounded-md border-2 border-[#3F3F46] group-hover:border-[#71717A] flex items-center justify-center" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar for Numeric / Time habits */}
      {!isOffDay && (habit.type === 'numeric' || habit.type === 'time') && (
        <div className="mt-2.5 w-full bg-[#18181E] h-1 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: isCompleted ? '#D4FF00' : '#38BDF8',
            }}
          />
        </div>
      )}
    </div>
  );
};
