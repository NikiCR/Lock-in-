import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Dumbbell, Target, Brain, Flame, Plus, Minus } from 'lucide-react';

interface WeeklyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyPlanModal: React.FC<WeeklyPlanModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { habits, updateWeeklyTarget } = useApp();
  const weeklyHabits = habits.filter((h) => !h.archived && h.frequency === 'weekly');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#101014] border border-[#232328] rounded-2xl p-5 shadow-2xl text-[#F4F4F6] max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#232328]">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase">
              WOCHENZIEL-KONFIGURATION
            </span>
            <h2 className="text-lg font-bold tracking-tight mt-0.5">WEEKLY PLANNING</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1A1F] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#8E8E93] leading-relaxed">
          Definiere, wie viele Einheiten du in dieser Woche für die Kernbereiche anstrebst. Nichterfüllte Zwischentage senken deinen Tages-Score nicht ab.
        </p>

        {/* List of Weekly Goals */}
        <div className="space-y-2.5">
          {weeklyHabits.map((habit) => {
            const currentTarget = habit.weeklyTarget || 3;

            return (
              <div
                key={habit.id}
                className="p-3 bg-[#15151A] border border-[#202026] rounded-xl flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-tight block text-[#F4F4F6]">
                    {habit.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#8E8E93] uppercase">
                    Kategorie: {habit.category} · Priorität: {habit.priority}
                  </span>
                </div>

                {/* Target Stepper */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateWeeklyTarget(habit.id, Math.max(1, currentTarget - 1))}
                    disabled={currentTarget <= 1}
                    className="w-7 h-7 rounded-lg bg-[#18181F] hover:bg-[#22222B] flex items-center justify-center text-[#A1A1AA] hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <div className="font-mono text-center w-12">
                    <span className="text-base font-extrabold text-[#D4FF00]">{currentTarget}</span>
                    <span className="text-[10px] text-[#71717A] block">/ Woche</span>
                  </div>

                  <button
                    onClick={() => updateWeeklyTarget(habit.id, Math.min(7, currentTarget + 1))}
                    disabled={currentTarget >= 7}
                    className="w-7 h-7 rounded-lg bg-[#18181F] hover:bg-[#22222B] flex items-center justify-center text-[#A1A1AA] hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-[#D4FF00] hover:bg-[#BEE500] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-transform active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-lg shadow-[#D4FF00]/15"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>WOCHENZIELE BESTÄTIGEN</span>
        </button>
      </div>
    </div>
  );
};
