import React from 'react';
import {
  Dumbbell,
  BookOpen,
  Brain,
  Flame,
  Footprints,
  Shield,
  Zap,
  Droplets,
  Moon,
  Target,
  Code,
  Sparkles,
  CheckCircle2,
  Clock,
  Heart,
  TrendingUp,
  Award,
} from 'lucide-react';

interface HabitIconProps {
  name: string;
  className?: string;
}

export const HabitIcon: React.FC<HabitIconProps> = ({ name, className = 'w-4 h-4' }) => {
  const iconMap: Record<string, React.ReactElement> = {
    dumbbell: <Dumbbell className={className} />,
    'book-open': <BookOpen className={className} />,
    brain: <Brain className={className} />,
    flame: <Flame className={className} />,
    footprints: <Footprints className={className} />,
    shield: <Shield className={className} />,
    zap: <Zap className={className} />,
    droplets: <Droplets className={className} />,
    moon: <Moon className={className} />,
    target: <Target className={className} />,
    code: <Code className={className} />,
    clock: <Clock className={className} />,
    heart: <Heart className={className} />,
    trending: <TrendingUp className={className} />,
    award: <Award className={className} />,
    sparkles: <Sparkles className={className} />,
  };

  return iconMap[name] || <CheckCircle2 className={className} />;
};
