// Comunicação com o backend do Estude A.I. (pasta /server).
// As chaves das APIs (Claude e YouTube) ficam no servidor, nunca no app.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3333").replace(/\/$/, "");

export type TutorMode = "dica" | "explicar";

export type ChatImage = { base64: string; mediaType: string; uri: string };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  image?: ChatImage;
};

export type Video = { id: string; title: string; channel: string; thumbnail: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
  } catch {
    throw new Error(`Não consegui conectar ao servidor (${API_URL}). Ele está ligado?`);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data as T;
}

export async function askTutor(messages: ChatMessage[], mode: TutorMode): Promise<string> {
  const payload = messages.map((m) => ({
    role: m.role,
    text: m.text,
    image: m.image ? { base64: m.image.base64, mediaType: m.image.mediaType } : undefined,
  }));
  const data = await request<{ reply: string }>("/api/tutor", {
    method: "POST",
    body: JSON.stringify({ messages: payload, mode }),
  });
  return data.reply;
}

export async function searchVideos(q: string, tipo: "short" | "aula"): Promise<Video[]> {
  const data = await request<{ items: Video[] }>(`/api/videos?tipo=${tipo}&q=${encodeURIComponent(q)}`);
  return data.items;
}

export function youtubeSearchUrl(q: string, tipo: "short" | "aula") {
  const query = tipo === "short" ? `${q} #shorts` : `${q} aula`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
