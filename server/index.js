// Backend do Estude A.I.
// - /api/tutor  : tutor de estudos com IA (Claude), aceita fotos da câmera
// - /api/videos : busca vídeos curtos e videoaulas no YouTube
// As chaves de API ficam SOMENTE aqui no servidor, nunca no aplicativo.
import Anthropic from "@anthropic-ai/sdk";
import express from "express";

const PORT = Number(process.env.PORT || 3333);
const MODEL = "claude-opus-5-5";
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
const hasAnthropicCredentials = Boolean(
  process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN,
);

const anthropic = new Anthropic();
const app = express();
app.use(express.json({ limit: "15mb" }));

// CORS liberado para o app (Expo Go / web) conseguir chamar o servidor.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const SYSTEM_PROMPT = `Você é o Tutor do Estude A.I., um aplicativo que ensina estudantes brasileiros (ensino fundamental, médio, vestibular e ENEM) a aprenderem a estudar.

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

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ai: hasAnthropicCredentials, youtube: Boolean(YOUTUBE_API_KEY) });
});

app.post("/api/tutor", async (req, res) => {
  const { messages, mode } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Envie ao menos uma mensagem." });
  }
  const history = messages.slice(-20);
  if (history[history.length - 1]?.role !== "user") {
    return res.status(400).json({ error: "A última mensagem precisa ser do aluno." });
  }

  try {
    const stream = anthropic.beta.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      // Se o modelo recusar por segurança, o servidor da Anthropic tenta outro modelo automaticamente.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      messages: toClaudeMessages(history, mode),
    });
    const response = await stream.finalMessage();

    if (response.stop_reason === "refusal") {
      return res.json({
        reply:
          "Desculpe, não consigo ajudar com esse pedido. Que tal me mandar uma dúvida de alguma matéria? 📚",
      });
    }
    const reply = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return res.json({ reply: reply || "Não consegui gerar uma resposta. Tente perguntar de outro jeito." });
  } catch (error) {
    console.error("[tutor]", error);
    if (error instanceof Anthropic.AuthenticationError) {
      return res.status(503).json({ error: "Servidor sem chave da IA configurada (ANTHROPIC_API_KEY)." });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "Muitas perguntas ao mesmo tempo. Espere alguns segundos." });
    }
    if (error instanceof Anthropic.BadRequestError) {
      return res.status(400).json({ error: "Não consegui ler essa mensagem ou imagem. Tente outra foto." });
    }
    if (error instanceof Anthropic.APIError) {
      return res.status(502).json({ error: "A IA está indisponível agora. Tente novamente." });
    }
    return res.status(500).json({ error: "Erro inesperado no servidor." });
  }
});

app.get("/api/videos", async (req, res) => {
  const q = String(req.query.q || "").trim().slice(0, 100);
  const tipo = req.query.tipo === "short" ? "short" : "aula";
  if (!q) return res.status(400).json({ error: "Informe o assunto (q)." });
  if (!YOUTUBE_API_KEY) {
    return res.status(503).json({ error: "YOUTUBE_API_KEY não configurada no servidor." });
  }

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: "15",
    q: tipo === "short" ? `${q} #shorts` : `${q} aula`,
    videoDuration: tipo === "short" ? "short" : "medium",
    videoEmbeddable: "true",
    safeSearch: "strict",
    relevanceLanguage: "pt",
    regionCode: "BR",
    key: YOUTUBE_API_KEY,
  });

  try {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    if (!r.ok) {
      console.error("[videos]", r.status, await r.text());
      return res.status(502).json({ error: "Não foi possível buscar vídeos agora." });
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
    return res.json({ items });
  } catch (error) {
    console.error("[videos]", error);
    return res.status(502).json({ error: "Não foi possível buscar vídeos agora." });
  }
});

function decodeEntities(s = "") {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

app.listen(PORT, () => {
  console.log(`Estude A.I. API rodando em http://localhost:${PORT}`);
  if (!hasAnthropicCredentials) console.warn("⚠️  ANTHROPIC_API_KEY não definida — o Tutor IA não vai responder.");
  if (!YOUTUBE_API_KEY) console.warn("⚠️  YOUTUBE_API_KEY não definida — a busca de vídeos ficará desativada.");
});
