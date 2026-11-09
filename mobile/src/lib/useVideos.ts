import { useEffect, useState } from "react";
import { searchVideos, Video } from "./api";

export function useVideos(query: string, tipo: "short" | "aula") {
  const [items, setItems] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    searchVideos(query, tipo)
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
  }, [query, tipo, attempt]);

  return { items, loading, error, retry: () => setAttempt((n) => n + 1) };
}
