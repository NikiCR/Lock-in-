import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, Bot, RefreshCw } from 'lucide-react';

interface JarvisCardProps {
  onOpenJarvisModal: () => void;
  onOpenBriefingModal: () => void;
}

export const JarvisCard: React.FC<JarvisCardProps> = ({
  onOpenJarvisModal,
  onOpenBriefingModal,
}) => {
  const { jarvisAdvice, isJarvisLoading, askJarvis } = useApp();

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    askJarvis(undefined, 'advice');
  };

  return (
    <div
      onClick={onOpenJarvisModal}
      className="p-4 bg-gradient-to-br from-[#121418] via-[#101014] to-[#141216] border border-[#232733] hover:border-[#38BDF8]/40 rounded-2xl cursor-pointer transition-all shadow-lg group select-none relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#38BDF8]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top indicator bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1E2028]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
            <Bot className="w-3 h-3" />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#38BDF8] uppercase">
            JARVIS · AI OPERATING COACH
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            title="Aktualisieren"
            disabled={isJarvisLoading}
            className="w-6 h-6 rounded-md hover:bg-[#1A1C24] flex items-center justify-center text-[#71717A] hover:text-[#F4F4F6] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isJarvisLoading ? 'animate-spin text-[#38BDF8]' : ''}`} />
          </button>
          <span className="text-[10px] text-[#71717A] group-hover:text-white flex items-center gap-0.5 font-mono">
            Öffnen <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Intelligent advice text */}
      <p className="text-xs text-[#E4E4E7] leading-relaxed line-clamp-3 font-normal">
        {jarvisAdvice}
      </p>

      {/* Quick context triggers */}
      <div className="mt-3 pt-2.5 border-t border-[#1C1D24] flex items-center justify-between text-[10px] font-mono">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenBriefingModal();
          }}
          className="text-[#D4FF00] hover:underline flex items-center gap-1 font-bold"
        >
          <Sparkles className="w-3 h-3" />
          <span>MORNING BRIEFING</span>
        </button>

        <span className="text-[#71717A]">
          Kontext: 12. Klasse · Golf · Gym
        </span>
      </div>
    </div>
  );
};
