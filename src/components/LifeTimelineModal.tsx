import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LifeMilestone, LifeArea } from '../types';
import { X, Plus, Award, Calendar, CheckCircle2, Milestone } from 'lucide-react';

interface LifeTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LifeTimelineModal: React.FC<LifeTimelineModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { milestones, addMilestone } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<LifeArea>('golf');
  const [tag, setTag] = useState('MEILENSTEIN');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addMilestone({
      date: new Date().toISOString().slice(0, 10),
      title: title.trim(),
      description: description.trim(),
      category,
      tag: tag.toUpperCase(),
    });

    setTitle('');
    setDescription('');
    setShowAdd(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#101014] border border-[#232328] rounded-2xl p-5 shadow-2xl text-[#F4F4F6] max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#232328]">
          <div className="flex items-center gap-2">
            <Milestone className="w-4 h-4 text-[#D4FF00]" />
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase block">
                BEWEISLEISTUNG & ENTWICKLUNG
              </span>
              <h2 className="text-lg font-bold tracking-tight">LIFE TIMELINE</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1A1F] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#8E8E93] leading-relaxed">
          „Don't trust motivation. Build proof.“ Jede Errungenschaft, jeder Turniersieg, jede Klausurphase und jede Disziplinserie wird hier unverrückbar festgehalten.
        </p>

        {/* Trigger add */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-2.5 py-1 bg-[#1E2330] hover:bg-[#283144] border border-[#2B3549] text-[10px] font-mono font-bold text-[#38BDF8] rounded-lg flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>MEILENSTEIN LOGGEN</span>
          </button>
        </div>

        {/* Add Form */}
        {showAdd && (
          <form onSubmit={handleAdd} className="p-3 bg-[#15151C] border border-[#242430] rounded-xl space-y-2 text-xs">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titel (z.B. Golf Handicap PR, Klausurenphase gemeistert)..."
              className="w-full bg-[#1A1A24] border border-[#2D2D3E] rounded px-2.5 py-1.5 text-xs text-[#F4F4F6] placeholder-[#52525B]"
            />
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurze Beschreibung des Beweises..."
              className="w-full bg-[#1A1A24] border border-[#2D2D3E] rounded p-2 text-xs text-[#F4F4F6] placeholder-[#52525B] resize-none"
            />
            <div className="flex items-center justify-between">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LifeArea)}
                className="bg-[#1A1A24] border border-[#2D2D3E] rounded px-2 py-1 text-[11px] text-[#A1A1AA]"
              >
                <option value="golf">Golf Leistungssport</option>
                <option value="school">Schule / Abitur</option>
                <option value="body">Body / Fitness</option>
                <option value="discipline">Disziplin</option>
                <option value="mind">Mind</option>
              </select>

              <button
                type="submit"
                className="px-3 py-1 bg-[#D4FF00] text-black font-bold text-[10px] uppercase rounded"
              >
                SPEICHERN
              </button>
            </div>
          </form>
        )}

        {/* Timeline Items */}
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#202028]">
          {milestones.map((m) => (
            <div key={m.id} className="relative group">
              {/* Dot */}
              <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#111114] border-2 border-[#D4FF00] group-hover:scale-125 transition-transform" />

              <div className="p-3 bg-[#141419] border border-[#1F1F26] rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#D4FF00] font-bold">
                    {m.date}
                  </span>
                  {m.tag && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#202028] text-[#A1A1AA] uppercase">
                      {m.tag}
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-[#F4F4F6] uppercase tracking-tight">
                  {m.title}
                </h4>

                <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                  {m.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
