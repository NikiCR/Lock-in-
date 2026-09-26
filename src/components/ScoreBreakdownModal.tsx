import React from 'react';
import { ScoreBreakdown } from '../types';
import { getScoreTier } from '../utils/scoreCalculator';
import { X, CheckCircle, ShieldAlert, Award, Clock, Flame, CalendarCheck } from 'lucide-react';

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: ScoreBreakdown;
  dateStr: string;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({
  isOpen,
  onClose,
  score,
  dateStr,
}) => {
  if (!isOpen) return null;

  const tier = getScoreTier(score.totalScore);

  const breakdownRows = [
    {
      title: 'Habit Completion',
      weight: '50 Punkte max',
      current: score.habitScore,
      max: 50,
      icon: <CheckCircle className="w-4 h-4 text-[#D4FF00]" />,
      desc: `${score.habitCompletedCount} von ${score.habitTotalCount} Gewohnheiten heute absolviert.`,
      isComplete: score.habitScore >= 45,
    },
    {
      title: 'Lock-In Sessions',
      weight: '15 Punkte max',
      current: score.sessionScore,
      max: 15,
      icon: <Clock className="w-4 h-4 text-[#38BDF8]" />,
      desc: `${score.sessionMinutes} Min. Deep Work / Training geloggt (Ziel: ≥ 60 Min).`,
      isComplete: score.sessionScore >= 15,
    },
    {
      title: 'Discipline Streak & Consistency',
      weight: '15 Punkte max',
      current: score.consistencyScore,
      max: 15,
      icon: <Flame className="w-4 h-4 text-[#F59E0B]" />,
      desc: `${score.activeStreak} Tage aktiver Streak. Bonus für langfristige Verlässlichkeit.`,
      isComplete: score.consistencyScore >= 13,
    },
    {
      title: 'Daily Check-in',
      weight: '10 Punkte max',
      current: score.checkInScore,
      max: 10,
      icon: <CalendarCheck className="w-4 h-4 text-[#22E58B]" />,
      desc: score.checkInScore > 0 ? 'Energie, Fokus & Tagesziel eingetragen.' : 'Noch nicht ausgefüllt.',
      isComplete: score.checkInScore >= 10,
    },
    {
      title: 'Tages-Reflexion & Journal',
      weight: '10 Punkte max',
      current: score.journalScore,
      max: 10,
      icon: <Award className="w-4 h-4 text-[#A855F7]" />,
      desc: score.journalScore > 0 ? 'Win, Loss, Lesson dokumentiert.' : 'Noch keine Reflexion gespeichert.',
      isComplete: score.journalScore >= 10,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#111114] border border-[#232328] rounded-2xl p-5 shadow-2xl text-[#F4F4F6]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#232328]">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase">
              SCORE TRANSPARENZ · {dateStr}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-xl font-bold font-mono tracking-tight">{score.totalScore} / 100</h2>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ color: tier.color, backgroundColor: `${tier.color}20` }}
              >
                {tier.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1A1F] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explain Summary */}
        <p className="text-xs text-[#8E8E93] my-3 leading-relaxed">
          {score.totalScore === 100
            ? 'Perfekter Tag. Alle 5 Pfeiler maximal ausgeschöpft.'
            : tier.description}
        </p>

        {/* Breakdown List */}
        <div className="space-y-3 my-4">
          {breakdownRows.map((row, idx) => {
            const percent = Math.round((row.current / row.max) * 100);
            return (
              <div
                key={idx}
                className="p-3 bg-[#16161B] border border-[#202026] rounded-xl flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {row.icon}
                    <span className="text-xs font-semibold text-[#F4F4F6]">{row.title}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="font-bold text-[#F4F4F6]">{row.current}</span>
                    <span className="text-[#71717A]">/{row.max}</span>
                  </div>
                </div>

                <div className="w-full bg-[#202028] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: row.isComplete ? '#D4FF00' : '#38BDF8',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8E8E93]">
                  <span>{row.desc}</span>
                  <span className="font-mono">{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Missing points hint */}
        {score.totalScore < 100 && (
          <div className="p-3 bg-[#1A1813] border border-[#422006]/50 rounded-xl flex items-start gap-2.5 text-xs text-[#FDE047]">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#EAB308] mt-0.5" />
            <div>
              <span className="font-semibold block text-[#FEF08A]">Heutiges Potenzial:</span>
              <span className="text-[#A1A1AA] text-[11px]">
                Noch {100 - score.totalScore} Punkte erreichbar durch{' '}
                {score.checkInScore === 0 ? 'Daily Check-in, ' : ''}
                {score.journalScore === 0 ? 'Reflexion, ' : ''}
                {score.habitScore < 50 ? 'offene Gewohnheiten ' : ''}
                oder eine Lock-In Session.
              </span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 bg-[#23232A] hover:bg-[#2C2C35] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
        >
          SCHLIEẞEN
        </button>
      </div>
    </div>
  );
};
