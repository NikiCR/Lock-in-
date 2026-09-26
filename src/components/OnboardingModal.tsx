import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HabitIcon } from './HabitIcon';
import { ArrowRight, Check, Shield, Flame, Target, Zap } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { habits, updateProfile } = useApp();
  const [step, setStep] = useState(1);
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>(
    habits.map((h) => h.id)
  );
  const [targetScore, setTargetScore] = useState<number>(80);

  const toggleSelectHabit = (id: string) => {
    setSelectedHabitIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    updateProfile({
      onboardingCompleted: true,
      targetScore,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#0D0D10] border border-[#232328] rounded-3xl p-6 shadow-2xl text-[#F4F4F6] flex flex-col justify-between min-h-[500px]">
        {/* Progress indicator */}
        <div className="flex items-center gap-1.5 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor: s <= step ? '#D4FF00' : '#222228',
              }}
            />
          ))}
        </div>

        {/* STEP 1: Philosophy & Identity */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-center text-center space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-[#D4FF00]/10 border border-[#D4FF00]/30 flex items-center justify-center text-[#D4FF00] mx-auto">
              <Zap className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-[11px] font-mono tracking-[0.3em] text-[#8E8E93] uppercase block mb-1">
                SYSTEM ÜBER MOTIVATION
              </span>
              <h1 className="text-4xl font-black tracking-tighter text-[#F4F4F6] uppercase font-mono">
                LOCK IN.
              </h1>
              <p className="text-sm text-[#A1A1AA] mt-2 font-medium">
                „Build proof of your discipline.“
              </p>
            </div>

            <p className="text-xs text-[#71717A] max-w-xs mx-auto leading-relaxed">
              Vergiss vage Neujahrsvorsätze. Dieses persönliche Dashboard misst jeden Tag deine tatsächlichen Taten und macht deinen Fortschritt unbestechlich sichtbar.
            </p>
          </div>
        )}

        {/* STEP 2: Choose Habits */}
        {step === 2 && (
          <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-300">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase block">
                SCHRITT 2 VON 4
              </span>
              <h2 className="text-xl font-bold tracking-tight mt-0.5">WÄHLE DEINE HABITS</h2>
              <p className="text-xs text-[#71717A] mt-1">
                Definiere die Prioritäten, die für dich nicht verhandelbar sind.
              </p>

              <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-1">
                {habits.map((habit) => {
                  const isChecked = selectedHabitIds.includes(habit.id);
                  return (
                    <div
                      key={habit.id}
                      onClick={() => toggleSelectHabit(habit.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-[#141714] border-[#22C55E]/40 text-white'
                          : 'bg-[#15151A] border-[#1F1F24] text-[#71717A]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <HabitIcon name={habit.icon} className={`w-4 h-4 ${isChecked ? 'text-[#D4FF00]' : 'text-[#71717A]'}`} />
                        <span className="text-xs font-bold uppercase">{habit.name}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-[#D4FF00] text-black' : 'border border-[#3F3F46]'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Set Goals */}
        {step === 3 && (
          <div className="flex-1 flex flex-col justify-center space-y-4 animate-in fade-in duration-300">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase block">
                SCHRITT 3 VON 4
              </span>
              <h2 className="text-xl font-bold tracking-tight mt-0.5">DEIN TÄGLICHER ANSPRUCH</h2>
              <p className="text-xs text-[#71717A] mt-1">
                Wähle deinen angestrebten Mindest-Score für jeden Tag.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 my-2">
              {[
                { score: 75, label: 'SOLID', desc: 'Solide Konstanz' },
                { score: 80, label: 'ELITE', desc: 'WHOOP Standard' },
                { score: 90, label: 'LOCKED IN', desc: 'Extremer Fokus' },
              ].map((tier) => (
                <button
                  key={tier.score}
                  type="button"
                  onClick={() => setTargetScore(tier.score)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    targetScore === tier.score
                      ? 'bg-[#181C16] border-[#D4FF00] shadow-md shadow-[#D4FF00]/10'
                      : 'bg-[#141418] border-[#202026] text-[#8E8E93] hover:border-[#2C2C35]'
                  }`}
                >
                  <span className="text-2xl font-black font-mono block text-[#F4F4F6]">
                    {tier.score}
                  </span>
                  <span
                    className={`text-[10px] font-bold block mt-0.5 ${
                      targetScore === tier.score ? 'text-[#D4FF00]' : 'text-[#71717A]'
                    }`}
                  >
                    {tier.label}
                  </span>
                  <span className="text-[9px] text-[#52525B] block mt-1">
                    {tier.desc}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-[#71717A] text-center">
              Der Score kombiniert Gewohnheiten, Reflexion, Fokus-Timer und Streak-Konsistenz.
            </p>
          </div>
        )}

        {/* STEP 4: Ready */}
        {step === 4 && (
          <div className="flex-1 flex flex-col justify-center text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#D4FF00] text-black flex items-center justify-center mx-auto shadow-xl shadow-[#D4FF00]/20">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase block mb-1">
                BEREIT
              </span>
              <h2 className="text-3xl font-black tracking-tight text-[#F4F4F6] uppercase font-mono">
                START TODAY.
              </h2>
              <p className="text-xs text-[#A1A1AA] mt-2 max-w-xs mx-auto">
                Der heutige Tag zählt. Hake deine ersten Habits ab, starte eine Lock-In Session und schließe den Tag mit deinem Journal ab.
              </p>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="pt-4 border-t border-[#1C1C22]">
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="w-full py-3.5 bg-[#D4FF00] hover:bg-[#BEE500] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-[#D4FF00]/15"
            >
              <span>WEITER</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="w-full py-3.5 bg-[#D4FF00] hover:bg-[#BEE500] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-[#D4FF00]/20"
            >
              <span>ZUM DASHBOARD</span>
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
