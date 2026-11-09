// Modo demonstração (EXPO_PUBLIC_DEMO=1): simula o servidor dentro do próprio navegador.
// Serve para publicar o app como site estático (ex.: GitHub Pages) e testar no celular.
// Contas, progresso e sessões ficam SÓ no aparelho (localStorage). Tutor IA e vídeos
// precisam do servidor de verdade e por isso respondem com mensagens de demonstração.

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
type DB = { users: DemoUser[]; sessions: Record<string, string> };

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
    const last = body.messages?.[body.messages.length - 1] ?? {};
    const pergunta = String(last.text || "").trim();
    const foto = Boolean(last.image);
    const dica = body.mode !== "explicar";
    return {
      reply:
        "🧪 **Versão de demonstração**\n\n" +
        (foto
          ? "Recebi sua foto! 📸 Na versão completa, o Tutor IA lê o exercício da imagem, diz o que reconheceu e te ajuda a resolver.\n\n"
          : pergunta
            ? `Você perguntou: "${pergunta.slice(0, 140)}${pergunta.length > 140 ? "…" : ""}"\n\n`
            : "") +
        (dica
          ? "No **modo Dica**, eu responderia com pistas e perguntas para você chegar à resposta sozinho, sem entregar o resultado pronto."
          : "No **modo Explicar**, eu resolveria passo a passo e no final te passaria um exercício parecido para praticar.") +
        "\n\nPara o Tutor responder de verdade, o app precisa estar ligado ao servidor do ENSINA A.I com a chave da IA configurada.",
    };
  }

  if (p === "/api/videos") {
    needAuth();
    throw new DemoError("Na demonstração, os vídeos abrem direto no YouTube.", 503);
  }

  if (p === "/api/health") return { ok: true, ai: false, youtube: false, demo: true };

  throw new DemoError("Rota não encontrada na demonstração.", 404);
}

export { DemoError };
