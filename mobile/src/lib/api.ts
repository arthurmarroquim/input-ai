import { Platform } from "react-native";
import { fetch as expoFetch } from "expo/fetch";
import { DEMO, DemoError, demoRequest } from "./demo";

// Comunicação com o backend do ENSINA A.I (pasta /server).
// As chaves das APIs (Claude e YouTube) ficam no servidor, nunca no app.
// Na versão web servida pelo próprio servidor, a API fica no mesmo endereço da página.
const sameOrigin = Platform.OS === "web" && typeof window !== "undefined" ? window.location.origin : "";
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || sameOrigin || "http://localhost:3333").replace(
  /\/$/,
  "",
);

export type TutorMode = "dica" | "explicar";
export type ChatImage = { base64: string; mediaType: string; uri: string };
export type ChatMessage = { id: string; role: "user" | "assistant"; text: string; image?: ChatImage };
export type Video = { id: string; title: string; channel: string; thumbnail: string };
export type Role = "aluno" | "admin";
export type Serie = 1 | 2 | 3 | "concluido";
export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  serie: Serie | null;
  createdAt: string;
};

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
  // Modo demonstração: o "servidor" roda dentro do navegador.
  if (DEMO) {
    try {
      return (await demoRequest(path, init, authToken)) as T;
    } catch (e) {
      const status = e instanceof DemoError ? e.status : 500;
      if (status === 401 && authToken && !path.startsWith("/api/auth/")) onUnauthorized?.();
      throw new ApiError((e as Error).message, status);
    }
  }
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

export const register = (name: string, email: string, password: string, serie: Serie) =>
  post<{ token: string; user: User }>("/api/auth/register", { name, email, password, serie });
export const updateMe = (changes: { serie?: Serie; name?: string }) =>
  request<{ user: User }>("/api/auth/me", { method: "PATCH", body: JSON.stringify(changes) });

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
export type TutorResult = { reply: string; restantes: number | null };

/**
 * Pergunta ao Tutor IA. Com `onText`, a resposta chega aos poucos (streaming): `onText`
 * recebe o texto inteiro escrito até agora. Resolve com a resposta final.
 */
export async function askTutor(
  messages: ChatMessage[],
  mode: TutorMode,
  onText?: (textoAteAgora: string) => void,
  signal?: AbortSignal,
): Promise<TutorResult> {
  const payload = messages.map((m) => ({
    role: m.role,
    text: m.text,
    image: m.image ? { base64: m.image.base64, mediaType: m.image.mediaType } : undefined,
  }));
  const body = JSON.stringify({ messages: payload, mode });

  if (DEMO) {
    try {
      return (await demoRequest("/api/tutor", { method: "POST", body }, authToken, onText)) as TutorResult;
    } catch (e) {
      throw new ApiError((e as Error).message, e instanceof DemoError ? e.status : 500);
    }
  }
  if (!onText) {
    const data = await post<{ reply: string; restantes?: number | null }>("/api/tutor", {
      messages: payload,
      mode,
    });
    return { reply: data.reply, restantes: data.restantes ?? null };
  }

  // Streaming (Server-Sent Events). expo/fetch lê a resposta aos poucos também no celular.
  let res: Awaited<ReturnType<typeof expoFetch>>;
  try {
    res = await expoFetch(`${API_URL}/api/tutor?stream=1`, {
      method: "POST",
      body,
      signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ApiError(`Não consegui conectar ao servidor (${API_URL}). Ele está ligado?`, 0);
  }
  if (!res.ok || !res.body) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.status === 401) onUnauthorized?.();
    throw new ApiError(data.error || `Erro ${res.status}`, res.status);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let final: TutorResult | null = null;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const evento = /^event: (.*)$/m.exec(raw)?.[1];
      const dados = /^data: (.*)$/m.exec(raw)?.[1];
      if (!evento || !dados) continue;
      const json = JSON.parse(dados);
      if (evento === "delta") onText(json.text);
      else if (evento === "done") final = { reply: json.reply, restantes: json.restantes ?? null };
      else if (evento === "error") throw new ApiError(json.error, 502);
    }
  }
  if (!final) throw new ApiError("A resposta foi interrompida. Tente de novo.", 502);
  return final;
}

export const getTutorUso = () =>
  request<{ usadas: number; limite: number | null; restantes: number | null }>("/api/tutor/uso");

export type UsoAdmin = {
  dias: { dia: string; perguntas: number; alunos: number; entrada: number; saida: number }[];
  porUsuarioHoje: Record<string, number>;
  limite: number;
  modelo: string;
};
export const adminUso = () => request<UsoAdmin>("/api/admin/uso");

export async function searchVideos(q: string, tipo: "short" | "aula", exame?: string): Promise<Video[]> {
  const data = await request<{ items: Video[] }>(
    `/api/videos?tipo=${tipo}&q=${encodeURIComponent(q)}${exame ? `&exame=${exame}` : ""}`,
  );
  return data.items;
}

// ---------- Vídeos indicados pelo professor ----------
export type ExameVideo = "todas" | "enem" | "ssa1" | "ssa2" | "ssa3";
export type VideoCurado = {
  id: string; // id interno da indicação
  youtubeId: string;
  title: string;
  channel: string;
  thumbnail: string;
  exame: ExameVideo;
  materia: string | null;
  tipo: "aula" | "short";
};
export const listCurados = (exame: ExameVideo = "todas") =>
  request<{ items: VideoCurado[] }>(`/api/curados?exame=${exame}`).then((d) => d.items);
export const adminAddCurado = (dados: {
  url: string;
  titulo?: string;
  exame: ExameVideo;
  materia?: string | null;
}) => post<{ item: VideoCurado }>("/api/admin/curados", dados).then((d) => d.item);
export const adminDelCurado = (id: string) =>
  request<{ ok: true }>(`/api/admin/curados/${id}`, { method: "DELETE" });

export function youtubeSearchUrl(q: string, tipo: "short" | "aula") {
  const query = tipo === "short" ? `${q} #shorts` : `${q} aula`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

// ---------- Progresso por assunto (ENEM / SSA) ----------
export type TopicStatus = 0 | 1 | 2; // a estudar, estudando, dominado
export const getTopics = () => request<{ status: Record<string, TopicStatus> }>("/api/topics");
export const putTopic = (id: string, status: TopicStatus) =>
  request<{ ok: true }>(`/api/topics/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
