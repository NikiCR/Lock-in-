import React, { useState, useEffect, useRef } from 'react';
import { SessionType, LockInSession } from '../types';
import { sound } from '../utils/audio';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Brain,
  Code,
  BookOpen,
  Dumbbell,
  Flame,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface LockInTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionComplete: (session: Omit<LockInSession, 'id' | 'createdAt'>) => void;
  dateStr: string;
}

export const LockInTimerModal: React.FC<LockInTimerModalProps> = ({
  isOpen,
  onClose,
  onSessionComplete,
  dateStr,
}) => {
  if (!isOpen) return null;

  const [sessionType, setSessionType] = useState<SessionType>('deep_work');
  const [sessionTitle, setSessionTitle] = useState('Core Deep Work Block');
  const [mode, setMode] = useState<'stopwatch' | 'countdown'>('countdown');
  const [targetMinutes, setTargetMinutes] = useState(45);
  
  // Timer state in seconds
  const [seconds, setSeconds] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTotalSeconds, setElapsedTotalSeconds] = useState(0);
  const [isCompletedState, setIsCompletedState] = useState(false);
  const [pointsGained, setPointsGained] = useState(15);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial seconds when target changes in countdown mode
  useEffect(() => {
    if (!isRunning && mode === 'countdown') {
      setSeconds(targetMinutes * 60);
    }
  }, [targetMinutes, mode, isRunning]);

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (mode === 'stopwatch') {
          setSeconds((prev) => prev + 1);
          setElapsedTotalSeconds((prev) => prev + 1);
        } else {
          setSeconds((prev) => {
            if (prev <= 1) {
              handleFinishSession(true);
              return 0;
            }
            return prev - 1;
          });
          setElapsedTotalSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const handleToggleTimer = () => {
    sound.triggerHaptic();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'countdown') {
      setSeconds(targetMinutes * 60);
    } else {
      setSeconds(0);
    }
    setElapsedTotalSeconds(0);
  };

  const handleFinishSession = (autoCompleted = false) => {
    setIsRunning(false);
    const durationMinutes = Math.max(1, Math.round(elapsedTotalSeconds / 60));
    const points = durationMinutes >= 45 ? 15 : durationMinutes >= 25 ? 10 : 5;
    
    setPointsGained(points);
    setIsCompletedState(true);
    sound.playSessionDone();

    onSessionComplete({
      date: dateStr,
      type: sessionType,
      title: sessionTitle || 'Deep Focus Session',
      durationMinutes,
      completed: true,
      pointsAwarded: points,
    });
  };

  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const sessionTypesList: { id: SessionType; label: string; icon: React.ReactNode }[] = [
    { id: 'deep_work', label: 'DEEP WORK', icon: <Brain className="w-3.5 h-3.5" /> },
    { id: 'coding', label: 'CODING', icon: <Code className="w-3.5 h-3.5" /> },
    { id: 'studying', label: 'STUDYING', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'gym', label: 'GYM', icon: <Dumbbell className="w-3.5 h-3.5" /> },
    { id: 'meditation', label: 'MEDITATION', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'reading', label: 'READING', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200 ${isFullscreen ? 'p-0' : ''}`}>
      <div
        className={`w-full bg-[#0B0B0E] border border-[#232328] rounded-3xl p-6 shadow-2xl text-[#F4F4F6] flex flex-col justify-between transition-all ${
          isFullscreen ? 'h-full max-w-none rounded-none border-none justify-center' : 'max-w-md max-h-[92vh] overflow-y-auto'
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E1E24]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-ping" />
            <span className="text-[11px] font-mono tracking-widest text-[#D4FF00] uppercase font-bold">
              LOCK-IN MODE
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              aria-label="Vollbild umschalten"
              className="w-8 h-8 rounded-full bg-[#18181D] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              aria-label="Schließen"
              className="w-8 h-8 rounded-full bg-[#18181D] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Completed State View */}
        {isCompletedState ? (
          <div className="py-12 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#D4FF00]/15 border-2 border-[#D4FF00] flex items-center justify-center text-[#D4FF00] animate-in zoom-in-75 duration-300">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-mono tracking-widest text-[#8E8E93] uppercase">
                BEWEIS ERBRACHT
              </span>
              <h3 className="text-2xl font-black tracking-tight text-[#F4F4F6] mt-1 font-mono">
                SESSION COMPLETE
              </h3>
              <p className="text-sm text-[#D4FF00] font-mono font-bold mt-1">
                + {pointsGained} LOCK-IN POINTS
              </p>
            </div>

            <p className="text-xs text-[#8E8E93] max-w-xs">
              {Math.max(1, Math.round(elapsedTotalSeconds / 60))} Minuten konzentrierte Arbeit wurden in deinem Tagebuch und Score gespeichert.
            </p>

            <button
              onClick={onClose}
              className="w-full mt-4 py-3 bg-[#D4FF00] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all hover:bg-[#BEE500]"
            >
              ZURÜCK ZUM DASHBOARD
            </button>
          </div>
        ) : (
          <>
            {/* Session Type Selectors */}
            {!isRunning && (
              <div className="my-4">
                <span className="text-[10px] font-mono tracking-wider text-[#71717A] uppercase block mb-2">
                  SESSION TYP
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {sessionTypesList.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setSessionType(type.id);
                        setSessionTitle(`${type.label} Focus`);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                        sessionType === type.id
                          ? 'bg-[#D4FF00] text-black shadow-md'
                          : 'bg-[#15151A] text-[#8E8E93] hover:text-white hover:bg-[#1E1E24]'
                      }`}
                    >
                      {type.icon}
                      <span className="truncate">{type.label}</span>
                    </button>
                  ))}
                </div>

                {/* Duration Presets for Countdown */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-[#15151A] p-1 rounded-xl">
                    <button
                      onClick={() => setMode('countdown')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-mono font-semibold transition-colors ${
                        mode === 'countdown' ? 'bg-[#262630] text-[#F4F4F6]' : 'text-[#71717A]'
                      }`}
                    >
                      TIMER
                    </button>
                    <button
                      onClick={() => {
                        setMode('stopwatch');
                        setSeconds(0);
                      }}
                      className={`px-3 py-1 rounded-lg text-[10px] font-mono font-semibold transition-colors ${
                        mode === 'stopwatch' ? 'bg-[#262630] text-[#F4F4F6]' : 'text-[#71717A]'
                      }`}
                    >
                      STOPPUHR
                    </button>
                  </div>

                  {mode === 'countdown' && (
                    <div className="flex items-center gap-1">
                      {[25, 45, 60, 90].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => setTargetMinutes(mins)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                            targetMinutes === mins
                              ? 'bg-[#D4FF00]/20 text-[#D4FF00] font-bold border border-[#D4FF00]/40'
                              : 'bg-[#15151A] text-[#71717A] hover:text-white'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Central Clock Display */}
            <div className="my-8 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-mono font-semibold tracking-widest text-[#71717A] uppercase">
                {sessionType.replace('_', ' ')}
              </span>

              <div className="relative my-4 flex items-center justify-center">
                {/* Visual pulsating halo when active */}
                {isRunning && (
                  <div className="absolute w-56 h-56 rounded-full bg-[#D4FF00]/10 blur-2xl animate-pulse pointer-events-none" />
                )}

                <div className="text-6xl sm:text-7xl font-extrabold font-mono tracking-tighter text-[#F4F4F6] tabular-nums select-none">
                  {formatTime(seconds)}
                </div>
              </div>

              {isRunning ? (
                <span className="text-[11px] font-mono text-[#D4FF00] uppercase tracking-wider">
                  FOKUS HALTEN · KEINE ABLENKUNG
                </span>
              ) : (
                <span className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider">
                  BEREIT ZUM START
                </span>
              )}
            </div>

            {/* Timer Action Controls */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleTimer}
                  className={`flex-1 py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg ${
                    isRunning
                      ? 'bg-[#1F1F26] text-[#F4F4F6] border border-[#2D2D38] hover:bg-[#282833]'
                      : 'bg-[#D4FF00] text-black shadow-[#D4FF00]/15 hover:bg-[#BEE500]'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" />
                      <span>PAUSIEREN</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>STARTEN</span>
                    </>
                  )}
                </button>

                {elapsedTotalSeconds > 10 && (
                  <button
                    onClick={() => handleFinishSession(false)}
                    className="py-4 px-5 rounded-2xl bg-[#162B1D] border border-[#22C55E]/40 text-[#22E58B] hover:bg-[#1C3A25] font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>ABSCHLIESSEN</span>
                  </button>
                )}

                {!isRunning && elapsedTotalSeconds > 0 && (
                  <button
                    onClick={handleReset}
                    title="Zurücksetzen"
                    className="w-12 h-12 rounded-2xl bg-[#18181D] hover:bg-[#202027] text-[#8E8E93] hover:text-white flex items-center justify-center transition-colors shrink-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
