import type { GorevProgress, WeeklyCompletion, Rozet, User } from '../types';
import type { DersId } from '../types';
import { DERSLER, ELMAS_ODULLERI, ELMAS_CEZASI, ROZET_MIN_GOREV } from '../data/config';
import hedeflerData from '../data/hedefler.json';
import { today } from './dates';

type HedeflerEntry = {
  weekNum: number;
  sessions: Array<{ tasks: Array<{ id: string }> }>;
};

// ─── Progress Key Helpers ──────────────────────────────────────────────────────
export function gorevKey(dersId: DersId, weekNum: number, sessionIdx: number, taskId: string): string {
  return `${dersId}_w${weekNum}_s${sessionIdx}_t${taskId}`;
}

export function sessionKey(dersId: DersId, weekNum: number, sessionIdx: number): string {
  return `${dersId}_w${weekNum}_s${sessionIdx}`;
}

// ─── Session Completion ───────────────────────────────────────────────────────
export function isSessionComplete(
  dersId: DersId,
  weekNum: number,
  sessionIdx: number,
  progress: GorevProgress
): boolean {
  const data = (hedeflerData as Record<string, HedeflerEntry[]>)[dersId];
  const week = data?.find(w => w.weekNum === weekNum);
  if (!week) return false;
  const session = week.sessions[sessionIdx];
  if (!session) return false;
  return session.tasks.every(t => progress[gorevKey(dersId, weekNum, sessionIdx, t.id)] === true);
}

// ─── Week Completion ──────────────────────────────────────────────────────────
export function isDersWeekComplete(
  dersId: DersId,
  weekNum: number,
  progress: GorevProgress
): boolean {
  return [0, 1, 2].every(si => isSessionComplete(dersId, weekNum, si, progress));
}

export function getCompletedDersCount(weekNum: number, progress: GorevProgress): number {
  return DERSLER.filter(d => isDersWeekComplete(d.id, weekNum, progress)).length;
}

// ─── Elmas Calculation ────────────────────────────────────────────────────────
export function calculateWeekElmas(completedDers: number): number {
  const reward = ELMAS_ODULLERI[completedDers] ?? 0;
  if (completedDers === 6) return reward;
  return reward + ELMAS_CEZASI;
}

// ─── Streak ───────────────────────────────────────────────────────────────────
export function updateStreak(user: User, hasActivityToday: boolean): User {
  const todayStr = today();
  if (user.lastActiveDate?.slice(0, 10) === todayStr) return user;

  const daysDiff = daysBetweenDates(user.lastActiveDate, todayStr);
  let newStreak = user.streak;

  if (daysDiff <= 1 && hasActivityToday) {
    newStreak = user.streak + 1;
  } else if (daysDiff > 1) {
    newStreak = hasActivityToday ? 1 : 0;
  }

  return { ...user, streak: newStreak, lastActiveDate: todayStr };
}

function daysBetweenDates(a: string, b: string): number {
  const da = new Date(a || '2025-01-01');
  const db = new Date(b);
  return Math.floor(Math.abs(db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Total Tasks Done ─────────────────────────────────────────────────────────
export function getTotalTasksDone(progress: GorevProgress): number {
  return Object.values(progress).filter(Boolean).length;
}

// ─── Completed Weeks Count ────────────────────────────────────────────────────
export function getCompletedWeeksCount(weekly: WeeklyCompletion[]): number {
  return weekly.filter(w => w.completedDers === 6).length;
}

// ─── Rozet Check ──────────────────────────────────────────────────────────────
export function checkAndAwardRozet(
  rozetler: Rozet[],
  _progress: GorevProgress,
  weekly: WeeklyCompletion[]
): Rozet[] {
  const now = new Date();
  const month = now.getMonth() + 1;

  // Count sessions done this month based on weekly completions
  const monthWeeks = weekly.filter(w => {
    const d = new Date(w.date);
    return d.getMonth() + 1 === month;
  });

  // Approximate: each completed ders = 9 tasks (3 sessions × 3 tasks avg)
  const approxTasksDone = monthWeeks.reduce((sum, w) => sum + w.completedDers * 9, 0);

  const updated = rozetler.map(r => {
    if (r.month === month && !r.earned && approxTasksDone >= ROZET_MIN_GOREV) {
      return { ...r, earned: true, earnedAt: today() };
    }
    return r;
  });

  return updated;
}
