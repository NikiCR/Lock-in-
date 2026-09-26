import React, { useState } from 'react';
import { DailyCheckIn } from '../types';
import { X, BatteryCharging, Smile, Target, Zap, ShieldAlert, Check } from 'lucide-react';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkIn?: DailyCheckIn;
  onSave: (data: Partial<DailyCheckIn>) => void;
  dateStr: string;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  checkIn,
  onSave,
  dateStr,
}) => {
  if (!isOpen) return null;

  const [energy, setEnergy] = useState<number>(checkIn?.energy || 8);
  const [mood, setMood] = useState<number>(checkIn?.mood || 8);
  const [focus, setFocus] = useState<number>(checkIn?.focus || 9);
  const [discipline, setDiscipline] = useState<number>(checkIn?.discipline || 9);
  const [mainGoal, setMainGoal] = useState<string>(checkIn?.mainGoal || '');
  const [avoidToday, setAvoidToday] = useState<string>(checkIn?.avoidToday || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      energy,
      mood,
      focus,
      discipline,
      mainGoal,
      avoidToday,
    });
    onClose();
  };

  const renderRatingBar = (
    label: string,
    value: number,
    setValue: (val: number) => void,
    icon: React.ReactNode,
    unitDescription: string
  ) => {
    return (
      <div className="p-3 bg-[#15151A] border border-[#202026] rounded-xl flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#F4F4F6] font-semibold">
            {icon}
            <span className="uppercase tracking-wider">{label}</span>
          </div>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-base font-extrabold text-[#D4FF00] tabular-nums">{value}</span>
            <span className="text-[10px] text-[#71717A]">/ 10</span>
            <span className="text-[10px] text-[#8E8E93] ml-1.5">({unitDescription})</span>
          </div>
        </div>

        {/* 10-step touch selectors */}
        <div className="grid grid-cols-10 gap-1 mt-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
            const isSelected = num === value;
            const isFilled = num <= value;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setValue(num)}
                aria-label={`${label} auf ${num} setzen`}
                className={`h-7 rounded-md text-[10px] font-mono font-semibold transition-all flex items-center justify-center ${
                  isSelected
                    ? 'bg-[#D4FF00] text-black shadow-sm'
                    : isFilled
                    ? 'bg-[#22222B] text-[#E4E4E7]'
                    : 'bg-[#18181E] text-[#52525B] hover:bg-[#202027]'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const getMetricDescriptor = (val: number) => {
    if (val >= 9) return 'Peak';
    if (val >= 7) return 'Hoch';
    if (val >= 5) return 'Mittel';
    return 'Niedrig';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#101013] border border-[#232328] rounded-2xl p-5 shadow-2xl text-[#F4F4F6] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#232328]">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase">
              TÄGLICHER FOKUS · {dateStr}
            </span>
            <h2 className="text-lg font-bold tracking-tight mt-0.5">DAILY CHECK-IN</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1A1F] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 my-4">
          {/* 4 Core Metrics */}
          {renderRatingBar('ENERGY', energy, setEnergy, <BatteryCharging className="w-4 h-4 text-[#38BDF8]" />, getMetricDescriptor(energy))}
          {renderRatingBar('MOOD', mood, setMood, <Smile className="w-4 h-4 text-[#22E58B]" />, getMetricDescriptor(mood))}
          {renderRatingBar('FOCUS', focus, setFocus, <Target className="w-4 h-4 text-[#A855F7]" />, getMetricDescriptor(focus))}
          {renderRatingBar('DISCIPLINE', discipline, setDiscipline, <Zap className="w-4 h-4 text-[#D4FF00]" />, getMetricDescriptor(discipline))}

          {/* Prompt 1: Main Goal */}
          <div className="p-3 bg-[#15151A] border border-[#202026] rounded-xl">
            <label className="block text-xs font-semibold text-[#F4F4F6] mb-1.5 uppercase tracking-wide">
              Was ist heute dein wichtigstes Ziel?
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#71717A] shrink-0 font-medium">Heute werde ich</span>
              <input
                type="text"
                value={mainGoal}
                onChange={(e) => setMainGoal(e.target.value)}
                placeholder="die Kernaufgabe ohne Ablenkung beenden..."
                className="w-full bg-[#18181E] border border-[#26262E] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F4F6] placeholder-[#52525B] focus:outline-none focus:border-[#D4FF00]"
              />
            </div>
          </div>

          {/* Prompt 2: Anti-Goal */}
          <div className="p-3 bg-[#15151A] border border-[#202026] rounded-xl">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#F4F4F6] mb-1.5 uppercase tracking-wide">
              <ShieldAlert className="w-3.5 h-3.5 text-[#F59E0B]" />
              Was darf heute auf keinen Fall passieren?
            </label>
            <input
              type="text"
              value={avoidToday}
              onChange={(e) => setAvoidToday(e.target.value)}
              placeholder="Kein Social-Media-Scrollen vor 18 Uhr..."
              className="w-full bg-[#18181E] border border-[#26262E] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F4F6] placeholder-[#52525B] focus:outline-none focus:border-[#F59E0B]"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3 bg-[#D4FF00] hover:bg-[#BEE500] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-[#D4FF00]/15"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>CHECK-IN SPEICHERN (+10 SCORE)</span>
          </button>
        </form>
      </div>
    </div>
  );
};
