import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HabitCard } from './HabitCard';
import { HabitCategory } from '../types';
import { Plus, Search, Filter } from 'lucide-react';

interface HabitsViewProps {
  onOpenAddHabit: () => void;
  onStartSession: () => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  onOpenAddHabit,
  onStartSession,
}) => {
  const { habits, logs, currentDate, toggleHabit, updateHabitValue, getHabitStats } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'Alle' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'mind', label: 'Mind' },
    { id: 'discipline', label: 'Disziplin' },
    { id: 'work', label: 'Work' },
    { id: 'health', label: 'Health' },
  ];

  const filteredHabits = habits.filter((h) => {
    if (h.archived) return false;
    if (selectedCategory !== 'all' && h.category !== selectedCategory) return false;
    if (searchQuery.trim() && !h.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Top action & search */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Habits durchsuchen..."
            className="w-full bg-[#121215] border border-[#1F1F24] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F4F6] placeholder-[#52525B] focus:outline-none focus:border-[#D4FF00]"
          />
        </div>

        <button
          onClick={onOpenAddHabit}
          className="py-2 px-3 bg-[#D4FF00] hover:bg-[#BEE500] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-transform active:scale-95 flex items-center gap-1 shrink-0 shadow-md shadow-[#D4FF00]/15"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>NEU</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium tracking-tight whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-[#1F1F26] text-[#D4FF00] border border-[#2F2F3B]'
                : 'text-[#71717A] hover:text-[#A1A1AA]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Habits List */}
      <div className="space-y-2">
        {filteredHabits.length === 0 ? (
          <div className="p-8 text-center bg-[#111114] border border-[#1E1E24] rounded-2xl space-y-2">
            <p className="text-xs text-[#71717A]">Keine passenden Habits gefunden.</p>
            <button
              onClick={onOpenAddHabit}
              className="text-xs text-[#D4FF00] font-bold underline"
            >
              Jetzt neuen Habit erstellen
            </button>
          </div>
        ) : (
          filteredHabits.map((habit) => {
            const log = logs.find((l) => l.habitId === habit.id && l.date === currentDate);
            const stats = getHabitStats(habit.id);

            return (
              <div key={habit.id} className="space-y-1">
                <HabitCard
                  habit={habit}
                  log={log}
                  onToggle={() => toggleHabit(habit.id, currentDate)}
                  onUpdateValue={(val) => updateHabitValue(habit.id, val, currentDate)}
                  onStartSession={habit.type === 'time' ? onStartSession : undefined}
                />
                <div className="flex items-center justify-between px-3 text-[10px] font-mono text-[#71717A]">
                  <span>{stats.completionRate}% Konsistenz (30 Tage)</span>
                  <span>Aktiver Streak: {stats.currentStreak} Tage</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
