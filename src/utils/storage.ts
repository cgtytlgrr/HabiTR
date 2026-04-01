import type { AppState, User, GorevProgress, SessionLocks, WeeklyCompletion, Rozet, ScreenName } from '../types';
import { BASLANGIC_ELMASI, AY_ISIMLERI } from '../data/config';

const KEYS = {
  USER: 'habitr_user',
  LOGGED_IN: 'habitr_logged_in',
  DARK: 'habitr_dark',
  PROGRESS: 'habitr_progress',
  LOCKS: 'habitr_locks',
  WEEKLY: 'habitr_weekly',
  ROZETLER: 'habitr_rozetler',
  SCREEN: 'habitr_screen',
};

export function hashPassword(pw: string): string {
  return btoa(pw);
}

export function saveUser(user: User): void {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export function loadUser(): User | null {
  const raw = localStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export function isLoggedIn(): boolean {
  return localStorage.getItem(KEYS.LOGGED_IN) === 'true';
}

export function setLoggedIn(val: boolean): void {
  localStorage.setItem(KEYS.LOGGED_IN, val ? 'true' : 'false');
}

export function loadDark(): boolean {
  return localStorage.getItem(KEYS.DARK) === 'true';
}

export function saveDark(val: boolean): void {
  localStorage.setItem(KEYS.DARK, val ? 'true' : 'false');
}

export function loadProgress(): GorevProgress {
  const raw = localStorage.getItem(KEYS.PROGRESS);
  return raw ? JSON.parse(raw) : {};
}

export function saveProgress(p: GorevProgress): void {
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(p));
}

export function loadLocks(): SessionLocks {
  const raw = localStorage.getItem(KEYS.LOCKS);
  return raw ? JSON.parse(raw) : {};
}

export function saveLocks(l: SessionLocks): void {
  localStorage.setItem(KEYS.LOCKS, JSON.stringify(l));
}

export function loadWeekly(): WeeklyCompletion[] {
  const raw = localStorage.getItem(KEYS.WEEKLY);
  return raw ? JSON.parse(raw) : [];
}

export function saveWeekly(w: WeeklyCompletion[]): void {
  localStorage.setItem(KEYS.WEEKLY, JSON.stringify(w));
}

export function loadRozetler(): Rozet[] {
  const raw = localStorage.getItem(KEYS.ROZETLER);
  if (raw) return JSON.parse(raw);
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: AY_ISIMLERI[i],
    // Program Nisan 2026'dan başlıyor, Ocak/Şubat/Mart kazanılmış gösterme
    earned: false,
    earnedAt: undefined,
  }));
}

export function saveRozetler(r: Rozet[]): void {
  localStorage.setItem(KEYS.ROZETLER, JSON.stringify(r));
}

export function loadScreen(): ScreenName {
  return (localStorage.getItem(KEYS.SCREEN) as ScreenName) || 'home';
}

export function saveScreen(s: ScreenName): void {
  localStorage.setItem(KEYS.SCREEN, s);
}

export function register(username: string, password: string): User {
  const today = new Date().toISOString().slice(0, 10);
  const user: User = {
    username,
    passwordHash: hashPassword(password),
    rememberMe: false,
    elmas: BASLANGIC_ELMASI,
    streak: 0,
    lastActiveDate: today,
    lastScreen: 'home',
  };
  saveUser(user);
  return user;
}

export function loadAppState(): Partial<AppState> {
  return {
    user: loadUser(),
    isLoggedIn: isLoggedIn(),
    isDark: loadDark(),
    currentScreen: loadScreen(),
    gorevProgress: loadProgress(),
    sessionLocks: loadLocks(),
    weeklyCompletions: loadWeekly(),
  };
}
