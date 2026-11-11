import { useEffect, useState } from "react";
import { listCurados, searchVideos, Video, VideoCurado } from "./api";
import type { ExameFoco } from "./exameFoco";

/** Busca no YouTube (pelo servidor), já focada na prova escolhida. */
export function useVideos(query: string, tipo: "short" | "aula", exame?: ExameFoco) {
  const [items, setItems] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    searchVideos(query, tipo, exame)
      .then((v) => alive && setItems(v))
      .catch((e: Error) => {
        if (!alive) return;
        setItems([]);
        setError(e.message);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [query, tipo, exame, attempt]);

  return { items, loading, error, retry: () => setAttempt((n) => n + 1) };
}

/** Vídeos indicados pelo professor para a prova (inclui os marcados para "todas"). */
export function useCurados(exame: ExameFoco, tipo?: "aula" | "short") {
  const [items, setItems] = useState<VideoCurado[]>([]);
  useEffect(() => {
    let alive = true;
    listCurados(exame)
      .then((v) => alive && setItems(tipo ? v.filter((x) => x.tipo === tipo) : v))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, [exame, tipo]);
  return items;
}
