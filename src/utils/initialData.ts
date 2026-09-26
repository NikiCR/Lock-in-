import {
  Habit,
  HabitLog,
  DailyCheckIn,
  JournalEntry,
  LockInSession,
  UserProfile,
  DailyScheduleItem,
  LifeMilestone,
} from '../types';
import { getTodayDateString, getPastDates, getWeekStartAndEnd } from './dateUtils';

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-gym',
    name: 'GYM / KRAFTTRAINING',
    category: 'body',
    icon: 'dumbbell',
    type: 'boolean',
    target: 1,
    unit: '',
    frequency: 'weekly',
    weeklyTarget: 4, // 4x per week
    priority: 'MUST',
    color: '#D4FF00', // Volt
    archived: false,
    createdAt: '2026-08-15',
  },
  {
    id: 'habit-golf',
    name: 'GOLF LEISTUNGSTRAINING',
    category: 'golf',
    icon: 'target',
    type: 'boolean',
    target: 1,
    unit: 'Session',
    frequency: 'weekly',
    weeklyTarget: 3, // 3x per week (Range, Kurzspiel, Platz)
    priority: 'MUST',
    color: '#22E58B', // Emerald
    archived: false,
    createdAt: '2026-08-15',
  },
  {
    id: 'habit-school',
    name: 'SCHULE & ABITUR LERNEN',
    category: 'school',
    icon: 'brain',
    type: 'time',
    target: 90,
    unit: 'Min',
    frequency: 'weekly',
    weeklyTarget: 5, // 5x per week
    priority: 'MUST',
    color: '#38BDF8', // Cyan
    archived: false,
    createdAt: '2026-08-15',
  },
  {
    id: 'habit-sauna',
    name: 'SAUNA & REGENERATION',
    category: 'body',
    icon: 'flame',
    type: 'boolean',
    target: 1,
    unit: '',
    frequency: 'weekly',
    weeklyTarget: 2, // 2x per week
    priority: 'SHOULD',
    color: '#F59E0B', // Amber
    archived: false,
    createdAt: '2026-08-15',
  },
  {
    id: 'habit-reading',
    name: 'READING & WISSEN (20M)',
    category: 'mind',
    icon: 'book-open',
    type: 'numeric',
    target: 20,
    unit: 'Min',
    frequency: 'daily',
    priority: 'SHOULD',
    color: '#A855F7',
    archived: false,
    createdAt: '2026-08-15',
  },
  {
    id: 'habit-steps',
    name: '10.000 SCHRITTE & BEWEGUNG',
    category: 'body',
    icon: 'footprints',
    type: 'numeric',
    target: 10000,
    unit: 'Steps',
    frequency: 'daily',
    priority: 'SHOULD',
    color: '#38BDF8',
    archived: false,
    createdAt: '2026-08-15',
  },
  {
    id: 'habit-meditation',
    name: 'MENTALE STÄRKE & FOKUS',
    category: 'mind',
    icon: 'sparkles',
    type: 'time',
    target: 10,
    unit: 'Min',
    frequency: 'daily',
    priority: 'OPTIONAL',
    color: '#38BDF8',
    archived: false,
    createdAt: '2026-08-15',
  },
  {
    id: 'habit-nojunk',
    name: 'KEIN JUNK FOOD & ZUCKER',
    category: 'discipline',
    icon: 'shield',
    type: 'boolean',
    target: 1,
    unit: '',
    frequency: 'daily',
    priority: 'SHOULD',
    color: '#D4FF00',
    archived: false,
    createdAt: '2026-08-15',
  },
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Niklas',
  tagline: 'Jeden Tag ein Stück besser werden. Build proof.',
  bio: '17 Jahre · 12. Klasse Abitur · Golf Leistungssport · Gym & Regeneration',
  age: 17,
  schoolGrade: '12. Klasse (Abitur)',
  targetScore: 82,
  onboardingCompleted: true,
  morningReminder: '07:00',
  eveningReminder: '21:30',
  notificationsEnabled: true,
  soundEnabled: true,
  hapticEnabled: true,
  accentColor: 'lime',
  enabledAreas: ['body', 'mind', 'school', 'golf', 'discipline', 'life'],
};

export const DEFAULT_SCHEDULE_ITEMS: DailyScheduleItem[] = [
  {
    id: 'sched-1',
    date: getTodayDateString(),
    time: '07:45',
    title: 'Schule / Abitur Unterricht',
    category: 'school',
    completed: true,
  },
  {
    id: 'sched-2',
    date: getTodayDateString(),
    time: '15:30',
    title: 'Golf Leistungstraining (Range & Kurzspiel)',
    category: 'golf',
    completed: true,
  },
  {
    id: 'sched-3',
    date: getTodayDateString(),
    time: '18:30',
    title: 'Gym / Krafttraining Push Session',
    category: 'body',
    completed: true,
  },
  {
    id: 'sched-4',
    date: getTodayDateString(),
    time: '20:30',
    title: 'Sauna & Kaltanwendung Regeneration',
    category: 'body',
    completed: false,
  },
  {
    id: 'sched-5',
    date: getTodayDateString(),
    time: '21:30',
    title: 'Daily Review, Win/Loss/Lesson & Journal',
    category: 'mind',
    completed: false,
  },
];

export const DEFAULT_MILESTONES: LifeMilestone[] = [
  {
    id: 'mile-1',
    date: '2026-08-15',
    title: 'Lock-In Life OS gestartet',
    category: 'discipline',
    description: 'Systematisches Tracking aller Lebensbereiche begonnen.',
    tag: 'SYSTEM',
  },
  {
    id: 'mile-2',
    date: '2026-08-30',
    title: 'Erster 14-Tage Konsistenz Streak',
    category: 'discipline',
    description: 'Zwei Wochen lückenlos mindestens 75 Punkte gehalten.',
    tag: 'STREAK',
  },
  {
    id: 'mile-3',
    date: '2026-09-12',
    title: 'Golf Ranglisten-Turnier PR',
    category: 'golf',
    description: 'Starke Runde unter Druck mit herausragendem Kurzspiel.',
    tag: 'GOLF',
  },
  {
    id: 'mile-4',
    date: '2026-09-19',
    title: 'Gym 4×/Woche Rhythmus gefestigt',
    category: 'body',
    description: '4 Wochen in Folge alle 4 Krafteinheiten absolviert.',
    tag: 'FITNESS',
  },
  {
    id: 'mile-5',
    date: '2026-09-24',
    title: 'Abitur Lernplan 12. Klasse gestartet',
    category: 'school',
    description: 'Feste tägliche 90-Minuten-Blöcke vor Prüfungen etabliert.',
    tag: 'ABI',
  },
];

export function generateSeedData(): {
  habits: Habit[];
  logs: HabitLog[];
  checkIns: DailyCheckIn[];
  journals: JournalEntry[];
  sessions: LockInSession[];
  profile: UserProfile;
  schedule: DailyScheduleItem[];
  milestones: LifeMilestone[];
} {
  const habits = DEFAULT_HABITS;
  const todayStr = getTodayDateString();
  const pastDates = getPastDates(28, todayStr); // 4 weeks of authentic history
  const weekInfo = getWeekStartAndEnd(todayStr);

  const logs: HabitLog[] = [];
  const checkIns: DailyCheckIn[] = [];
  const journals: JournalEntry[] = [];
  const sessions: LockInSession[] = [];

  const reflections = [
    {
      win: 'Golftraining war laser-fokussiert; Wedges auf 80m präzise.',
      loss: 'Etwas spät schlafen gegangen, Handy nicht pünktlich weggelegt.',
      lesson: 'Schlaf ist die Basis für das Golftraining am Folgetag.',
      tomorrow: 'Vor der Schule 10 Min Dehnen und 1L Wasser trinken.',
    },
    {
      win: 'Gym PR beim Kniebeugen geschafft; Abitur-Lernblock ohne Ablenkung.',
      loss: 'Mittagessen war zu schwer, 20 Min Lethargie.',
      lesson: 'Vor dem Golftraining nur leichte Kohlenhydrate + Hydration.',
      tomorrow: 'Nach der Schule direkt 15:30 Range nutzen.',
    },
    {
      win: 'Sauna + Kältebecken nach harter Woche; Körper fühlt sich frisch an.',
      loss: 'Schritte erst spätabends voll gemacht.',
      lesson: 'Schulpausen aktiv für Schritte nutzen.',
      tomorrow: 'Wochenziele am Sonntag sauber reflektieren.',
    },
    {
      win: 'Schulprüfung top vorbereitet geschrieben; volle mentale Klarheit.',
      loss: 'Keine nennenswerten Fehler.',
      lesson: 'Konsistenz im System schlägt späte Panik vor Klausuren.',
      tomorrow: 'Standard beibehalten und nicht nachlassen.',
    },
  ];

  pastDates.forEach((dateStr, idx) => {
    const isToday = dateStr === todayStr;
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon...
    const ref = reflections[idx % reflections.length];

    // CheckIn
    checkIns.push({
      id: `checkin-${dateStr}`,
      date: dateStr,
      energy: isToday ? 8 : Math.min(10, Math.floor(7 + (idx % 3))),
      mood: isToday ? 8 : Math.min(10, Math.floor(7 + ((idx + 1) % 3))),
      focus: isToday ? 9 : Math.min(10, Math.floor(8 + (idx % 3))),
      discipline: isToday ? 9 : Math.min(10, Math.floor(8 + ((idx + 2) % 3))),
      mainGoal: isToday ? 'Abitur Lernblock & Golftraining voll fokussiert durchziehen.' : 'Standard halten.',
      avoidToday: isToday ? 'Reaktives Scrollen zwischen Schule und Training.' : 'Ablenkungen.',
      completed: true,
      updatedAt: `${dateStr}T07:15:00Z`,
    });

    // Journal
    journals.push({
      id: `journal-${dateStr}`,
      date: dateStr,
      win: ref.win,
      loss: ref.loss,
      lesson: ref.lesson,
      tomorrow: ref.tomorrow,
      freeNote: isToday ? 'Sehr produktiver Tag zwischen Schule, Golf und Kraftraum.' : '',
      updatedAt: `${dateStr}T21:40:00Z`,
    });

    // Sessions (Gym or Golf or Study)
    if (dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6 || isToday) {
      sessions.push({
        id: `session-${dateStr}-gym`,
        date: dateStr,
        type: 'gym',
        title: 'Krafttraining Oberkörper / Push',
        durationMinutes: 65,
        completed: true,
        pointsAwarded: 15,
        createdAt: `${dateStr}T18:30:00Z`,
      });
    }

    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5 || isToday) {
      sessions.push({
        id: `session-${dateStr}-golf`,
        date: dateStr,
        type: 'golf',
        title: 'Golf Kurzspiel & Driving Range',
        durationMinutes: 75,
        completed: true,
        pointsAwarded: 15,
        createdAt: `${dateStr}T15:30:00Z`,
      });
    }

    // Habit Logs
    habits.forEach((habit) => {
      let completed = false;
      let val = 0;
      let planned = true;

      // Realistic weekly distribution for Niklas:
      if (habit.id === 'habit-gym') {
        // 4x / week (Mo, Di, Do, Sa)
        planned = [1, 2, 4, 6].includes(dayOfWeek);
        completed = planned || (isToday && true);
        val = completed ? 1 : 0;
      } else if (habit.id === 'habit-golf') {
        // 3x / week (Mo, Mi, Fr)
        planned = [1, 3, 5].includes(dayOfWeek);
        completed = planned || (isToday && true);
        val = completed ? 1 : 0;
      } else if (habit.id === 'habit-sauna') {
        // 2x / week (Mi, So)
        planned = [3, 0].includes(dayOfWeek);
        completed = planned && idx % 2 === 0;
        val = completed ? 1 : 0;
      } else if (habit.id === 'habit-school') {
        // 5x / week (Mo-Fr)
        planned = dayOfWeek >= 1 && dayOfWeek <= 5;
        completed = planned;
        val = completed ? 90 : 0;
      } else {
        // Daily habits
        planned = true;
        if (isToday) {
          if (habit.id === 'habit-reading') {
            completed = true;
            val = 20;
          } else if (habit.id === 'habit-nojunk') {
            completed = true;
            val = 1;
          } else if (habit.id === 'habit-steps') {
            completed = false; // in progress today
            val = 7800;
          } else if (habit.id === 'habit-meditation') {
            completed = true;
            val = 10;
          }
        } else {
          completed = Math.random() < 0.88;
          val = completed ? (habit.target || 1) : 0;
        }
      }

      logs.push({
        id: `log-${habit.id}-${dateStr}`,
        habitId: habit.id,
        date: dateStr,
        value: val,
        completed,
        planned,
        updatedAt: `${dateStr}T19:00:00Z`,
      });
    });
  });

  return {
    habits,
    logs,
    checkIns,
    journals,
    sessions,
    profile: DEFAULT_PROFILE,
    schedule: DEFAULT_SCHEDULE_ITEMS,
    milestones: DEFAULT_MILESTONES,
  };
}
