/**
 * Date & Time utility functions strictly respecting local timezone.
 * Avoids UTC drift by relying on local calendar values.
 */

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateToLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDisplayDate(dateString: string): {
  dayName: string;
  dayNumber: string;
  monthShort: string;
  fullDate: string;
  isToday: boolean;
  isYesterday: boolean;
} {
  const today = getTodayDateString();
  const date = parseLocalDate(dateString);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateToLocal(yesterday);

  const months = ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'];
  const daysShort = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];

  const dayName = daysShort[date.getDay()];
  const dayNumber = String(date.getDate()).padStart(2, '0');
  const monthShort = months[date.getMonth()];
  const fullDate = `${dayName}, ${date.getDate()}. ${monthShort}`;

  return {
    dayName,
    dayNumber,
    monthShort,
    fullDate,
    isToday: dateString === today,
    isYesterday: dateString === yesterdayStr,
  };
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'GUTEN MORGEN';
  if (hour >= 12 && hour < 18) return 'GUTEN TAG';
  if (hour >= 18 && hour < 22) return 'GUTEN ABEND';
  return 'LOCK IN';
}

export function getPastDates(count: number, endDateStr?: string): string[] {
  const baseDate = endDateStr ? parseLocalDate(endDateStr) : new Date();
  const dates: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    dates.push(formatDateToLocal(d));
  }
  return dates;
}

export function getDaysInMonth(year: number, monthZeroIndexed: number): string[] {
  const dates: string[] = [];
  const date = new Date(year, monthZeroIndexed, 1);
  while (date.getMonth() === monthZeroIndexed) {
    dates.push(formatDateToLocal(date));
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

export function getWeekStartAndEnd(dateString: string): { start: string; end: string; days: string[] } {
  const date = parseLocalDate(dateString);
  const day = date.getDay(); // 0=Sun, 1=Mon...
  // In Europe/ISO, week starts on Monday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(formatDateToLocal(d));
  }
  
  return {
    start: days[0],
    end: days[6],
    days,
  };
}

export function isHabitScheduledForDate(
  frequency: 'daily' | 'weekly' | 'weekdays' | 'custom',
  customDays: number[] | undefined,
  dateString: string,
  weeklyTarget?: number,
  logPlannedState?: boolean,
  logCompleted?: boolean
): boolean {
  // If explicitly declared in log:
  if (logPlannedState !== undefined) {
    return logPlannedState;
  }
  // If user completed it on this day, it's counted as planned/active
  if (logCompleted) {
    return true;
  }

  if (frequency === 'daily') return true;

  const date = parseLocalDate(dateString);
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon ...

  if (frequency === 'weekdays') {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  if (frequency === 'custom' && customDays && customDays.length > 0) {
    return customDays.includes(dayOfWeek);
  }

  if (frequency === 'weekly') {
    if (customDays && customDays.length > 0) {
      return customDays.includes(dayOfWeek);
    }
    // Default weekly split distribution based on target
    const target = weeklyTarget || 3;
    if (target >= 5) {
      return dayOfWeek >= 1 && dayOfWeek <= target; // Mo-Fr
    } else if (target === 4) {
      return [1, 2, 4, 6].includes(dayOfWeek); // Mo, Di, Do, Sa
    } else if (target === 3) {
      return [1, 3, 5].includes(dayOfWeek); // Mo, Mi, Fr (e.g. Golf / Gym)
    } else if (target === 2) {
      return [3, 0].includes(dayOfWeek); // Mi, So (e.g. Sauna / Regeneration)
    } else {
      return [6].includes(dayOfWeek); // Saturday
    }
  }

  return true;
}
