import React from 'react';
import { useApp } from '../context/AppContext';
import { HabitIcon } from './HabitIcon';
import { Dumbbell, Target, Flame, Brain, Sliders, CheckCircle2 } from 'lucide-react';

interface WeeklyGoalsWidgetProps {
  onOpenWeeklyPlan: () => void;
}

export const WeeklyGoalsWidget: React.FC<WeeklyGoalsWidgetProps> = ({ onOpenWeeklyPlan }) => {
  const { weeklyGoalsSummary } = useApp();

  const getAreaIcon = (category: string) => {
    switch (category) {
      case 'golf':
        return <Target className="w-3.5 h-3.5 text-[#22E58B]" />;
      case 'school':
        return <Brain className="w-3.5 h-3.5 text-[#38BDF8]" />;
      case 'body':
        return <Dumbbell className="w-3.5 h-3.5 text-[#D4FF00]" />;
      default:
        return <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />;
    }
  };

  return (
    <div className="p-4 bg-[#111114] border border-[#1F1F24] rounded-2xl space-y-3 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#8E8E93] uppercase">
            WOCHENZIELE (WEEKLY TARGETS)
          </span>
        </div>

        <button
          onClick={onOpenWeeklyPlan}
          className="text-[10px] font-mono font-bold text-[#D4FF00] hover:underline flex items-center gap-1"
        >
          <Sliders className="w-3 h-3" />
          <span>ANPASSEN</span>
        </button>
      </div>

      {/* Grid of Weekly Goals */}
      <div className="grid grid-cols-2 gap-2">
        {weeklyGoalsSummary.map((goal) => {
          const ratio = Math.min(100, Math.round((goal.current / goal.target) * 100));
          const isDone = goal.current >= goal.target;

          return (
            <div
              key={goal.habitId}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                isDone
                  ? 'bg-[#131713] border-[#22C55E]/30'
                  : 'bg-[#15151A] border-[#1E1E24]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {getAreaIcon(goal.category)}
                  <span className="text-[11px] font-bold text-[#F4F4F6] uppercase truncate max-w-[95px]">
                    {goal.name.replace('/ KRAFTTRAINING', '').replace('LEISTUNGSTRAINING', '')}
                  </span>
                </div>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#22E58B]" />}
              </div>

              <div className="mt-2 flex items-baseline justify-between font-mono">
                <span className="text-xl font-black text-[#F4F4F6] tabular-nums">
                  {goal.current}{' '}
                  <span className="text-xs text-[#71717A] font-medium">/ {goal.target}</span>
                </span>
                <span className={`text-[10px] font-bold ${isDone ? 'text-[#22E58B]' : 'text-[#8E8E93]'}`}>
                  {ratio}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#1F1F27] h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${ratio}%`,
                    backgroundColor: isDone ? '#22E58B' : '#D4FF00',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
