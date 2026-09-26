import React, { useState } from 'react';
import { Habit, HabitLog } from '../types';
import { HabitIcon } from './HabitIcon';
import { getPastDates, isHabitScheduledForDate } from '../utils/dateUtils';
import { TrendingUp, Activity } from 'lucide-react';

interface HabitTrendChartsProps {
  habits: Habit[];
  logs: HabitLog[];
  todayStr: string;
}

interface TrendPoint {
  date: string;
  rollingRate: number; // 0-100 rolling completion rate up to this day
  isScheduled: boolean;
  completed: boolean;
}

export const HabitTrendCharts: React.FC<HabitTrendChartsProps> = ({
  habits,
  logs,
  todayStr,
}) => {
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Past 30 days chronologically (day 0 = 29 days ago, day 29 = today)
  const past30Days = getPastDates(30, todayStr);

  // Compute trend data for each habit
  // A 7-day rolling window gives a clean, meaningful trend line across the 30 days
  const computeTrendForHabit = (habit: Habit): TrendPoint[] => {
    return past30Days.map((dateStr, idx) => {
      // 7-day rolling window up to this date
      const windowStartIdx = Math.max(0, idx - 6);
      const windowDates = past30Days.slice(windowStartIdx, idx + 1);

      let scheduledInWindow = 0;
      let completedInWindow = 0;

      windowDates.forEach((d) => {
        if (isHabitScheduledForDate(habit.frequency, habit.customDays, d)) {
          scheduledInWindow++;
          const log = logs.find((l) => l.habitId === habit.id && l.date === d);
          if (log?.completed) {
            completedInWindow++;
          } else if (log && habit.type === 'numeric' && habit.target > 0) {
            completedInWindow += Math.min(1, Math.max(0, log.value / habit.target));
          }
        }
      });

      const rollingRate =
        scheduledInWindow > 0
          ? Math.round((completedInWindow / scheduledInWindow) * 100)
          : 0;

      const currentDayLog = logs.find((l) => l.habitId === habit.id && l.date === dateStr);
      const isScheduled = isHabitScheduledForDate(habit.frequency, habit.customDays, dateStr);

      return {
        date: dateStr,
        rollingRate,
        isScheduled,
        completed: Boolean(currentDayLog?.completed),
      };
    });
  };

  // Compute overall aggregate trend (average of all habits)
  const aggregateTrend: TrendPoint[] = past30Days.map((dateStr, idx) => {
    const windowStartIdx = Math.max(0, idx - 6);
    const windowDates = past30Days.slice(windowStartIdx, idx + 1);

    let totalScheduled = 0;
    let totalCompleted = 0;

    windowDates.forEach((d) => {
      habits.forEach((h) => {
        if (!h.archived && isHabitScheduledForDate(h.frequency, h.customDays, d)) {
          totalScheduled++;
          const log = logs.find((l) => l.habitId === h.id && l.date === d);
          if (log?.completed) {
            totalCompleted++;
          }
        }
      });
    });

    const rollingRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
    return {
      date: dateStr,
      rollingRate,
      isScheduled: true,
      completed: rollingRate >= 70,
    };
  });

  const habitsWithTrend = habits
    .filter((h) => !h.archived)
    .map((h) => ({
      habit: h,
      trend: computeTrendForHabit(h),
      color: h.color || '#D4FF00',
    }));

  const activeTrendData =
    selectedHabitId === 'all'
      ? aggregateTrend
      : habitsWithTrend.find((item) => item.habit.id === selectedHabitId)?.trend || aggregateTrend;

  const activeHabit = habits.find((h) => h.id === selectedHabitId);
  const activeColor = activeHabit?.color || '#D4FF00';

  // SVG Chart dimensions
  const width = 360;
  const height = 120;
  const paddingX = 14;
  const paddingY = 16;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const points = activeTrendData.map((pt, i) => {
    const x = paddingX + (i / (activeTrendData.length - 1)) * innerWidth;
    // Y inverted: 100% is top (paddingY), 0% is bottom (height - paddingY)
    const y = paddingY + (1 - pt.rollingRate / 100) * innerHeight;
    return { x, y, pt, i };
  });

  // Build SVG path string with smooth curves (catmull-rom or simple cubic bezier)
  const linePath = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    const cp2y = p.y;
    return `${acc} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, '');

  // Fill gradient path under line
  const lastPt = points[points.length - 1];
  const firstPt = points[0];
  const areaPath = `${linePath} L ${lastPt.x.toFixed(1)} ${(height - paddingY).toFixed(1)} L ${firstPt.x.toFixed(1)} ${(height - paddingY).toFixed(1)} Z`;

  // Start vs End rate for delta
  const startRate = activeTrendData[0]?.rollingRate || 0;
  const endRate = activeTrendData[activeTrendData.length - 1]?.rollingRate || 0;
  const delta = endRate - startRate;

  // Hovered data point
  const currentHoverPoint =
    hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className="p-4 bg-[#111114] border border-[#1F1F24] rounded-2xl space-y-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#D4FF00]" />
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#8E8E93] uppercase block">
              30-TAGE TRENDLINIE
            </span>
            <span className="text-xs font-bold text-[#F4F4F6] uppercase">
              {selectedHabitId === 'all' ? 'GESAMT-KONSISTENZ' : activeHabit?.name}
            </span>
          </div>
        </div>

        {/* Live Metric Display */}
        <div className="text-right font-mono">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-xl font-extrabold text-[#F4F4F6] tabular-nums">
              {currentHoverPoint?.pt.rollingRate}%
            </span>
            <span
              className={`text-[10px] font-bold ${
                delta >= 0 ? 'text-[#22E58B]' : 'text-[#EF4444]'
              }`}
            >
              {delta >= 0 ? `+${delta}%` : `${delta}%`}
            </span>
          </div>
          <span className="text-[9px] text-[#71717A] block">
            {hoveredIndex !== null ? currentHoverPoint.pt.date : '7-Tage Rolling Avg'}
          </span>
        </div>
      </div>

      {/* Habit Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => {
            setSelectedHabitId('all');
            setHoveredIndex(null);
          }}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold tracking-tight whitespace-nowrap transition-all ${
            selectedHabitId === 'all'
              ? 'bg-[#D4FF00] text-black font-bold'
              : 'bg-[#16161B] text-[#8E8E93] hover:text-white border border-[#222228]'
          }`}
        >
          ALLE HABITS
        </button>

        {habitsWithTrend.map(({ habit }) => {
          const isSelected = selectedHabitId === habit.id;
          return (
            <button
              key={habit.id}
              onClick={() => {
                setSelectedHabitId(habit.id);
                setHoveredIndex(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold tracking-tight whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-[#1F1F27] text-white border border-[#3A3A46]'
                  : 'bg-[#16161B] text-[#71717A] hover:text-[#A1A1AA] border border-[#202026]'
              }`}
            >
              <HabitIcon name={habit.icon} className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{habit.name}</span>
            </button>
          );
        })}
      </div>

      {/* SVG Trend Line Chart */}
      <div className="relative w-full bg-[#0C0C0F] rounded-xl border border-[#1A1A20] p-2 overflow-hidden">
        {/* Horizontal gridlines */}
        <div className="absolute inset-x-3 top-4 border-b border-[#1A1A22] border-dashed" />
        <div className="absolute inset-x-3 top-1/2 border-b border-[#1A1A22] border-dashed" />
        <div className="absolute inset-x-3 bottom-6 border-b border-[#1A1A22] border-dashed" />

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-28 overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id={`grad-${selectedHabitId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={activeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Fill under line */}
          <path d={areaPath} fill={`url(#grad-${selectedHabitId})`} />

          {/* 80% Threshold benchmark guideline */}
          <line
            x1={paddingX}
            y1={paddingY + (1 - 0.8) * innerHeight}
            x2={width - paddingX}
            y2={paddingY + (1 - 0.8) * innerHeight}
            stroke="#27272A"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Main trend line */}
          <path
            d={linePath}
            fill="none"
            stroke={activeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive touch/hover points */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onClick={() => setHoveredIndex(i)}
              >
                {/* Invisible wide touch hit area */}
                <rect
                  x={p.x - 6}
                  y={0}
                  width={12}
                  height={height}
                  fill="transparent"
                />

                {/* Visible indicator point */}
                {(isHovered || i === points.length - 1 || i === 0) && (
                  <>
                    {isHovered && (
                      <line
                        x1={p.x}
                        y1={paddingY}
                        x2={p.x}
                        y2={height - paddingY}
                        stroke="#52525B"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 4.5 : 3}
                      fill={activeColor}
                      stroke="#0C0C0F"
                      strokeWidth="2"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* X-Axis labels: 30D ago -> 15D ago -> Heute */}
        <div className="flex items-center justify-between text-[9px] font-mono text-[#71717A] px-1 pt-1 border-t border-[#16161D]">
          <span>vor 30 Tagen ({past30Days[0]?.slice(5)})</span>
          <span>vor 15 Tagen</span>
          <span className="text-[#A1A1AA]">Heute</span>
        </div>
      </div>

      {/* Mini Trend Summary Comparison */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
        <div className="p-2 bg-[#15151A] rounded-lg border border-[#1E1E24]">
          <span className="text-[9px] text-[#71717A] uppercase block">START (TAG 1)</span>
          <span className="text-xs font-bold text-[#F4F4F6]">{startRate}%</span>
        </div>
        <div className="p-2 bg-[#15151A] rounded-lg border border-[#1E1E24]">
          <span className="text-[9px] text-[#71717A] uppercase block">AKTUELL (TAG 30)</span>
          <span className="text-xs font-bold text-[#D4FF00]">{endRate}%</span>
        </div>
        <div className="p-2 bg-[#15151A] rounded-lg border border-[#1E1E24]">
          <span className="text-[9px] text-[#71717A] uppercase block">DELTA VERLAUF</span>
          <span
            className={`text-xs font-bold ${
              delta >= 0 ? 'text-[#22E58B]' : 'text-[#EF4444]'
            }`}
          >
            {delta >= 0 ? `+${delta}%` : `${delta}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
