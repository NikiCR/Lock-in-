import React from 'react';
import { useApp } from '../context/AppContext';
import { formatDisplayDate } from '../utils/dateUtils';
import { Settings, Flame, Bot } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenJarvis?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenJarvis }) => {
  const { currentDate, currentStreak, goToToday } = useApp();
  const dateInfo = formatDisplayDate(currentDate);

  return (
    <header className="sticky top-0 z-30 bg-[#08080A]/90 backdrop-blur-md border-b border-[#1A1A20] px-4 py-3 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="text-base font-black tracking-tight text-[#F4F4F6] font-mono uppercase hover:text-[#D4FF00] transition-colors"
          >
            LOCK IN
          </button>
          {!dateInfo.isToday && (
            <button
              onClick={goToToday}
              className="text-[10px] font-mono font-bold text-[#D4FF00] bg-[#D4FF00]/10 px-2 py-0.5 rounded-full"
            >
              HEUTE
            </button>
          )}
        </div>

        {/* Zone 2: Date & Streak Unboxed Text */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#8E8E93]">
          <span>{dateInfo.dayNumber} {dateInfo.monthShort}</span>
          <span aria-hidden="true" className="text-[#3F3F46]">·</span>
          <div className="flex items-center gap-1 text-[#F4F4F6] font-semibold">
            <Flame className="w-3.5 h-3.5 text-[#D4FF00] fill-current" />
            <span>{currentStreak}D</span>
          </div>
        </div>

        {/* Zone 3: Actions (JARVIS AI & Settings) */}
        <div className="flex items-center gap-1.5">
          {onOpenJarvis && (
            <button
              onClick={onOpenJarvis}
              aria-label="JARVIS AI Coach"
              title="JARVIS AI Coach"
              className="px-2 py-1 rounded-full bg-[#141B26] hover:bg-[#1E293B] border border-[#2B394E] flex items-center gap-1 text-[11px] font-mono font-bold text-[#38BDF8] transition-colors"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>JARVIS</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            aria-label="Einstellungen öffnen"
            className="w-8 h-8 rounded-full bg-[#15151A] hover:bg-[#202026] flex items-center justify-center text-[#8E8E93] hover:text-[#F4F4F6] transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
