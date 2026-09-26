import React from 'react';
import { TabType } from '../types';
import { LayoutDashboard, CheckSquare, Zap, Activity, TrendingUp } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onTriggerLockIn: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
  onTriggerLockIn,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0C]/90 backdrop-blur-xl border-t border-[#1C1C22] pb-safe max-w-md mx-auto">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {/* TAB 1: TODAY */}
        <button
          onClick={() => onSelectTab('today')}
          aria-label="Daily Dashboard"
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'today' ? 'text-[#D4FF00]' : 'text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-mono font-semibold tracking-tight mt-1">TODAY</span>
        </button>

        {/* TAB 2: HABITS */}
        <button
          onClick={() => onSelectTab('habits')}
          aria-label="Habits"
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'habits' ? 'text-[#D4FF00]' : 'text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          <CheckSquare className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-mono font-semibold tracking-tight mt-1">HABITS</span>
        </button>

        {/* CENTER CTA: LOCK-IN TIMER */}
        <div className="flex items-center justify-center">
          <button
            onClick={onTriggerLockIn}
            aria-label="Start Lock-In Session"
            className="w-12 h-12 rounded-2xl bg-[#D4FF00] hover:bg-[#BEE500] text-black flex flex-col items-center justify-center shadow-lg shadow-[#D4FF00]/25 transition-transform active:scale-95"
          >
            <Zap className="w-6 h-6 stroke-[3] fill-current" />
          </button>
        </div>

        {/* TAB 4: LIFE OS (AREAS) */}
        <button
          onClick={() => onSelectTab('areas')}
          aria-label="Life OS Areas"
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'areas' ? 'text-[#D4FF00]' : 'text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          <Activity className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-mono font-semibold tracking-tight mt-1">LIFE OS</span>
        </button>

        {/* TAB 5: STATS & ANALYTICS */}
        <button
          onClick={() => onSelectTab('insights')}
          aria-label="Analytics & Insights"
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'insights' || activeTab === 'history' ? 'text-[#D4FF00]' : 'text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-mono font-semibold tracking-tight mt-1">STATS</span>
        </button>
      </div>
    </div>
  );
};
