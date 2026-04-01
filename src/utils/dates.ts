import { PROGRAM_START } from '../data/config';

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function todayDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get current week number (1-39) based on program start date.
 * Week 1 = 06-12 Nisan 2025
 */
export function getCurrentWeekNum(): number {
  const now = todayDate();
  const start = new Date(PROGRAM_START);
  start.setHours(0, 0, 0, 0);
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weekNum = Math.floor(diffDays / 7) + 1;
  return Math.max(1, Math.min(39, weekNum));
}

/**
 * Get day of week index 0=Mon ... 6=Sun (Turkish week: Mon first)
 */
export function getDayOfWeek(): number {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1; // convert to Mon=0
}

/**
 * Determine which session index (0, 1, 2) to show today.
 * Sessions are on Mon, Wed, Fri (0, 2, 4) by default.
 * Actually: any 3 days from the week. We use day-of-week to pick session.
 */
export function getSessionForToday(): number | null {
  const dow = getDayOfWeek(); // 0=Mon, 1=Tue, ...
  // Sessions scheduled on Mon(0), Wed(2), Fri(4)
  const sessionDays = [0, 2, 4];
  const idx = sessionDays.indexOf(dow);
  return idx >= 0 ? idx : null;
}

/**
 * Get all 3 session days for display
 */
export function getSessionDays(): number[] {
  return [0, 2, 4]; // Mon, Wed, Fri
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

export function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.floor(Math.abs(da.getTime() - db.getTime()) / (1000 * 60 * 60 * 24));
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1; // 1-12
}

export function getTurkishDayName(): string {
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  return days[getDayOfWeek()];
}

export function getWeekDayLabels(): { label: string; isToday: boolean; isSession: boolean }[] {
  const labels = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];
  const todayDow = getDayOfWeek();
  const sessionDays = getSessionDays();
  return labels.map((label, i) => ({
    label,
    isToday: i === todayDow,
    isSession: sessionDays.includes(i),
  }));
}
