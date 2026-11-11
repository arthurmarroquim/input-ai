// Backend do ENSINA A.I
// - /api/tutor  : tutor de estudos com IA (Claude), aceita fotos da câmera
// - /api/videos : busca vídeos curtos e videoaulas no YouTube
// As chaves de API ficam SOMENTE aqui no servidor, nunca no aplicativo.
import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as auth from "./auth.js";

const PORT = Number(process.env.PORT || 3333);
const MODEL = process.env.TUTOR_MODEL || "claude-opus-5-5";
// Perguntas por aluno por dia (administradores não têm limite). 0 = sem limite.
const LIMITE_DIARIO = Number(process.env.TUTOR_LIMITE_DIARIO ?? 40);
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
const YOUTUBE_API_BASE = process.env.YOUTUBE_API_BASE || "https://www.googleapis.com"; // troca só em testes
const hasAnthropicCredentials = Boolean(
  process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN,
);

const anthropic = new Anthropic();
const app = express();
// Atrás do proxy da hospedagem (Render, Railway…): usa o IP real do aluno no limite de tentativas.
app.set("trust proxy", 1);
app.use(express.json({ limit: "15mb" }));

// CORS liberado para o app (Expo Go / web) conseguir chamar o servidor.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const SYSTEM_PROMPT = `Você é o Tutor do ENSINA A.I, um aplicativo que ensina estudantes brasileiros (ensino fundamental, médio, vestibular e ENEM) a aprenderem a estudar.

Seu jeito de ajudar:
- Fale sempre em português do Brasil, com linguagem clara, acolhedora e adequada à idade do aluno.
- Seu objetivo principal é que o aluno APRENDA, não só que receba a resposta. Sempre que fizer sentido, termine com uma pergunta curta que confira se ele entendeu ou com um próximo passo de estudo.
- Quando o aluno enviar uma FOTO (caderno, livro, lousa, prova, exercício): primeiro diga em uma linha o que você reconheceu na imagem (ex.: "Vi uma equação do 2º grau: x² − 5x + 6 = 0"). Se a imagem estiver ilegível ou cortada, peça outra foto e diga como tirá-la melhor (luz, foco, enquadramento).
- Ensine técnicas de estudo quando forem úteis: Pomodoro, repetição espaçada, recordação ativa (active recall), técnica Feynman, mapas mentais, intercalação de matérias, resumos e flashcards.
- Use listas e passos numerados curtos. Escreva fórmulas em texto simples (ex.: x² + 2x = 0, √9 = 3, a/b), pois o app não renderiza LaTeX nem Markdown complexo — use no máximo **negrito** e listas com "-" ou "1.".
- Seja honesto: se não tiver certeza, diga. Não invente fontes.
- Se o assunto não for estudo, responda brevemente e com gentileza traga a conversa de volta para os estudos. Se o aluno demonstrar sofrimento emocional sério, acolha e sugira conversar com um adulto de confiança ou ligar para o CVV (188).

Modos de resposta (o app informa o modo em cada mensagem):
- MODO DICA: NÃO entregue a resposta final. Dê uma pista de cada vez, faça perguntas que guiem o raciocínio (método socrático) e mostre qual conceito o aluno precisa revisar.
- MODO EXPLICAR: Resolva passo a passo, explicando o porquê de cada passo, destaque a resposta final e, no fim, sugira 1 exercício parecido para o aluno praticar sozinho.`;

const ALLOWED_MEDIA = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/** Converte o histórico enviado pelo app no formato da API do Claude. */
function toClaudeMessages(history, mode) {
  const out = [];
  for (const [i, m] of history.entries()) {
    const role = m.role === "assistant" ? "assistant" : "user";
    const content = [];
    if (role === "user" && m.image?.base64) {
      const mediaType = ALLOWED_MEDIA.has(m.image.mediaType) ? m.image.mediaType : "image/jpeg";
      content.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: m.image.base64 },
      });
    }
    let text = String(m.text || "").slice(0, 8000);
    const isLast = i === history.length - 1;
    if (role === "user" && isLast) {
      const modeLabel = mode === "explicar" ? "MODO EXPLICAR" : "MODO DICA";
      text = `[${modeLabel}]\n${text || "Me ajude com o que aparece nesta foto."}`;
    }
    if (text) content.push({ type: "text", text });
    if (content.length) out.push({ role, content });
  }
  return out;
}

// ---------- Autenticação ----------

const bearer = (req) => (req.headers.authorization || "").replace(/^Bearer\s+/i, "") || null;

function requireAuth(req, res, next) {
  const user = auth.userFromToken(bearer(req));
  if (!user) return res.status(401).json({ error: "Faça login para continuar." });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Acesso só para administradores." });
  next();
}

// Limite simples de tentativas para dificultar adivinhação de senha.
const attempts = new Map();
function tooManyAttempts(key) {
  const now = Date.now();
  const list = (attempts.get(key) || []).filter((t) => now - t < 15 * 60_000);
  list.push(now);
  attempts.set(key, list);
  return list.length > 10;
}

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body || {};
  const serie = auth.parseSerie(req.body?.serie);
  if (tooManyAttempts(`reg:${req.ip}`)) {
    return res.status(429).json({ error: "Muitas tentativas. Espere alguns minutos." });
  }
  const invalid = auth.validateRegistration({ name, email, password });
  if (invalid) return res.status(400).json({ error: invalid });
  if (serie === undefined) return res.status(400).json({ error: "Escolha a série que você está cursando." });
  if (auth.findByEmail(email)) return res.status(409).json({ error: "Este e-mail já tem cadastro. Faça login." });
  const user = await auth.createUser({ name, email, password, serie });
  const token = await auth.createSession(user.id);
  res.status(201).json({ token, user: auth.publicUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (tooManyAttempts(`login:${req.ip}:${auth.normalizeEmail(email)}`)) {
    return res.status(429).json({ error: "Muitas tentativas. Espere 15 minutos e tente de novo." });
  }
  const user = await auth.checkLogin(email, String(password || ""));
  if (!user) return res.status(401).json({ error: "E-mail ou senha incorretos." });
  const token = await auth.createSession(user.id);
  res.json({ token, user: auth.publicUser(user) });
});

app.get("/api/auth/me", requireAuth, (req, res) => res.json({ user: auth.publicUser(req.user) }));

// Atualiza dados do próprio perfil (série e nome).
app.patch("/api/auth/me", requireAuth, async (req, res) => {
  const changes = {};
  if ("serie" in (req.body || {})) {
    const serie = auth.parseSerie(req.body.serie);
    if (serie === undefined) return res.status(400).json({ error: "Série inválida." });
    changes.serie = serie;
  }
  if ("name" in (req.body || {})) {
    const name = String(req.body.name || "").trim();
    if (name.length < 2 || name.length > 80) return res.status(400).json({ error: "Nome inválido." });
    changes.name = name;
  }
  const u = await auth.updateProfile(req.user.id, changes);
  res.json({ user: auth.publicUser(u) });
});

app.post("/api/auth/logout", requireAuth, async (req, res) => {
  await auth.deleteSession(bearer(req));
  res.json({ ok: true });
});

app.post("/api/auth/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const ok = await auth.checkLogin(req.user.email, String(currentPassword || ""));
  if (!ok) return res.status(400).json({ error: "Senha atual incorreta." });
  const invalid = auth.validatePassword(newPassword);
  if (invalid) return res.status(400).json({ error: invalid });
  await auth.changePassword(req.user.id, newPassword);
  const token = await auth.createSession(req.user.id);
  res.json({ token });
});

// ---------- Progresso por assunto ----------

app.get("/api/topics", requireAuth, (req, res) => {
  res.json({ status: auth.getTopics(req.user.id) });
});

app.put("/api/topics/:id", requireAuth, async (req, res) => {
  const err = await auth.setTopic(req.user.id, req.params.id, Number(req.body?.status));
  if (err) return res.status(400).json({ error: err });
  res.json({ ok: true });
});

// ---------- Administração ----------

app.get("/api/admin/users", requireAuth, requireAdmin, (_req, res) => {
  res.json({ users: auth.listUsers() });
});

app.get("/api/admin/uso", requireAuth, requireAdmin, (_req, res) => {
  res.json({ ...auth.resumoUso(), limite: LIMITE_DIARIO, modelo: MODEL });
});

app.patch("/api/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const role = req.body?.role;
  if (!["aluno", "admin"].includes(role)) return res.status(400).json({ error: "Papel inválido." });
  if (req.params.id === req.user.id && role !== "admin") {
    return res.status(400).json({ error: "Você não pode remover seu próprio acesso de administrador." });
  }
  const u = await auth.setRole(req.params.id, role);
  if (!u) return res.status(404).json({ error: "Usuário não encontrado." });
  res.json({ user: auth.publicUser(u) });
});

app.delete("/api/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: "Você não pode excluir a própria conta aqui." });
  const ok = await auth.deleteUser(req.params.id);
  if (!ok) return res.status(404).json({ error: "Usuário não encontrado." });
  res.json({ ok: true });
});

// ---------- Saúde ----------

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ai: hasAnthropicCredentials, youtube: Boolean(YOUTUBE_API_KEY) });
});

const SERIE_TEXTO = {
  1: "está no 1º ano do Ensino Médio (prepara-se também para o SSA 1 da UPE)",
  2: "está no 2º ano do Ensino Médio (prepara-se também para o SSA 2 da UPE)",
  3: "está no 3º ano do Ensino Médio (prepara-se para o ENEM e o SSA 3 da UPE)",
  concluido: "já concluiu o Ensino Médio ou faz cursinho (foco no ENEM e vestibulares)",
};

function erroDaIA(error) {
  if (error instanceof Anthropic.AuthenticationError)
    return [503, "Servidor sem chave da IA configurada (ANTHROPIC_API_KEY)."];
  if (error instanceof Anthropic.RateLimitError) return [429, "Muitas perguntas ao mesmo tempo. Espere alguns segundos."];
  if (error instanceof Anthropic.BadRequestError)
    return [400, "Não consegui ler essa mensagem ou imagem. Tente outra foto."];
  if (error instanceof Anthropic.APIError) return [502, "A IA está indisponível agora. Tente novamente."];
  return [500, "Erro inesperado no servidor."];
}

// POST /api/tutor            → resposta inteira em JSON: { reply, restantes }
// POST /api/tutor?stream=1   → Server-Sent Events: "delta" { text } (texto até agora), "done" { reply, restantes }, "error" { error }
app.post("/api/tutor", requireAuth, async (req, res) => {
  const { messages, mode } = req.body || {};
  const streaming = req.query.stream === "1";
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Envie ao menos uma mensagem." });
  }
  const history = messages.slice(-20);
  if (history[history.length - 1]?.role !== "user") {
    return res.status(400).json({ error: "A última mensagem precisa ser do aluno." });
  }

  // Sem chave configurada: avisa logo, em vez de um erro genérico da biblioteca.
  if (!hasAnthropicCredentials) {
    return res.status(503).json({
      error: "O Tutor IA ainda não foi ativado neste servidor (falta a chave da IA). Avise o administrador.",
    });
  }

  // Limite diário por aluno (controle de custo)
  const ilimitado = req.user.role === "admin" || LIMITE_DIARIO <= 0;
  const usadas = auth.usoDoDia(req.user.id).perguntas;
  if (!ilimitado && usadas >= LIMITE_DIARIO) {
    return res.status(429).json({
      error: `Você já fez ${LIMITE_DIARIO} perguntas hoje. O limite renova amanhã. Enquanto isso, revise com as técnicas de estudo! 📚`,
      restantes: 0,
    });
  }

  // O tutor adapta a linguagem e os exemplos à série do aluno
  const sobreAluno = SERIE_TEXTO[req.user.serie]
    ? `\n\nSobre o aluno: ${req.user.name.split(" ")[0]} ${SERIE_TEXTO[req.user.serie]}. Ajuste o nível das explicações e dos exemplos a essa etapa.`
    : "";

  let stream;
  try {
    stream = anthropic.beta.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      // Se o modelo recusar por segurança, o servidor da Anthropic tenta outro modelo automaticamente.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT + sobreAluno,
      messages: toClaudeMessages(history, mode),
    });
  } catch (error) {
    console.error("[tutor]", error);
    const [st, msg] = erroDaIA(error);
    return res.status(st).json({ error: msg });
  }

  const enviar = (evento, dados) => res.write(`event: ${evento}\ndata: ${JSON.stringify(dados)}\n\n`);
  if (streaming) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    enviar("status", { status: "pensando" });
    let texto = "";
    stream.on("text", (delta) => {
      texto += delta;
      enviar("delta", { text: texto });
    });
  }
  // Se o aluno sair da tela, para de gerar (e de gastar).
  res.on("close", () => {
    if (!res.writableFinished) stream.abort();
  });

  try {
    const response = await stream.finalMessage();
    let reply = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (response.stop_reason === "refusal" || !reply) {
      reply =
        response.stop_reason === "refusal"
          ? "Desculpe, não consigo ajudar com esse pedido. Que tal me mandar uma dúvida de alguma matéria? 📚"
          : "Não consegui gerar uma resposta. Tente perguntar de outro jeito.";
    }
    const uso = await auth.registrarUso(req.user.id, {
      entrada: response.usage?.input_tokens ?? 0,
      saida: response.usage?.output_tokens ?? 0,
    });
    const restantes = ilimitado ? null : Math.max(0, LIMITE_DIARIO - uso.perguntas);
    if (streaming) {
      enviar("done", { reply, restantes });
      return res.end();
    }
    return res.json({ reply, restantes });
  } catch (error) {
    if (res.destroyed) return; // aluno saiu da tela
    console.error("[tutor]", error);
    const [st, msg] = erroDaIA(error);
    if (streaming) {
      enviar("error", { error: msg });
      return res.end();
    }
    return res.status(st).json({ error: msg });
  }
});

// Uso do Tutor IA hoje (para o aluno ver quantas perguntas ainda tem)
app.get("/api/tutor/uso", requireAuth, (req, res) => {
  const ilimitado = req.user.role === "admin" || LIMITE_DIARIO <= 0;
  const usadas = auth.usoDoDia(req.user.id).perguntas;
  res.json({ usadas, limite: ilimitado ? null : LIMITE_DIARIO, restantes: ilimitado ? null : Math.max(0, LIMITE_DIARIO - usadas) });
});

// Foco da busca por prova: o termo é somado ao assunto pesquisado no YouTube.
const TERMO_EXAME = { enem: "ENEM", ssa1: "SSA 1 UPE", ssa2: "SSA 2 UPE", ssa3: "SSA 3 UPE" };

// Memória das buscas (24 h): a cota gratuita da YouTube Data API permite só ~100 buscas por dia.
const CACHE_VIDEOS = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000;

app.get("/api/videos", requireAuth, async (req, res) => {
  const q = String(req.query.q || "").trim().slice(0, 100);
  const tipo = req.query.tipo === "short" ? "short" : "aula";
  const termoExame = TERMO_EXAME[String(req.query.exame || "")] || "";
  if (!q) return res.status(400).json({ error: "Informe o assunto (q)." });
  if (!YOUTUBE_API_KEY) {
    return res.status(503).json({ error: "YOUTUBE_API_KEY não configurada no servidor." });
  }

  const busca = [q, termoExame].filter(Boolean).join(" ");
  const chave = `${tipo}|${busca.toLowerCase()}`;
  const guardado = CACHE_VIDEOS.get(chave);
  if (guardado && Date.now() - guardado.em < CACHE_TTL) return res.json({ items: guardado.items });

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: "15",
    q: tipo === "short" ? `${busca} #shorts` : `${busca} aula`,
    videoDuration: tipo === "short" ? "short" : "medium",
    videoEmbeddable: "true",
    safeSearch: "strict",
    relevanceLanguage: "pt",
    regionCode: "BR",
    key: YOUTUBE_API_KEY,
  });

  try {
    const r = await fetch(`${YOUTUBE_API_BASE}/youtube/v3/search?${params}`);
    if (!r.ok) {
      console.error("[videos]", r.status, await r.text());
      const cota = r.status === 403;
      return res.status(502).json({
        error: cota
          ? "O limite diário de buscas no YouTube acabou. Veja os vídeos indicados pelo professor ou tente amanhã."
          : "Não foi possível buscar vídeos agora.",
      });
    }
    const data = await r.json();
    const items = (data.items || [])
      .filter((it) => it.id?.videoId)
      .map((it) => ({
        id: it.id.videoId,
        title: decodeEntities(it.snippet.title),
        channel: decodeEntities(it.snippet.channelTitle),
        thumbnail:
          it.snippet.thumbnails?.high?.url ||
          it.snippet.thumbnails?.medium?.url ||
          `https://i.ytimg.com/vi/${it.id.videoId}/hqdefault.jpg`,
      }));
    if (CACHE_VIDEOS.size > 500) CACHE_VIDEOS.delete(CACHE_VIDEOS.keys().next().value);
    CACHE_VIDEOS.set(chave, { em: Date.now(), items });
    return res.json({ items });
  } catch (error) {
    console.error("[videos]", error);
    return res.status(502).json({ error: "Não foi possível buscar vídeos agora." });
  }
});

// ---------- Vídeos indicados pelo professor ----------

/** Extrai o ID de 11 caracteres de um link do YouTube (watch, youtu.be, shorts, embed, live) ou do próprio ID. */
function idDoYoutube(entrada) {
  const s = String(entrada || "").trim();
  if (/^[\w-]{11}$/.test(s)) return { id: s, short: false };
  let u;
  try {
    u = new URL(s.startsWith("http") ? s : `https://${s}`);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\./, "");
  let id = null;
  if (host === "youtu.be") id = u.pathname.slice(1, 12);
  else if (host.endsWith("youtube.com") || host === "youtube-nocookie.com") {
    id = u.searchParams.get("v") || u.pathname.match(/\/(?:shorts|embed|live|v)\/([\w-]{11})/)?.[1] || null;
  }
  return id && /^[\w-]{11}$/.test(id) ? { id, short: u.pathname.startsWith("/shorts/") } : null;
}

/** Título e canal pelo oEmbed do YouTube (não precisa de chave). */
async function dadosDoVideo(youtubeId) {
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${youtubeId}`)}`,
      { signal: AbortSignal.timeout(6000) },
    );
    if (!r.ok) return null;
    const d = await r.json();
    return { titulo: String(d.title || ""), canal: String(d.author_name || "") };
  } catch {
    return null;
  }
}

const publicVideo = (v) => ({
  id: v.id,
  youtubeId: v.youtubeId,
  title: v.titulo,
  channel: v.canal,
  thumbnail: `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
  exame: v.exame,
  materia: v.materia || null,
  tipo: v.tipo,
});

app.get("/api/curados", requireAuth, (req, res) => {
  const exame = auth.EXAMES_VIDEO.includes(String(req.query.exame)) ? String(req.query.exame) : "todas";
  res.json({ items: auth.listarVideos(exame).map(publicVideo) });
});

app.post("/api/admin/curados", requireAuth, requireAdmin, async (req, res) => {
  const { url, titulo, exame, materia } = req.body || {};
  const yt = idDoYoutube(url);
  if (!yt) return res.status(400).json({ error: "Link do YouTube inválido. Cole o endereço do vídeo." });
  if (!auth.EXAMES_VIDEO.includes(exame)) return res.status(400).json({ error: "Escolha a prova (ENEM, SSA 1, 2 ou 3)." });
  if (auth.listarVideos().some((v) => v.youtubeId === yt.id && v.exame === exame)) {
    return res.status(409).json({ error: "Esse vídeo já foi indicado para essa prova." });
  }
  const meta = await dadosDoVideo(yt.id);
  const tituloFinal = String(titulo || "").trim().slice(0, 150) || meta?.titulo || "Vídeo do YouTube";
  const v = await auth.adicionarVideo({
    youtubeId: yt.id,
    titulo: tituloFinal,
    canal: meta?.canal || "",
    exame,
    materia: materia ? String(materia).slice(0, 40) : null,
    tipo: yt.short ? "short" : "aula",
    criadoPor: req.user.id,
  });
  res.status(201).json({ item: publicVideo(v) });
});

app.delete("/api/admin/curados/:id", requireAuth, requireAdmin, async (req, res) => {
  const ok = await auth.removerVideo(req.params.id);
  if (!ok) return res.status(404).json({ error: "Vídeo não encontrado." });
  res.json({ ok: true });
});

function decodeEntities(s = "") {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// Opcional: servir a versão web do app (pasta gerada por `npx expo export --platform web`).
// Assim app e API ficam no mesmo endereço — útil para testar no navegador do celular.
// Sem WEB_DIR, usa ../web-build se existir (gerado por `npm start` na raiz do projeto).
const WEB_PADRAO = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "web-build");
const WEB_DIR = process.env.WEB_DIR || (fs.existsSync(path.join(WEB_PADRAO, "index.html")) ? WEB_PADRAO : "");
if (WEB_DIR) {
  const webDir = path.resolve(WEB_DIR);
  app.use(express.static(webDir));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(webDir, "index.html"));
  });
}

await auth.ensureAdmin();

app.listen(PORT, () => {
  console.log(`ENSINA A.I rodando em http://localhost:${PORT}`);
  if (WEB_DIR) {
    console.log(`\n👉 Abra o app no navegador: http://localhost:${PORT}`);
    // Endereços para abrir no celular (mesma rede Wi-Fi)
    const ips = Object.values(os.networkInterfaces())
      .flat()
      .filter((i) => i && i.family === "IPv4" && !i.internal)
      .map((i) => `http://${i.address}:${PORT}`);
    if (ips.length) console.log(`📱 No celular (mesmo Wi-Fi): ${ips.join("  ou  ")}\n`);
  }
  console.log(`Tutor IA: modelo ${MODEL}, limite ${LIMITE_DIARIO > 0 ? `${LIMITE_DIARIO} perguntas/aluno/dia` : "sem limite"}`);
  if (!hasAnthropicCredentials) console.warn("⚠️  ANTHROPIC_API_KEY não definida — o Tutor IA não vai responder.");
  if (!YOUTUBE_API_KEY) console.warn("⚠️  YOUTUBE_API_KEY não definida — a busca de vídeos ficará desativada.");
});
