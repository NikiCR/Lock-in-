import React from 'react';
import { ScoreBreakdown } from '../types';
import { getScoreTier } from '../utils/scoreCalculator';
import { Info } from 'lucide-react';

interface ScoreRingProps {
  scoreData: ScoreBreakdown;
  onClickBreakdown?: () => void;
  size?: number;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  scoreData,
  onClickBreakdown,
  size = 200,
}) => {
  const { totalScore, habitCompletedCount, habitTotalCount, activeStreak } = scoreData;
  const tier = getScoreTier(totalScore);

  const strokeWidth = 14;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (Math.min(100, Math.max(0, totalScore)) / 100) * circumference;

  return (
    <div
      onClick={onClickBreakdown}
      role="button"
      tabIndex={0}
      aria-label={`Lock-In Score: ${totalScore}, Status: ${tier.label}. Klicke für Details.`}
      className="relative flex flex-col items-center justify-center cursor-pointer group select-none p-2 focus:outline-none"
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow behind ring */}
        <div
          className="absolute inset-4 rounded-full opacity-15 blur-xl transition-opacity group-hover:opacity-25 pointer-events-none"
          style={{ backgroundColor: tier.color }}
        />

        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#19191D"
            strokeWidth={strokeWidth}
          />
          {/* Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={tier.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Metrics */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-[#8E8E93] uppercase">
            LOCK-IN
          </span>
          <div className="flex items-baseline justify-center">
            <span className="text-5xl font-extrabold tracking-tighter text-[#F4F4F6] font-mono tabular-nums leading-none">
              {totalScore}
            </span>
            <span className="text-sm font-semibold text-[#8E8E93] ml-0.5">%</span>
          </div>
          <span
            className="text-[11px] font-bold tracking-widest mt-1.5 px-2 py-0.5 rounded-full"
            style={{ color: tier.color, backgroundColor: `${tier.color}15` }}
          >
            {tier.label}
          </span>
        </div>
      </div>

      {/* 7-Day Consistency Dot Pattern & Habit Ratio */}
      <div className="mt-3 flex items-center gap-3 text-xs text-[#8E8E93]">
        <div className="flex items-center gap-1.5" title={`${activeStreak} Tage Streak`}>
          <span className="font-mono text-xs font-semibold text-[#F4F4F6]">{activeStreak}D STREAK</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: i < Math.min(7, activeStreak) ? tier.color : '#27272A',
                }}
              />
            ))}
          </div>
        </div>

        <span className="text-[#3F3F46]">·</span>

        <span className="font-mono text-xs text-[#A1A1AA]">
          <strong className="text-[#F4F4F6] font-semibold">{habitCompletedCount}</strong>/{habitTotalCount} HABITS
        </span>

        <Info className="w-3.5 h-3.5 text-[#71717A] group-hover:text-[#F4F4F6] transition-colors ml-0.5" />
      </div>
    </div>
  );
};
