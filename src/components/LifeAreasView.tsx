import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LifeArea } from '../types';
import { HabitIcon } from './HabitIcon';
import {
  Dumbbell,
  Target,
  Brain,
  Sparkles,
  Shield,
  Activity,
  Award,
  ChevronRight,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface LifeAreasViewProps {
  onStartSession: () => void;
  onOpenTimeline: () => void;
}

export const LifeAreasView: React.FC<LifeAreasViewProps> = ({
  onStartSession,
  onOpenTimeline,
}) => {
  const { areaScores, habits, logs, currentDate, sessions } = useApp();
  const [selectedArea, setSelectedArea] = useState<LifeArea>('body');

  const areaMeta: Record<
    LifeArea,
    { title: string; subtitle: string; icon: React.ReactNode; color: string; description: string }
  > = {
    body: {
      title: 'BODY & FITNESS',
      subtitle: 'Gym, Krafttraining, Regeneration & Sauna',
      icon: <Dumbbell className="w-4 h-4 text-[#D4FF00]" />,
      color: '#D4FF00',
      description: 'Physische Kraft, Hypertrophie und Erholung als Fundament aller anderen Leistungsbereiche.',
    },
    golf: {
      title: 'GOLF LEISTUNGSSPORT',
      subtitle: 'Driving Range, Kurzspiel, Putting & Runden',
      icon: <Target className="w-4 h-4 text-[#22E58B]" />,
      color: '#22E58B',
      description: 'Präzision unter mentalem Druck, technische Wiederholbarkeit und Handicap-Optimierung.',
    },
    school: {
      title: 'SCHULE & ABITUR',
      subtitle: 'Klausuren, Lernblöcke & Vorbereitung 12. Klasse',
      icon: <Brain className="w-4 h-4 text-[#38BDF8]" />,
      color: '#38BDF8',
      description: 'Strukturierte Deep-Work-Blöcke zur verlässlichen Notensicherung vor dem Abitur.',
    },
    mind: {
      title: 'MIND & MENTALE STÄRKE',
      subtitle: 'Lesen, Reflexion, Fokus & mentale Klarheit',
      icon: <Sparkles className="w-4 h-4 text-[#A855F7]" />,
      color: '#A855F7',
      description: 'Mentales Fundament, Lektüre und Emotionskontrolle bei Wettkämpfen und Stress.',
    },
    discipline: {
      title: 'DISZIPLIN & HABITS',
      subtitle: 'Kein Junk Food, Konsistenz & Nicht-Verhandelbares',
      icon: <Shield className="w-4 h-4 text-[#F59E0B]" />,
      color: '#F59E0B',
      description: 'Der Beweis täglicher Integrität: Taten statt bloßer Motivation.',
    },
    life: {
      title: 'LIFE & GROWTH',
      subtitle: 'Finanzen, persönliche Projekte & Organisation',
      icon: <Activity className="w-4 h-4 text-[#EC4899]" />,
      color: '#EC4899',
      description: 'Langfristige Weichenstellung für das Leben nach der Schule.',
    },
  };

  // Compute Overall Life Score (average of active areas)
  const allScores = Object.values(areaScores).map((a) => a.score);
  const overallLifeScore =
    allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 84;

  const currentAreaInfo = areaMeta[selectedArea];
  const currentAreaStats = areaScores[selectedArea];
  const areaHabits = habits.filter((h) => !h.archived && h.category === selectedArea);

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* Top Banner: Composite Life Score */}
      <div className="p-4 bg-gradient-to-r from-[#12141A] via-[#101115] to-[#161318] border border-[#232733] rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase block">
            PERSONAL OPERATING SYSTEM
          </span>
          <h2 className="text-xl font-black font-mono text-[#F4F4F6] uppercase mt-0.5">
            OVERALL LIFE SCORE
          </h2>
          <span className="text-xs text-[#A1A1AA] font-mono">
            6 Lebensbereiche harmonisiert
          </span>
        </div>

        <div className="text-right font-mono">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-4xl font-extrabold text-[#D4FF00] tracking-tight">{overallLifeScore}</span>
            <span className="text-xs text-[#71717A]">/ 100</span>
          </div>
          <button
            onClick={onOpenTimeline}
            className="text-[10px] text-[#38BDF8] hover:underline font-bold mt-1 block"
          >
            TIMELINE ANSEHEN →
          </button>
        </div>
      </div>

      {/* Life Area Cards Grid */}
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(areaMeta) as LifeArea[]).map((areaKey) => {
          const info = areaMeta[areaKey];
          const stats = areaScores[areaKey];
          const isSelected = selectedArea === areaKey;

          return (
            <button
              key={areaKey}
              onClick={() => setSelectedArea(areaKey)}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                isSelected
                  ? 'bg-[#181C24] border-[#38BDF8] shadow-md shadow-[#38BDF8]/10'
                  : 'bg-[#111114] border-[#1F1F24] hover:border-[#2C2C35]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {info.icon}
                  <span className="text-[10px] font-mono font-bold text-[#F4F4F6] uppercase truncate">
                    {areaKey}
                  </span>
                </div>
                <span
                  className="font-mono text-sm font-black tabular-nums"
                  style={{ color: info.color }}
                >
                  {stats?.score || 80}
                </span>
              </div>

              <div className="mt-3">
                <span className="text-xs font-bold text-[#F4F4F6] block truncate">
                  {info.title.split(' ')[0]}
                </span>
                <span className="text-[10px] text-[#71717A] truncate block font-mono">
                  {stats?.weeklyProgress
                    ? `${stats.weeklyProgress.current}/${stats.weeklyProgress.target} Sessions`
                    : `${stats?.completedCount || 0} erledigt`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#1A1A22] h-1 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stats?.score || 80}%`,
                    backgroundColor: info.color,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Area Detail Inspection */}
      <div className="p-4 bg-[#111114] border border-[#1F1F24] rounded-2xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E1E24]">
          <div className="flex items-center gap-2">
            {currentAreaInfo.icon}
            <div>
              <h3 className="text-sm font-bold text-[#F4F4F6] uppercase">
                {currentAreaInfo.title}
              </h3>
              <span className="text-[10px] text-[#71717A] font-mono block">
                {currentAreaInfo.subtitle}
              </span>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-2xl font-black text-[#F4F4F6]">{currentAreaStats?.score}</span>
            <span className="text-xs text-[#71717A]">/100</span>
          </div>
        </div>

        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          {currentAreaInfo.description}
        </p>

        {/* Associated Habits */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase block">
            GEKOPPELTE HABITS ({areaHabits.length})
          </span>
          {areaHabits.map((habit) => {
            const log = logs.find((l) => l.habitId === habit.id && l.date === currentDate);
            return (
              <div
                key={habit.id}
                className="p-2.5 bg-[#15151A] rounded-xl border border-[#1E1E24] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <HabitIcon name={habit.icon} className="w-3.5 h-3.5 text-[#D4FF00]" />
                  <span className="font-semibold text-[#F4F4F6] uppercase text-[11px]">{habit.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="text-[#8E8E93]">
                    {habit.frequency === 'weekly' ? `${habit.weeklyTarget}×/Woche` : 'Täglich'}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold ${
                      log?.completed ? 'bg-[#22E58B]/20 text-[#22E58B]' : 'bg-[#222228] text-[#71717A]'
                    }`}
                  >
                    {log?.completed ? 'HEUTE ✓' : 'OFFEN'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Trigger */}
        {(selectedArea === 'body' || selectedArea === 'golf' || selectedArea === 'school') && (
          <button
            onClick={onStartSession}
            className="w-full mt-2 py-2.5 bg-[#1E2330] hover:bg-[#283042] border border-[#2D374D] text-xs font-mono font-bold text-[#38BDF8] uppercase rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>SESSION FÜR {selectedArea.toUpperCase()} STARTEN</span>
          </button>
        )}
      </div>
    </div>
  );
};
