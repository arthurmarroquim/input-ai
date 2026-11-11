import { TUTOR_INSTRUCOES } from "./tutorPrompt";

// Modo demonstração (EXPO_PUBLIC_DEMO=1): simula o servidor dentro do próprio navegador.
// Serve para publicar o app como site estático (ex.: GitHub Pages) e testar no celular.
// Contas, progresso e sessões ficam SÓ no aparelho (localStorage). Tutor IA e vídeos
// usam o servidor de verdade. Aqui, aberto como Artifact no claude.ai, o Tutor pergunta ao
// Claude do próprio aluno (capacidade sample); os vídeos abrem no YouTube.

export const DEMO = process.env.EXPO_PUBLIC_DEMO === "1";
export const DEMO_ADMIN = { email: "admin@ensina.ai", password: "ensina2026" };

type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: "aluno" | "admin";
  serie: 1 | 2 | 3 | "concluido" | null;
  createdAt: string;
  pass: string;
  topics: Record<string, 1 | 2>;
};
type DemoVideo = {
  id: string;
  youtubeId: string;
  title: string;
  channel: string;
  thumbnail: string;
  exame: string;
  materia: string | null;
  tipo: "aula" | "short";
};
type DB = { users: DemoUser[]; sessions: Record<string, string>; videos?: DemoVideo[] };

const KEY = "ensinaai.demo.v1";

class DemoError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function hash(s: string) {
  try {
    const data = new TextEncoder().encode(`ensina-demo:${s}`);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return `plain:${s}`; // navegador sem crypto.subtle (ex.: http): só demonstração
  }
}

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

async function load(): Promise<DB> {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // segue para criar
  }
  // Primeira vez: cria o admin e alguns alunos de exemplo
  const now = new Date().toISOString();
  const pass = await hash("senha12345");
  const db: DB = {
    users: [
      {
        id: uid(),
        name: "Administrador",
        email: DEMO_ADMIN.email,
        role: "admin",
        serie: null,
        createdAt: now,
        pass: await hash(DEMO_ADMIN.password),
        topics: {},
      },
      ...(
        [
          ["Pedro Lima (exemplo)", "pedro@exemplo.com", 1],
          ["Mariana Alves (exemplo)", "mariana@exemplo.com", 3],
          ["Lucas Ferreira (exemplo)", "lucas@exemplo.com", "concluido"],
        ] as [string, string, DemoUser["serie"]][]
      ).map(([name, email, serie]) => ({
        id: uid(),
        name,
        email,
        role: "aluno" as const,
        serie,
        createdAt: now,
        pass,
        topics: {},
      })),
    ],
    sessions: {},
  };
  save(db);
  return db;
}

function save(db: DB) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    // sem armazenamento: vale só nesta aba
  }
}

const pub = (u: DemoUser) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  serie: u.serie,
  createdAt: u.createdAt,
});

function parseSerie(v: unknown) {
  if (v === "concluido") return "concluido" as const;
  const n = Number(v);
  return n === 1 || n === 2 || n === 3 ? (n as 1 | 2 | 3) : undefined;
}

function validarSenha(p: string) {
  if (p.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) return "Use letras e números na senha.";
  return null;
}

/** Atende as mesmas rotas do servidor real. */
export async function demoRequest(
  path: string,
  init: RequestInit | undefined,
  token: string | null,
  onText?: (texto: string) => void,
): Promise<unknown> {
  await new Promise((r) => setTimeout(r, 150)); // simula a rede
  const db = await load();
  const method = (init?.method || "GET").toUpperCase();
  const body = init?.body ? JSON.parse(String(init.body)) : {};
  const url = new URL(path, "http://demo");
  const p = url.pathname;
  const me = token ? db.users.find((u) => u.id === db.sessions[token]) : undefined;
  const needAuth = () => {
    if (!me) throw new DemoError("Faça login para continuar.", 401);
    return me;
  };
  const novaSessao = (u: DemoUser) => {
    const t = uid() + uid();
    db.sessions[t] = u.id;
    save(db);
    return t;
  };

  if (p === "/api/auth/register" && method === "POST") {
    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const serie = parseSerie(body.serie);
    if (name.length < 2) throw new DemoError("Informe seu nome.", 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new DemoError("E-mail inválido.", 400);
    const inv = validarSenha(String(body.password || ""));
    if (inv) throw new DemoError(inv, 400);
    if (serie === undefined) throw new DemoError("Escolha a série que você está cursando.", 400);
    if (db.users.some((u) => u.email === email))
      throw new DemoError("Este e-mail já tem cadastro. Faça login.", 409);
    const u: DemoUser = {
      id: uid(),
      name,
      email,
      role: "aluno",
      serie,
      createdAt: new Date().toISOString(),
      pass: await hash(String(body.password)),
      topics: {},
    };
    db.users.push(u);
    return { token: novaSessao(u), user: pub(u) };
  }

  if (p === "/api/auth/login" && method === "POST") {
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const u = db.users.find((x) => x.email === email);
    if (!u || u.pass !== (await hash(String(body.password || ""))))
      throw new DemoError("E-mail ou senha incorretos.", 401);
    return { token: novaSessao(u), user: pub(u) };
  }

  if (p === "/api/auth/me" && method === "GET") return { user: pub(needAuth()) };

  if (p === "/api/auth/me" && method === "PATCH") {
    const u = needAuth();
    if ("serie" in body) {
      const s = parseSerie(body.serie);
      if (s === undefined) throw new DemoError("Série inválida.", 400);
      u.serie = s;
    }
    if ("name" in body) u.name = String(body.name).trim();
    save(db);
    return { user: pub(u) };
  }

  if (p === "/api/auth/logout" && method === "POST") {
    if (token) delete db.sessions[token];
    save(db);
    return { ok: true };
  }

  if (p === "/api/auth/password" && method === "POST") {
    const u = needAuth();
    if (u.pass !== (await hash(String(body.currentPassword || ""))))
      throw new DemoError("Senha atual incorreta.", 400);
    const inv = validarSenha(String(body.newPassword || ""));
    if (inv) throw new DemoError(inv, 400);
    u.pass = await hash(String(body.newPassword));
    for (const [t, id] of Object.entries(db.sessions)) if (id === u.id) delete db.sessions[t];
    return { token: novaSessao(u) };
  }

  if (p === "/api/topics" && method === "GET") return { status: needAuth().topics };

  if (p.startsWith("/api/topics/") && method === "PUT") {
    const u = needAuth();
    const id = decodeURIComponent(p.slice("/api/topics/".length));
    const st = Number(body.status);
    if (st === 0) delete u.topics[id];
    else if (st === 1 || st === 2) u.topics[id] = st;
    else throw new DemoError("Status inválido.", 400);
    save(db);
    return { ok: true };
  }

  if (p.startsWith("/api/admin/")) {
    const u = needAuth();
    if (u.role !== "admin") throw new DemoError("Acesso só para administradores.", 403);
    if (p === "/api/admin/users" && method === "GET") return { users: db.users.map(pub) };
    const id = p.slice("/api/admin/users/".length);
    const alvo = db.users.find((x) => x.id === id);
    if (!alvo) throw new DemoError("Usuário não encontrado.", 404);
    if (method === "PATCH") {
      if (alvo.id === u.id && body.role !== "admin")
        throw new DemoError("Você não pode remover seu próprio acesso de administrador.", 400);
      alvo.role = body.role === "admin" ? "admin" : "aluno";
      save(db);
      return { user: pub(alvo) };
    }
    if (method === "DELETE") {
      if (alvo.id === u.id) throw new DemoError("Você não pode excluir a própria conta aqui.", 400);
      db.users = db.users.filter((x) => x.id !== id);
      save(db);
      return { ok: true };
    }
  }

  if (p === "/api/tutor" && method === "POST") {
    needAuth();
    return { reply: await tutorViaClaude(body, onText), restantes: null };
  }

  if (p === "/api/tutor/uso") {
    needAuth();
    return { usadas: 0, limite: null, restantes: null };
  }

  if (p === "/api/admin/uso") {
    const hojeISO = new Date().toISOString().slice(0, 10);
    return {
      dias: [{ dia: hojeISO, perguntas: 0, alunos: 0, entrada: 0, saida: 0 }],
      porUsuarioHoje: {},
      limite: 0,
      modelo: "Claude do próprio aluno (demonstração)",
    };
  }

  if (p === "/api/curados" && method === "GET") {
    needAuth();
    const ex = url.searchParams.get("exame") || "todas";
    const lista = db.videos ?? [];
    return { items: ex === "todas" ? lista : lista.filter((v) => v.exame === ex || v.exame === "todas") };
  }

  if (p === "/api/admin/curados" && method === "POST") {
    const u = needAuth();
    if (u.role !== "admin") throw new DemoError("Acesso só para administradores.", 403);
    const raw = String(body.url || "").trim();
    const m =
      raw.match(/(?:youtu\.be\/|[?&]v=|\/(?:shorts|embed|live)\/)([\w-]{11})/) ?? raw.match(/^([\w-]{11})$/);
    if (!m) throw new DemoError("Link do YouTube inválido. Cole o endereço do vídeo.", 400);
    const exame = String(body.exame || "");
    if (!["todas", "enem", "ssa1", "ssa2", "ssa3"].includes(exame))
      throw new DemoError("Escolha a prova (ENEM, SSA 1, 2 ou 3).", 400);
    db.videos ??= [];
    if (db.videos.some((v) => v.youtubeId === m[1] && v.exame === exame))
      throw new DemoError("Esse vídeo já foi indicado para essa prova.", 409);
    const item: DemoVideo = {
      id: uid(),
      youtubeId: m[1],
      title: String(body.titulo || "").trim() || "Vídeo do YouTube",
      channel: "",
      thumbnail: `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg`,
      exame,
      materia: body.materia ? String(body.materia) : null,
      tipo: /\/shorts\//.test(raw) ? "short" : "aula",
    };
    db.videos.unshift(item);
    save(db);
    return { item };
  }

  if (p.startsWith("/api/admin/curados/") && method === "DELETE") {
    const u = needAuth();
    if (u.role !== "admin") throw new DemoError("Acesso só para administradores.", 403);
    const id = p.slice("/api/admin/curados/".length);
    db.videos = (db.videos ?? []).filter((v) => v.id !== id);
    save(db);
    return { ok: true };
  }

  if (p === "/api/videos") {
    needAuth();
    throw new DemoError("Na demonstração, os vídeos abrem direto no YouTube.", 503);
  }

  if (p === "/api/health") return { ok: true, ai: false, youtube: false, demo: true };

  throw new DemoError("Rota não encontrada na demonstração.", 404);
}

// ---------- Tutor IA pelo próprio Claude do aluno (capacidade "sample" do Artifact) ----------

type MsgIn = { role: "user" | "assistant"; text?: string; image?: { base64: string; mediaType: string } };
type SampleFn = ((
  input: unknown,
  opts?: Record<string, unknown>,
) => Promise<{ text: string; truncated: boolean }>) & {
  limits?: () => Promise<{ images?: { maxCount: number } }>;
};

async function obterSample(): Promise<SampleFn | null> {
  try {
    const c = (globalThis as { claude?: { use?: (n: string) => Promise<unknown> } }).claude;
    if (!c?.use) return null;
    return ((await c.use("sample")) as SampleFn | null) ?? null;
  } catch {
    return null;
  }
}

function base64ParaBlob(b64: string, type: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

const MSG_ERRO: Record<string, string> = {
  not_granted:
    "Para o Tutor responder, permita que esta página use o Claude (toque em Permitir quando aparecer).",
  sampling_disabled: "O Claude não está disponível para esta conta.",
  rate_limited: "Muitas perguntas em pouco tempo. Espere um pouco e tente de novo.",
  session_expired: "Sua sessão no Claude expirou. Entre de novo no Claude e recarregue a página.",
  image_rejected: "Não consegui usar essa imagem. Tente outra foto (JPG ou PNG).",
  images_unavailable: "Nesta visualização não dá para enviar fotos. Escreva a dúvida em texto.",
  refused: "Não consigo ajudar com esse pedido. Que tal mandar uma dúvida de alguma matéria? 📚",
  empty_completion: "Não consegui gerar uma resposta. Tente perguntar de outro jeito.",
  prompt_too_large: "A conversa ficou muito longa. Saia e volte ao Tutor para começar de novo.",
};

async function tutorViaClaude(body: { messages?: MsgIn[]; mode?: string }, onText?: (t: string) => void) {
  const sample = await obterSample();
  if (!sample) {
    throw new DemoError(
      "O Tutor IA desta demonstração só responde quando o app é aberto pelo link do Claude (claude.ai).",
      503,
    );
  }
  const msgs = (body.messages ?? []).slice(-12);
  const ultima = msgs[msgs.length - 1];
  const modo = body.mode === "explicar" ? "MODO EXPLICAR" : "MODO DICA";

  // Instruções como primeiro turno; depois o histórico; a pergunta nova leva o modo.
  const turns: { role: "user" | "assistant"; content: string }[] = [
    { role: "user", content: `${TUTOR_INSTRUCOES}\n\nResponda sempre seguindo essas instruções.` },
  ];
  msgs.forEach((m, i) => {
    const isLast = i === msgs.length - 1;
    let content = String(m.text || "").slice(0, 6000);
    if (m.role === "user" && m.image && !isLast) content = `[O aluno enviou uma foto antes.] ${content}`;
    if (isLast) {
      content = `[${modo}]\n${content || "Me ajude com o que aparece nesta foto."}`;
      if (m.image)
        content = `[O aluno enviou a foto anexada: um exercício, caderno, livro ou lousa.]\n${content}`;
    }
    if (content.trim()) turns.push({ role: m.role === "assistant" ? "assistant" : "user", content });
  });

  const opts: Record<string, unknown> = { cache: false };
  if (onText) opts.onText = ({ text }: { text: string }) => onText(text);
  if (ultima?.image?.base64) {
    const lim = await sample.limits?.().catch(() => null);
    if (!lim?.images) throw new DemoError(MSG_ERRO.images_unavailable, 400);
    opts.images = [base64ParaBlob(ultima.image.base64, ultima.image.mediaType || "image/jpeg")];
  }

  try {
    const { text, truncated } = await sample(turns, opts);
    return truncated ? `${text}\n\n(Resposta cortada: peça uma parte de cada vez.)` : text;
  } catch (e) {
    const err = e as { code?: string; text?: string };
    if (err.text && err.code !== "refused") return `${err.text}\n\n⚠️ A resposta foi interrompida.`;
    throw new DemoError(MSG_ERRO[err.code ?? ""] ?? "A IA está indisponível agora. Tente novamente.", 502);
  }
}

export { DemoError };
