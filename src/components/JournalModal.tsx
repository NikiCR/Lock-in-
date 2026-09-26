import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { X, Trophy, AlertTriangle, Lightbulb, ArrowRight, Check } from 'lucide-react';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  journal?: JournalEntry;
  onSave: (data: Partial<JournalEntry>) => void;
  dateStr: string;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  journal,
  onSave,
  dateStr,
}) => {
  if (!isOpen) return null;

  const [win, setWin] = useState(journal?.win || '');
  const [loss, setLoss] = useState(journal?.loss || '');
  const [lesson, setLesson] = useState(journal?.lesson || '');
  const [tomorrow, setTomorrow] = useState(journal?.tomorrow || '');
  const [freeNote, setFreeNote] = useState(journal?.freeNote || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      win,
      loss,
      lesson,
      tomorrow,
      freeNote,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#101014] border border-[#232328] rounded-2xl p-5 shadow-2xl text-[#F4F4F6] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#232328]">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase">
              TAGES-REFLEXION · {dateStr}
            </span>
            <h2 className="text-lg font-bold tracking-tight mt-0.5">WIN / LOSS / LESSON</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1A1F] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 my-4">
          {/* WIN */}
          <div className="p-3 bg-[#141518] border border-[#1E2024] rounded-xl focus-within:border-[#22C55E]/50 transition-colors">
            <label className="flex items-center gap-2 text-xs font-bold text-[#22E58B] mb-1 uppercase tracking-wide">
              <Trophy className="w-3.5 h-3.5" />
              <span>WIN — Was lief heute gut?</span>
            </label>
            <textarea
              rows={2}
              value={win}
              onChange={(e) => setWin(e.target.value)}
              placeholder="3h tiefe Arbeit ohne Notification-Check durchgezogen..."
              className="w-full bg-[#18191E] border border-[#23242A] rounded-lg p-2.5 text-xs text-[#F4F4F6] placeholder-[#52525B] focus:outline-none focus:border-[#22E58B] resize-none"
            />
          </div>

          {/* LOSS */}
          <div className="p-3 bg-[#141518] border border-[#1E2024] rounded-xl focus-within:border-[#EF4444]/50 transition-colors">
            <label className="flex items-center gap-2 text-xs font-bold text-[#F87171] mb-1 uppercase tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>LOSS — Was lief heute schlecht?</span>
            </label>
            <textarea
              rows={2}
              value={loss}
              onChange={(e) => setLoss(e.target.value)}
              placeholder="Nachmittagstief durch zu schweres Essen..."
              className="w-full bg-[#18191E] border border-[#23242A] rounded-lg p-2.5 text-xs text-[#F4F4F6] placeholder-[#52525B] focus:outline-none focus:border-[#F87171] resize-none"
            />
          </div>

          {/* LESSON */}
          <div className="p-3 bg-[#141518] border border-[#1E2024] rounded-xl focus-within:border-[#D4FF00]/50 transition-colors">
            <label className="flex items-center gap-2 text-xs font-bold text-[#D4FF00] mb-1 uppercase tracking-wide">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>LESSON — Was habe ich daraus gelernt?</span>
            </label>
            <textarea
              rows={2}
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="Mittagessen leicht halten, um 14 Uhr Fokus zu wahren..."
              className="w-full bg-[#18191E] border border-[#23242A] rounded-lg p-2.5 text-xs text-[#F4F4F6] placeholder-[#52525B] focus:outline-none focus:border-[#D4FF00] resize-none"
            />
          </div>

          {/* TOMORROW */}
          <div className="p-3 bg-[#141518] border border-[#1E2024] rounded-xl focus-within:border-[#38BDF8]/50 transition-colors">
            <label className="flex items-center gap-2 text-xs font-bold text-[#38BDF8] mb-1 uppercase tracking-wide">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>TOMORROW — Was mache ich morgen besser?</span>
            </label>
            <textarea
              rows={2}
              value={tomorrow}
              onChange={(e) => setTomorrow(e.target.value)}
              placeholder="Vor 8 Uhr mit der schwersten Aufgabe beginnen..."
              className="w-full bg-[#18191E] border border-[#23242A] rounded-lg p-2.5 text-xs text-[#F4F4F6] placeholder-[#52525B] focus:outline-none focus:border-[#38BDF8] resize-none"
            />
          </div>

          {/* Optional Free Note */}
          <div className="p-3 bg-[#141518] border border-[#1E2024] rounded-xl">
            <label className="block text-[11px] font-semibold text-[#8E8E93] mb-1 uppercase tracking-wide">
              Zusätzliche Notiz (Optional)
            </label>
            <input
              type="text"
              value={freeNote}
              onChange={(e) => setFreeNote(e.target.value)}
              placeholder="Gedanke des Tages..."
              className="w-full bg-[#18191E] border border-[#23242A] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F4F6] placeholder-[#52525B] focus:outline-none focus:border-[#8E8E93]"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-[#D4FF00] hover:bg-[#BEE500] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-[#D4FF00]/15"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>JOURNAL SPEICHERN (+10 SCORE)</span>
          </button>
        </form>
      </div>
    </div>
  );
};
