// Comunicação com o backend do Estude A.I. (pasta /server).
// As chaves das APIs (Claude e YouTube) ficam no servidor, nunca no app.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3333").replace(/\/$/, "");

export type TutorMode = "dica" | "explicar";
export type ChatImage = { base64: string; mediaType: string; uri: string };
export type ChatMessage = { id: string; role: "user" | "assistant"; text: string; image?: ChatImage };
export type Video = { id: string; title: string; channel: string; thumbnail: string };
export type Role = "aluno" | "admin";
export type User = { id: string; name: string; email: string; role: Role; createdAt: string };

// Token da sessão atual, definido pelo AuthProvider.
let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new ApiError(`Não consegui conectar ao servidor (${API_URL}). Ele está ligado?`, 0);
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && authToken && !path.startsWith("/api/auth/")) onUnauthorized?.();
  if (!res.ok) throw new ApiError(data.error || `Erro ${res.status}`, res.status);
  return data as T;
}

const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });

// ---------- Autenticação ----------
export const login = (email: string, password: string) =>
  post<{ token: string; user: User }>("/api/auth/login", { email, password });

export const register = (name: string, email: string, password: string) =>
  post<{ token: string; user: User }>("/api/auth/register", { name, email, password });

export const me = () => request<{ user: User }>("/api/auth/me");
export const logout = () => post<{ ok: true }>("/api/auth/logout", {});
export const changePassword = (currentPassword: string, newPassword: string) =>
  post<{ token: string }>("/api/auth/password", { currentPassword, newPassword });

// ---------- Administração ----------
export const adminListUsers = () => request<{ users: User[] }>("/api/admin/users");
export const adminSetRole = (id: string, role: Role) =>
  request<{ user: User }>(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ role }) });
export const adminDeleteUser = (id: string) =>
  request<{ ok: true }>(`/api/admin/users/${id}`, { method: "DELETE" });

// ---------- Tutor e vídeos ----------
export async function askTutor(messages: ChatMessage[], mode: TutorMode): Promise<string> {
  const payload = messages.map((m) => ({
    role: m.role,
    text: m.text,
    image: m.image ? { base64: m.image.base64, mediaType: m.image.mediaType } : undefined,
  }));
  const data = await post<{ reply: string }>("/api/tutor", { messages: payload, mode });
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
