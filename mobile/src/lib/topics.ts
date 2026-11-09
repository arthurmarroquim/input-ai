import { useCallback, useEffect, useState } from "react";
import { getTopics, putTopic, TopicStatus } from "./api";

// Status de cada assunto, salvo na conta do aluno no servidor (vale em qualquer aparelho).
type State = { status: Record<string, TopicStatus>; loading: boolean; error: string | null };

let state: State = { status: {}, loading: true, error: null };
let fetched = false;
const listeners = new Set<(s: State) => void>();
const emit = (s: Partial<State>) => {
  state = { ...state, ...s };
  listeners.forEach((l) => l(state));
};

async function load() {
  emit({ loading: true, error: null });
  try {
    const { status } = await getTopics();
    fetched = true;
    emit({ status, loading: false });
  } catch (e) {
    emit({ loading: false, error: (e as Error).message });
  }
}

/** Limpa o cache (ao sair da conta). */
export function resetTopics() {
  fetched = false;
  state = { status: {}, loading: true, error: null };
  listeners.forEach((l) => l(state));
}

export function useTopics() {
  const [s, setS] = useState(state);

  useEffect(() => {
    listeners.add(setS);
    if (!fetched) load();
    return () => {
      listeners.delete(setS);
    };
  }, []);

  // Atualiza na hora (otimista) e desfaz se o servidor recusar.
  const setStatus = useCallback(async (id: string, value: TopicStatus) => {
    const before = state.status[id] ?? 0;
    const next = { ...state.status };
    if (value === 0) delete next[id];
    else next[id] = value;
    emit({ status: next, error: null });
    try {
      await putTopic(id, value);
    } catch (e) {
      const back = { ...state.status };
      if (before === 0) delete back[id];
      else back[id] = before;
      emit({ status: back, error: (e as Error).message });
    }
  }, []);

  return { ...s, setStatus, reload: load };
}

/** Resumo de uma lista de assuntos. */
export function resumo(ids: string[], status: Record<string, TopicStatus>) {
  let dominados = 0;
  let estudando = 0;
  for (const id of ids) {
    if (status[id] === 2) dominados++;
    else if (status[id] === 1) estudando++;
  }
  const total = ids.length;
  return {
    total,
    dominados,
    estudando,
    aEstudar: total - dominados - estudando,
    // Dominado vale 1, estudando vale meio ponto.
    pct: total ? Math.round(((dominados + estudando * 0.5) / total) * 100) : 0,
  };
}
