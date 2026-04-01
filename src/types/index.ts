// ─── Ders (Course) ────────────────────────────────────────────────────────────
export type DersId = 'spor' | 'egitim' | 'arac' | 'is' | 'duolingo' | 'yuruyus';

export interface DersInfo {
  id: DersId;
  name: string;
  character: string; // asset filename
  color: string;
  abbrev: string; // for day buttons
}

// ─── Görev (Task) ─────────────────────────────────────────────────────────────
export interface GorevItem {
  id: string;
  label: string;
}

export interface Session {
  tasks: GorevItem[];
}

export interface HaftaData {
  weekNum: number;
  dateRange: string;
  sessions: Session[]; // 3 sessions per week
}

// ─── Progress ─────────────────────────────────────────────────────────────────
// key: `${dersId}_w${weekNum}_s${sessionIndex}_t${taskId}`
export interface GorevProgress {
  [key: string]: boolean;
}

// key: `${dersId}_w${weekNum}_s${sessionIndex}` = true when all tasks done + locked
export interface SessionLocks {
  [key: string]: boolean;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  username: string;
  passwordHash: string;
  rememberMe: boolean;
  elmas: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  lastScreen: ScreenName;
}

// ─── App State ────────────────────────────────────────────────────────────────
export type ScreenName = 'home' | 'hedefler' | 'rozetler' | 'istatistik';

export interface AppState {
  user: User | null;
  isLoggedIn: boolean;
  currentScreen: ScreenName;
  isDark: boolean;
  gorevProgress: GorevProgress;
  sessionLocks: SessionLocks;
  weeklyCompletions: WeeklyCompletion[]; // history
}

// ─── Weekly Completion ─────────────────────────────────────────────────────────
export interface WeeklyCompletion {
  weekNum: number;
  completedDers: number; // out of 6
  elmasChange: number;
  date: string;
}

// ─── Rozet ────────────────────────────────────────────────────────────────────
export interface Rozet {
  month: number; // 1-12
  monthName: string;
  earned: boolean;
  earnedAt?: string;
}
