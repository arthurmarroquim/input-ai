import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

// Progresso de estudo salvo no aparelho.
export type Progress = {
  focusMinutes: number; // minutos de foco acumulados no Pomodoro
  sessions: number; // sessões de Pomodoro concluídas
  studyDays: string[]; // datas (AAAA-MM-DD) em que o aluno estudou
  learned: string[]; // ids das técnicas marcadas como aprendidas
};

const KEY = "estudeai:progress:v1";
const empty: Progress = { focusMinutes: 0, sessions: 0, studyDays: [], learned: [] };

export function today() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Quantos dias seguidos (até hoje ou ontem) o aluno estudou. */
export function streak(days: string[]) {
  const set = new Set(days);
  const d = new Date();
  const key = (x: Date) =>
    `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  if (!set.has(key(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(key(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

async function load(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(storageKey());
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
}

async function save(p: Progress) {
  try {
    await AsyncStorage.setItem(storageKey(), JSON.stringify(p));
  } catch {
    // sem armazenamento disponível: segue só em memória
  }
}

const listeners = new Set<(p: Progress) => void>();
let current: Progress = empty;
let loaded = false;
let owner: string | null = null;

// Cada usuário tem seu próprio progresso salvo no aparelho.
const storageKey = () => `${KEY}:${owner ?? "anon"}`;

export function setProgressOwner(userId: string | null) {
  if (userId === owner && loaded) return;
  owner = userId;
  current = empty;
  loaded = false;
  listeners.forEach((l) => l(current));
  load().then((p) => {
    if (owner !== userId) return;
    current = p;
    loaded = true;
    listeners.forEach((l) => l(current));
  });
}

async function update(fn: (p: Progress) => Progress) {
  if (!loaded) {
    current = await load();
    loaded = true;
  }
  current = fn(current);
  listeners.forEach((l) => l(current));
  await save(current);
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(current);

  useEffect(() => {
    listeners.add(setProgress);
    if (!loaded) {
      load().then((p) => {
        current = p;
        loaded = true;
        listeners.forEach((l) => l(current));
      });
    }
    return () => {
      listeners.delete(setProgress);
    };
  }, []);

  const addFocusSession = useCallback(
    (minutes: number) =>
      update((p) => ({
        ...p,
        focusMinutes: p.focusMinutes + minutes,
        sessions: p.sessions + 1,
        studyDays: p.studyDays.includes(today()) ? p.studyDays : [...p.studyDays, today()],
      })),
    [],
  );

  const toggleLearned = useCallback(
    (id: string) =>
      update((p) => ({
        ...p,
        learned: p.learned.includes(id) ? p.learned.filter((x) => x !== id) : [...p.learned, id],
        studyDays: p.studyDays.includes(today()) ? p.studyDays : [...p.studyDays, today()],
      })),
    [],
  );

  return { progress, addFocusSession, toggleLearned };
}
