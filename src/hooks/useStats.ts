import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'braintrainer_stats';
export const ROUNDS = 10;

export interface GameStats {
  totalGames: number;
  totalCorrect: number;
  streak: number;
  lastPlayedDate: string | null;
  modules: Record<string, { games: number; correct: number }>;
  history: Array<{ game: string; correct: number; total: number; date: string }>;
}

function initStats(): GameStats {
  return { totalGames: 0, totalCorrect: 0, streak: 0, lastPlayedDate: null, modules: {}, history: [] };
}

export async function loadStats(): Promise<GameStats> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initStats();
  } catch { return initStats(); }
}

export async function saveStats(st: GameStats): Promise<void> {
  try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(st)); } catch {}
}

export async function recordGameResult(game: string, correct: number, total: number): Promise<GameStats> {
  const st = await loadStats();
  st.totalGames++;
  st.totalCorrect += correct;
  const today = new Date().toDateString();
  if (st.lastPlayedDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    st.streak = st.lastPlayedDate === yesterday ? (st.streak || 0) + 1 : 1;
    st.lastPlayedDate = today;
  }
  if (!st.modules[game]) st.modules[game] = { games: 0, correct: 0 };
  st.modules[game].games++;
  st.modules[game].correct += correct;
  st.history.unshift({ game, correct, total, date: new Date().toLocaleDateString('he-IL') });
  if (st.history.length > 20) st.history.pop();
  await saveStats(st);
  return st;
}

export async function clearStats(): Promise<void> {
  await saveStats(initStats());
}
