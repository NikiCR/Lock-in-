import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, Check, Plus, Calendar } from 'lucide-react';
import { LifeArea } from '../types';

export const DailyScheduleWidget: React.FC = () => {
  const { schedule, toggleScheduleItem, addScheduleItem } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newTime, setNewTime] = useState('16:00');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<LifeArea>('body');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addScheduleItem({
      date: new Date().toISOString().slice(0, 10),
      time: newTime,
      title: newTitle.trim(),
      category: newCategory,
      completed: false,
    });
    setNewTitle('');
    setShowAdd(false);
  };

  const getAreaColor = (cat: LifeArea) => {
    switch (cat) {
      case 'golf':
        return 'text-[#22E58B] border-[#22E58B]/30';
      case 'school':
        return 'text-[#38BDF8] border-[#38BDF8]/30';
      case 'body':
        return 'text-[#D4FF00] border-[#D4FF00]/30';
      case 'mind':
        return 'text-[#A855F7] border-[#A855F7]/30';
      default:
        return 'text-[#F59E0B] border-[#F59E0B]/30';
    }
  };

  return (
    <div className="p-4 bg-[#111114] border border-[#1F1F24] rounded-2xl space-y-3 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#8E8E93] uppercase">
            TAGESPLAN (SCHEDULE)
          </span>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-[10px] font-mono text-[#8E8E93] hover:text-white flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          <span>EINTRAG</span>
        </button>
      </div>

      {/* Add Item Row */}
      {showAdd && (
        <form onSubmit={handleAdd} className="p-2.5 bg-[#16161D] rounded-xl border border-[#252530] space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="bg-[#1D1D27] border border-[#2C2C3A] rounded px-2 py-1 text-xs text-[#F4F4F6]"
            />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="z.B. Golf Kurzspiel, Klausurvorbereitung..."
              className="flex-1 bg-[#1D1D27] border border-[#2C2C3A] rounded px-2 py-1 text-xs text-[#F4F4F6] placeholder-[#52525B]"
            />
          </div>

          <div className="flex items-center justify-between">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as LifeArea)}
              className="bg-[#1D1D27] border border-[#2C2C3A] rounded px-2 py-1 text-[11px] text-[#A1A1AA]"
            >
              <option value="school">School / Abitur</option>
              <option value="golf">Golf Leistungssport</option>
              <option value="body">Body / Gym / Sauna</option>
              <option value="mind">Mind / Fokus</option>
              <option value="discipline">Discipline</option>
            </select>

            <button
              type="submit"
              className="px-3 py-1 bg-[#D4FF00] text-black font-bold text-[10px] uppercase rounded"
            >
              HINZUFÜGEN
            </button>
          </div>
        </form>
      )}

      {/* Schedule Items List */}
      <div className="space-y-1.5">
        {schedule.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleScheduleItem(item.id)}
            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              item.completed
                ? 'bg-[#121513] border-[#22C55E]/30 opacity-75'
                : 'bg-[#15151A] border-[#1E1E24] hover:border-[#2C2C35]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#8E8E93] w-10">
                {item.time}
              </span>
              <div>
                <span
                  className={`text-xs font-semibold block ${
                    item.completed ? 'line-through text-[#71717A]' : 'text-[#F4F4F6]'
                  }`}
                >
                  {item.title}
                </span>
                <span className={`text-[9px] font-mono uppercase ${getAreaColor(item.category)}`}>
                  {item.category}
                </span>
              </div>
            </div>

            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                item.completed ? 'bg-[#D4FF00] text-black' : 'border border-[#3F3F46]'
              }`}
            >
              {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
