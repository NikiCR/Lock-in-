import React, { useState } from 'react';
import { Habit, HabitType, HabitCategory, HabitFrequency } from '../types';
import { HabitIcon } from './HabitIcon';
import { X, Plus } from 'lucide-react';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
}

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('fitness');
  const [type, setType] = useState<HabitType>('boolean');
  const [target, setTarget] = useState<number>(1);
  const [unit, setUnit] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [icon, setIcon] = useState('dumbbell');
  const [color, setColor] = useState('#D4FF00');

  const availableIcons = [
    'dumbbell',
    'brain',
    'book-open',
    'flame',
    'footprints',
    'shield',
    'zap',
    'droplets',
    'moon',
    'target',
    'code',
    'clock',
  ];

  const availableColors = ['#D4FF00', '#22E58B', '#38BDF8', '#F59E0B', '#A855F7', '#EC4899'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate({
      name: name.trim().toUpperCase(),
      category,
      type,
      target: type === 'boolean' ? 1 : Number(target) || 1,
      unit: type === 'boolean' ? '' : unit.trim(),
      frequency,
      icon,
      color,
      archived: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#101014] border border-[#232328] rounded-2xl p-5 shadow-2xl text-[#F4F4F6] max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#232328]">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase">
              NEUES ZIEL DEFINIEREN
            </span>
            <h2 className="text-lg font-bold tracking-tight mt-0.5">HABIT ERSTELLEN</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1A1F] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-1">
              Habit Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. KALT DUSCHEN, 10K STEPS, LESEN..."
              className="w-full bg-[#17171C] border border-[#26262F] rounded-xl px-3 py-2 text-xs font-semibold text-[#F4F4F6] placeholder-[#52525B] focus:outline-none focus:border-[#D4FF00]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-1">
              Kategorie
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['fitness', 'mind', 'discipline', 'health', 'work'] as HabitCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 text-[11px] font-semibold rounded-lg capitalize transition-all ${
                    category === cat
                      ? 'bg-[#D4FF00] text-black font-bold'
                      : 'bg-[#17171C] text-[#8E8E93] hover:bg-[#202027]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Habit Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-1">
              Tracking Typ
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'boolean', label: 'Check ✓' },
                { id: 'numeric', label: 'Zahl (z.B. 10k)' },
                { id: 'time', label: 'Zeit (Minuten)' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setType(t.id as HabitType);
                    if (t.id === 'time') {
                      setTarget(30);
                      setUnit('Min');
                    } else if (t.id === 'numeric') {
                      setTarget(10);
                      setUnit('Seiten');
                    } else {
                      setTarget(1);
                      setUnit('');
                    }
                  }}
                  className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${
                    type === t.id
                      ? 'bg-[#38BDF8] text-black font-bold'
                      : 'bg-[#17171C] text-[#8E8E93] hover:bg-[#202027]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target & Unit (if not boolean) */}
          {type !== 'boolean' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#15151A] rounded-xl border border-[#23232A]">
              <div>
                <label className="block text-[11px] font-semibold text-[#8E8E93] mb-1 uppercase">
                  Tagesziel
                </label>
                <input
                  type="number"
                  min={1}
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  className="w-full bg-[#18181E] border border-[#282832] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#F4F4F6] focus:outline-none focus:border-[#D4FF00]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#8E8E93] mb-1 uppercase">
                  Einheit
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Min, Schritte, Liter..."
                  className="w-full bg-[#18181E] border border-[#282832] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F4F6] focus:outline-none focus:border-[#D4FF00]"
                />
              </div>
            </div>
          )}

          {/* Frequency */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-1">
              Frequenz
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${
                  frequency === 'daily'
                    ? 'bg-[#22E58B] text-black font-bold'
                    : 'bg-[#17171C] text-[#8E8E93] hover:bg-[#202027]'
                }`}
              >
                Jeden Tag (7/7)
              </button>
              <button
                type="button"
                onClick={() => setFrequency('weekdays')}
                className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${
                  frequency === 'weekdays'
                    ? 'bg-[#22E58B] text-black font-bold'
                    : 'bg-[#17171C] text-[#8E8E93] hover:bg-[#202027]'
                }`}
              >
                Werktags (Mo-Fr)
              </button>
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {availableIcons.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`h-10 rounded-xl flex items-center justify-center transition-all ${
                    icon === ic
                      ? 'bg-[#D4FF00] text-black scale-105'
                      : 'bg-[#17171C] text-[#8E8E93] hover:text-white hover:bg-[#202027]'
                  }`}
                >
                  <HabitIcon name={ic} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
              Akzentfarbe
            </label>
            <div className="flex items-center gap-3">
              {availableColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#101014]' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full mt-4 py-3 bg-[#D4FF00] hover:bg-[#BEE500] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-transform active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-lg shadow-[#D4FF00]/15"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>HABIT AKTIVIEREN</span>
          </button>
        </form>
      </div>
    </div>
  );
};
