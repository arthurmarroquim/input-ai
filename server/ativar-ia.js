// Ativa o Tutor IA: grava a chave da Anthropic em server/.env e testa se a IA responde.
// Uso:  node ativar-ia.js            → pede a chave na tela
//       node ativar-ia.js sk-ant-...  → usa a chave informada
//       node ativar-ia.js --testar    → só testa a chave que já está no .env
import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const ENV = path.join(aqui, ".env");
const EXEMPLO = path.join(aqui, ".env.example");
const MODELO = process.env.TUTOR_MODEL || "claude-opus-5-5";

function lerChaveDoEnv() {
  if (!fs.existsSync(ENV)) return "";
  const m = fs.readFileSync(ENV, "utf8").match(/^ANTHROPIC_API_KEY=(.*)$/m);
  return (m?.[1] || "").trim().replace(/^["']|["']$/g, "");
}

function gravarChave(chave) {
  if (!fs.existsSync(ENV)) fs.copyFileSync(EXEMPLO, ENV);
  let txt = fs.readFileSync(ENV, "utf8");
  if (/^ANTHROPIC_API_KEY=.*$/m.test(txt)) txt = txt.replace(/^ANTHROPIC_API_KEY=.*$/m, `ANTHROPIC_API_KEY=${chave}`);
  else txt = `ANTHROPIC_API_KEY=${chave}\n${txt}`;
  fs.writeFileSync(ENV, txt);
}

async function testar(chave) {
  const client = new Anthropic({ apiKey: chave });
  try {
    const r = await client.messages.create({
      model: MODELO,
      max_tokens: 1024,
      output_config: { effort: "low" },
      messages: [{ role: "user", content: "Responda apenas: Tutor do ENSINA A.I pronto!" }],
    });
    const texto = r.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim();
    console.log(`\n✅ A IA respondeu: "${texto}"`);
    return "ok";
  } catch (e) {
    console.log("");
    if (e instanceof Anthropic.AuthenticationError) {
      console.log("❌ Chave inválida. Confira se copiou a chave inteira (começa com sk-ant-) ou crie uma nova.");
      console.log("");
      return "invalida";
    } else if (e instanceof Anthropic.PermissionDeniedError) {
      console.log("❌ A chave não tem permissão para usar este modelo. Veja sua conta em console.anthropic.com.");
    } else if (e instanceof Anthropic.RateLimitError) {
      console.log("⚠️  Limite de uso atingido agora. Espere alguns minutos e teste de novo.");
    } else if (e instanceof Anthropic.BadRequestError) {
      console.log("❌ A Anthropic recusou o pedido. Se for falta de créditos, adicione em console.anthropic.com → Billing.");
      console.log(`   Detalhe: ${e.message}`);
    } else if (e instanceof Anthropic.APIConnectionError) {
      console.log("❌ Sem conexão com a Anthropic. Verifique a internet (ou o antivírus/firewall) e tente de novo.");
    } else if (e instanceof Anthropic.APIError) {
      console.log(`❌ A IA está indisponível agora (erro ${e.status}). Tente de novo em alguns minutos.`);
    } else {
      console.log(`❌ Erro inesperado: ${e?.message || e}`);
    }
    console.log("");
    return "erro";
  }
}

const arg = process.argv[2] || "";
let chave = "";
if (arg === "--testar") {
  chave = lerChaveDoEnv();
  if (!chave) {
    console.log("\nAinda não há chave no server/.env. Rode o ativador sem --testar para colar a chave.\n");
    process.exit(1);
  }
} else {
  chave = arg.trim();
  if (!chave) {
    console.log("\n===== Ativar o Tutor IA do ENSINA A.I =====\n");
    console.log("1. Entre em https://console.anthropic.com → API Keys → Create Key");
    console.log("2. Copie a chave (começa com sk-ant-) e cole aqui (botão direito do mouse cola no Windows).\n");
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    chave = (await rl.question("Chave da Anthropic: ")).trim();
    rl.close();
  }
  chave = chave.replace(/^["']|["']$/g, "").trim();
  if (!/^sk-ant-[\w-]{20,}$/.test(chave)) {
    console.log("\n❌ Isso não parece uma chave da Anthropic. Ela começa com sk-ant- e é bem longa. Nada foi gravado.\n");
    process.exit(1);
  }
}

console.log("🔎 Testando a IA (pode levar alguns segundos)...");
const resultado = await testar(chave);
if (arg !== "--testar") {
  if (resultado === "invalida") {
    console.log("Nada foi gravado. A chave anterior (se havia) continua no server/.env.\n");
    process.exit(1);
  }
  // Grava também quando o teste falhou por outro motivo (internet, créditos): a chave em si é válida.
  gravarChave(chave);
  console.log("💾 Chave gravada em server/.env (fica só neste computador).");
}
if (resultado === "ok") console.log("   O Tutor IA está ATIVO. Abra (ou reabra) o app pelo arquivo iniciar.\n");
process.exit(resultado === "ok" ? 0 : 1);
