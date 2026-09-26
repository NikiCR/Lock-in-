import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HabitIcon } from './HabitIcon';
import {
  X,
  User,
  Bell,
  Volume2,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddHabit: () => void;
  onRestartOnboarding: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAddHabit,
  onRestartOnboarding,
}) => {
  if (!isOpen) return null;

  const {
    profile,
    updateProfile,
    habits,
    deleteHabit,
    exportDataJSON,
    importDataJSON,
    resetData,
  } = useApp();

  const [name, setName] = useState(profile.name);
  const [tagline, setTagline] = useState(profile.tagline);
  const [soundEnabled, setSoundEnabled] = useState(profile.soundEnabled);
  const [morningReminder, setMorningReminder] = useState(profile.morningReminder);
  const [eveningReminder, setEveningReminder] = useState(profile.eveningReminder);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSaveProfile = () => {
    updateProfile({
      name,
      tagline,
      soundEnabled,
      morningReminder,
      eveningReminder,
    });
    onClose();
  };

  const handleExport = () => {
    const dataStr = exportDataJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lockin-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          setImportStatus('Daten erfolgreich wiederhergestellt!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Ungültiges Dateiformat.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#101014] border border-[#232328] rounded-2xl p-5 shadow-2xl text-[#F4F4F6] max-h-[92vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#232328]">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase">
              SYSTEM & PRÄFERENZEN
            </span>
            <h2 className="text-lg font-bold tracking-tight mt-0.5">EINSTELLUNGEN</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1A1F] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: User Profile */}
        <div className="p-3.5 bg-[#15151A] border border-[#202026] rounded-xl space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F4F4F6]">
            <User className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span className="uppercase tracking-wide">Dein Profil</span>
          </div>

          <div>
            <label className="text-[10px] font-mono text-[#8E8E93] uppercase block mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#18181E] border border-[#26262E] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F4F6] focus:outline-none focus:border-[#D4FF00]"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-[#8E8E93] uppercase block mb-1">
              Disziplin Mantra / Leitspruch
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-[#18181E] border border-[#26262E] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F4F6] focus:outline-none focus:border-[#D4FF00]"
            />
          </div>
        </div>

        {/* Section 2: Habit Management */}
        <div className="p-3.5 bg-[#15151A] border border-[#202026] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-[#F4F4F6]">
              Habits Verwalten ({habits.length})
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenAddHabit();
              }}
              className="px-2 py-1 bg-[#D4FF00] hover:bg-[#BEE500] text-black font-mono text-[10px] font-bold uppercase rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>NEUER HABIT</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="p-2 bg-[#18181E] rounded-lg flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <HabitIcon name={habit.icon} className="w-3.5 h-3.5 text-[#D4FF00]" />
                  <span className="font-semibold uppercase text-[11px] truncate">{habit.name}</span>
                </div>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  aria-label={`${habit.name} löschen`}
                  className="w-6 h-6 rounded flex items-center justify-center text-[#71717A] hover:text-[#EF4444] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Audio & Notifications */}
        <div className="p-3.5 bg-[#15151A] border border-[#202026] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F4F4F6]">
              <Volume2 className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="uppercase tracking-wide">Audio Haptik Cues</span>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="accent-[#D4FF00] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-[#1F1F26] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F4F4F6]">
              <Bell className="w-3.5 h-3.5 text-[#22E58B]" />
              <span className="uppercase tracking-wide">Erinnerungen (08:00 / 21:00)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="text-[10px] text-[#8E8E93] block mb-0.5">Morgen-Fokus</label>
                <input
                  type="time"
                  value={morningReminder}
                  onChange={(e) => setMorningReminder(e.target.value)}
                  className="w-full bg-[#18181E] border border-[#26262E] rounded px-2 py-1 text-xs text-[#F4F4F6]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#8E8E93] block mb-0.5">Abend-Review</label>
                <input
                  type="time"
                  value={eveningReminder}
                  onChange={(e) => setEveningReminder(e.target.value)}
                  className="w-full bg-[#18181E] border border-[#26262E] rounded px-2 py-1 text-xs text-[#F4F4F6]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Data Export / Backup / Reset */}
        <div className="p-3.5 bg-[#15151A] border border-[#202026] rounded-xl space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wide text-[#F4F4F6] block">
            Daten & Backup (100% Lokal & Privat)
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              className="py-2 px-3 bg-[#18181E] hover:bg-[#202028] border border-[#26262E] rounded-lg text-xs font-semibold text-[#F4F4F6] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Export (JSON)</span>
            </button>

            <label className="py-2 px-3 bg-[#18181E] hover:bg-[#202028] border border-[#26262E] rounded-lg text-xs font-semibold text-[#F4F4F6] flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5 text-[#22E58B]" />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>

          {importStatus && (
            <p className="text-[11px] font-mono text-[#D4FF00] text-center pt-1">{importStatus}</p>
          )}

          <div className="pt-2 border-t border-[#1F1F26] flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                onRestartOnboarding();
              }}
              className="text-[11px] text-[#8E8E93] hover:text-white flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Onboarding wiederholen</span>
            </button>

            {showConfirmReset ? (
              <button
                onClick={() => {
                  resetData();
                  setShowConfirmReset(false);
                  onClose();
                }}
                className="text-[11px] text-[#EF4444] font-bold hover:underline"
              >
                Ja, alle Daten löschen
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="text-[11px] text-[#71717A] hover:text-[#EF4444] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Zurücksetzen</span>
              </button>
            )}
          </div>
        </div>

        {/* Save CTA */}
        <button
          onClick={handleSaveProfile}
          className="w-full py-3 bg-[#D4FF00] hover:bg-[#BEE500] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-transform active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-lg shadow-[#D4FF00]/15"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>ÄNDERUNGEN SPEICHERN</span>
        </button>
      </div>
    </div>
  );
};
