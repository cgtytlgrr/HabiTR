import { createContext, useContext, useReducer, useCallback, type ReactNode, useEffect } from 'react';
import type { ScreenName, User, GorevProgress, SessionLocks, WeeklyCompletion, Rozet } from '../types';
import type { DersId } from '../types';
import {
  loadAppState, saveUser, setLoggedIn, saveDark, saveProgress,
  saveLocks, saveWeekly, saveRozetler, saveScreen, loadRozetler, register as registerUser, hashPassword
} from '../utils/storage';
import { gorevKey, sessionKey, isSessionComplete, getCompletedDersCount, calculateWeekElmas, checkAndAwardRozet } from '../utils/gameLogic';
import { getCurrentWeekNum, today } from '../utils/dates';
import hedeflerData from '../data/hedefler.json';

type HedeflerEntry = {
  weekNum: number;
  sessions: Array<{ tasks: Array<{ id: string }> }>;
};

// ─── State ───────────────────────────────────────────────────────────────────
interface State {
  user: User | null;
  isLoggedIn: boolean;
  currentScreen: ScreenName;
  isDark: boolean;
  gorevProgress: GorevProgress;
  sessionLocks: SessionLocks;
  weeklyCompletions: WeeklyCompletion[];
  rozetler: Rozet[];
  selectedDers: DersId | null;
}

// ─── Actions ─────────────────────────────────────────────────────────────────
type Action =
  | { type: 'LOGIN'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_SCREEN'; screen: ScreenName }
  | { type: 'TOGGLE_DARK' }
  | { type: 'TOGGLE_TASK'; dersId: DersId; weekNum: number; sessionIdx: number; taskId: string }
  | { type: 'UNLOCK_SESSION'; dersId: DersId; weekNum: number; sessionIdx: number }
  | { type: 'SET_DERS'; dersId: DersId | null }
  | { type: 'LOAD_STATE'; state: Partial<State> };

// ─── Reducer ─────────────────────────────────────────────────────────────────
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.user, isLoggedIn: true };
    case 'LOGOUT':
      return { ...state, isLoggedIn: false, user: null };
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.screen };
    case 'TOGGLE_DARK':
      return { ...state, isDark: !state.isDark };
    case 'SET_DERS':
      return { ...state, selectedDers: action.dersId };
    case 'LOAD_STATE':
      return { ...state, ...action.state };

    case 'UNLOCK_SESSION': {
      const { dersId, weekNum, sessionIdx } = action;
      const lockKey = sessionKey(dersId, weekNum, sessionIdx);
      const newLocks: SessionLocks = { ...state.sessionLocks };
      delete newLocks[lockKey];
      // Ayrıca o oturumun tüm görevlerini sıfırla
      const newProgress: GorevProgress = { ...state.gorevProgress };
      const data = (hedeflerData as Record<string, HedeflerEntry[]>)[dersId];
      const week = data?.find(w => w.weekNum === weekNum);
      if (week?.sessions[sessionIdx]) {
        for (const t of week.sessions[sessionIdx].tasks) {
          delete newProgress[gorevKey(dersId, weekNum, sessionIdx, t.id)];
        }
      }
      return { ...state, sessionLocks: newLocks, gorevProgress: newProgress };
    }

    case 'TOGGLE_TASK': {
      const { dersId, weekNum, sessionIdx, taskId } = action;
      const key = gorevKey(dersId, weekNum, sessionIdx, taskId);
      const lockKey = sessionKey(dersId, weekNum, sessionIdx);

      if (state.sessionLocks[lockKey]) return state;

      const newProgress: GorevProgress = { ...state.gorevProgress };
      newProgress[key] = !newProgress[key];

      const data = (hedeflerData as Record<string, HedeflerEntry[]>)[dersId];
      const week = data?.find(w => w.weekNum === weekNum);
      const session = week?.sessions[sessionIdx];
      const newLocks: SessionLocks = { ...state.sessionLocks };

      let newUser = state.user;
      let newWeekly = state.weeklyCompletions;
      let newRozetler = state.rozetler;

      // Lock session if all tasks complete
      if (session && session.tasks.every(t => newProgress[gorevKey(dersId, weekNum, sessionIdx, t.id)])) {
        newLocks[lockKey] = true;
        if (newUser) {
          newUser = { ...newUser, lastActiveDate: today() };
        }
      }

      // Check week completion
      if (newUser) {
        const completedDers = getCompletedDersCount(weekNum, newProgress);
        const alreadyRecorded = newWeekly.some(w => w.weekNum === weekNum);
        if (completedDers === 6 && !alreadyRecorded) {
          const elmasChange = calculateWeekElmas(6);
          const newTotal = Math.max(0, newUser.elmas + elmasChange);
          newUser = { ...newUser, elmas: newTotal };
          const completion: WeeklyCompletion = {
            weekNum, completedDers, elmasChange, date: today(),
          };
          newWeekly = [...newWeekly, completion];
          newRozetler = checkAndAwardRozet(newRozetler, newProgress, newWeekly);
        }
      }

      return {
        ...state,
        gorevProgress: newProgress,
        sessionLocks: newLocks,
        user: newUser,
        weeklyCompletions: newWeekly,
        rozetler: newRozetler,
      };
    }

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
interface AppContextType {
  state: State;
  login: (username: string, password: string, rememberMe: boolean) => boolean;
  register: (username: string, password: string) => void;
  logout: () => void;
  setScreen: (screen: ScreenName) => void;
  toggleDark: () => void;
  toggleTask: (dersId: DersId, weekNum: number, sessionIdx: number, taskId: string) => void;
  selectDers: (dersId: DersId | null) => void;
  unlockSession: (dersId: DersId, weekNum: number, sessionIdx: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const initialState: State = {
  user: null,
  isLoggedIn: false,
  currentScreen: 'home',
  isDark: false,
  gorevProgress: {},
  sessionLocks: {},
  weeklyCompletions: [],
  rozetler: [],
  selectedDers: null,
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const saved = loadAppState();
    const rozetler = loadRozetler();
    dispatch({ type: 'LOAD_STATE', state: { ...saved, rozetler } as Partial<State> });
  }, []);

  useEffect(() => { if (state.user) saveUser(state.user); }, [state.user]);
  useEffect(() => { setLoggedIn(state.isLoggedIn); }, [state.isLoggedIn]);
  useEffect(() => {
    saveDark(state.isDark);
    document.documentElement.classList.toggle('dark', state.isDark);
  }, [state.isDark]);
  useEffect(() => { saveProgress(state.gorevProgress); }, [state.gorevProgress]);
  useEffect(() => { saveLocks(state.sessionLocks); }, [state.sessionLocks]);
  useEffect(() => { saveWeekly(state.weeklyCompletions); }, [state.weeklyCompletions]);
  useEffect(() => { if (state.rozetler.length > 0) saveRozetler(state.rozetler); }, [state.rozetler]);
  useEffect(() => { saveScreen(state.currentScreen); }, [state.currentScreen]);

  const login = useCallback((username: string, password: string, rememberMe: boolean): boolean => {
    const savedState = loadAppState();
    const savedUser = savedState.user;
    if (!savedUser) {
      // First time - auto register
      const user = registerUser(username, password);
      user.rememberMe = rememberMe;
      dispatch({ type: 'LOGIN', user });
      return true;
    }
    if (savedUser.username === username && savedUser.passwordHash === hashPassword(password)) {
      dispatch({ type: 'LOGIN', user: { ...savedUser, rememberMe } });
      return true;
    }
    return false;
  }, []);

  const register = useCallback((username: string, password: string) => {
    const user = registerUser(username, password);
    dispatch({ type: 'LOGIN', user });
  }, []);

  const logout = useCallback(() => {
    setLoggedIn(false);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const setScreen = useCallback((screen: ScreenName) => {
    dispatch({ type: 'SET_SCREEN', screen });
  }, []);

  const toggleDark = useCallback(() => {
    dispatch({ type: 'TOGGLE_DARK' });
  }, []);

  const toggleTask = useCallback((dersId: DersId, weekNum: number, sessionIdx: number, taskId: string) => {
    dispatch({ type: 'TOGGLE_TASK', dersId, weekNum, sessionIdx, taskId });
  }, []);

  const selectDers = useCallback((dersId: DersId | null) => {
    dispatch({ type: 'SET_DERS', dersId });
  }, []);

  const unlockSession = useCallback((dersId: DersId, weekNum: number, sessionIdx: number) => {
    dispatch({ type: 'UNLOCK_SESSION', dersId, weekNum, sessionIdx });
  }, []);

  return (
    <AppContext.Provider value={{ state, login, register, logout, setScreen, toggleDark, toggleTask, selectDers, unlockSession }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
