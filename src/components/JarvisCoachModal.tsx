import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bot, X, Send, Sparkles, Sun, Moon, Target, Dumbbell, Shield, RefreshCw } from 'lucide-react';

interface JarvisCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JarvisCoachModal: React.FC<JarvisCoachModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const {
    profile,
    currentScore,
    currentStreak,
    weeklyGoalsSummary,
    askJarvis,
    isJarvisLoading,
    jarvisAdvice,
  } = useApp();

  const [inputQuestion, setInputQuestion] = useState('');
  const [activeResponse, setActiveResponse] = useState<string>(jarvisAdvice);
  const [modeTitle, setModeTitle] = useState('STATUSANALYSE');

  const handleRunMode = async (mode: 'briefing' | 'evening' | 'advice', title: string) => {
    setModeTitle(title);
    const reply = await askJarvis(undefined, mode);
    setActiveResponse(reply);
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim()) return;

    setModeTitle(`ANFRAGE: „${inputQuestion.trim()}“`);
    const q = inputQuestion.trim();
    setInputQuestion('');
    const reply = await askJarvis(q, 'chat');
    setActiveResponse(reply);
  };

  const quickPrompts = [
    {
      label: 'Golf & Gym Timing',
      question: 'Wie sollte ich heute nach der Schule Golf und Gym zeitlich timen, um Spitzenleistung zu bringen?',
    },
    {
      label: 'Wochenziel Status',
      question: 'Welche Wochenziele (Gym, Golf, Sauna, Abitur) haben diese Woche noch Rückstand?',
    },
    {
      label: 'Schwachstellen Analyse',
      question: 'Wo zeigen meine Daten in den letzten 14 Tagen die größte Inkonsequenz?',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0C0E12] border border-[#232B3B] rounded-3xl p-5 shadow-2xl text-[#F4F4F6] max-h-[92vh] overflow-y-auto flex flex-col justify-between space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2330]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black font-mono tracking-tight text-[#F4F4F6]">
                  JARVIS
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30">
                  AI COACH
                </span>
              </div>
              <span className="text-[10px] text-[#8E8E93] block font-mono">
                Persönliches OS für {profile.name} (17 · 12. Klasse)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#161A24] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Preset Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleRunMode('briefing', 'MORNING BRIEFING')}
            disabled={isJarvisLoading}
            className="p-2.5 bg-[#141822] hover:bg-[#1B2232] border border-[#232E44] rounded-xl text-left flex items-center gap-2 text-xs transition-colors disabled:opacity-50"
          >
            <Sun className="w-3.5 h-3.5 text-[#D4FF00] shrink-0" />
            <div>
              <span className="font-bold text-[#F4F4F6] block text-[11px]">MORNING BRIEFING</span>
              <span className="text-[9px] text-[#8E8E93] font-mono">Tagesfokus & Termine</span>
            </div>
          </button>

          <button
            onClick={() => handleRunMode('evening', 'EVENING REVIEW')}
            disabled={isJarvisLoading}
            className="p-2.5 bg-[#141822] hover:bg-[#1B2232] border border-[#232E44] rounded-xl text-left flex items-center gap-2 text-xs transition-colors disabled:opacity-50"
          >
            <Moon className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            <div>
              <span className="font-bold text-[#F4F4F6] block text-[11px]">EVENING REVIEW</span>
              <span className="text-[9px] text-[#8E8E93] font-mono">Tagesabschluss & Journal</span>
            </div>
          </button>
        </div>

        {/* JARVIS Live Output Card */}
        <div className="p-4 bg-[#10131A] border border-[#232C3E] rounded-2xl space-y-2 relative">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider">
            <span className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3 h-3 text-[#38BDF8]" />
              {modeTitle}
            </span>
            {isJarvisLoading && (
              <span className="flex items-center gap-1 text-[#D4FF00] animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                VERARBEITE SENSORDATEN...
              </span>
            )}
          </div>

          <p className="text-xs text-[#F4F4F6] leading-relaxed font-normal whitespace-pre-line">
            {activeResponse}
          </p>

          <div className="pt-2 border-t border-[#1C2330] flex items-center justify-between text-[9px] font-mono text-[#71717A]">
            <span>Status: Lock-In {currentScore.totalScore}% · {currentStreak}D Streak</span>
            <span>Grounded on Live Data</span>
          </div>
        </div>

        {/* Quick Context Prompts */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#71717A] uppercase block">
            SCHNELLE ANALYSEN FÜR NIKLAS
          </span>
          <div className="flex flex-col gap-1.5">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={async () => {
                  setModeTitle(`FRAGE: ${p.label}`);
                  const reply = await askJarvis(p.question, 'chat');
                  setActiveResponse(reply);
                }}
                disabled={isJarvisLoading}
                className="p-2 bg-[#131720] hover:bg-[#1A202D] border border-[#202738] rounded-xl text-left text-xs text-[#A1A1AA] hover:text-[#F4F4F6] transition-colors flex items-center justify-between"
              >
                <span>{p.label}</span>
                <span className="text-[10px] font-mono text-[#38BDF8]">Analyse →</span>
              </button>
            ))}
          </div>
        </div>

        {/* Direct Ask Input */}
        <form onSubmit={handleAskQuestion} className="relative pt-1">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Frag JARVIS nach Daten, Trends oder Taktik..."
            className="w-full bg-[#13161F] border border-[#252E40] rounded-xl pl-3 pr-10 py-2.5 text-xs text-[#F4F4F6] placeholder-[#52525B] focus:outline-none focus:border-[#38BDF8]"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isJarvisLoading}
            className="absolute right-2 top-3 w-7 h-7 rounded-lg bg-[#38BDF8] text-black disabled:opacity-40 flex items-center justify-center hover:bg-[#60A5FA] transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
