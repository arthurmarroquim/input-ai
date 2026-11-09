// Usuários, senhas e sessões do ENSINA A.I
// - Senhas: scrypt com salt aleatório (nunca guardamos a senha em texto).
// - Sessões: token aleatório entregue ao app; no arquivo guardamos só o hash SHA-256 dele.
// - Armazenamento: arquivo JSON em server/data/ (simples para começar; troque por um banco quando crescer).
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);
const here = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(here, "data");
const DB_FILE = path.join(DATA_DIR, "users.json");
const SESSION_DAYS = 30;

let db = { users: [], sessions: [] };
let writing = Promise.resolve();

function load() {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    db.users ??= [];
    db.sessions ??= [];
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
}

// Gravação atômica e em fila, para não corromper o arquivo.
function persist() {
  writing = writing.then(async () => {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DB_FILE}.tmp`;
    await fs.promises.writeFile(tmp, JSON.stringify(db, null, 2), { mode: 0o600 });
    await fs.promises.rename(tmp, DB_FILE);
  });
  return writing;
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

async function verifyPassword(password, stored) {
  const [, saltHex, keyHex] = String(stored).split("$");
  if (!saltHex || !keyHex) return false;
  const key = await scrypt(password, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(keyHex, "hex");
  return expected.length === key.length && crypto.timingSafeEqual(expected, key);
}

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

export const normalizeEmail = (e) => String(e || "").trim().toLowerCase();

/** Dados do usuário que podem ir para o app (sem hash de senha). */
export function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, serie: u.serie ?? null, createdAt: u.createdAt };
}

export function validateRegistration({ name, email, password }) {
  const n = String(name || "").trim();
  const e = normalizeEmail(email);
  if (n.length < 2) return "Informe seu nome.";
  if (n.length > 80) return "Nome muito longo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || e.length > 120) return "E-mail inválido.";
  return validatePassword(password);
}

export function validatePassword(password) {
  const p = String(password || "");
  if (p.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
  if (p.length > 128) return "Senha muito longa.";
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) return "Use letras e números na senha.";
  return null;
}

export function findByEmail(email) {
  const e = normalizeEmail(email);
  return db.users.find((u) => u.email === e);
}

// Série do aluno: 1, 2 ou 3 (ano do ensino médio) ou "concluido" (já terminou / cursinho).
export const SERIES = [1, 2, 3, "concluido"];
export function parseSerie(v) {
  if (v === "concluido") return "concluido";
  const n = Number(v);
  return [1, 2, 3].includes(n) ? n : undefined;
}

export async function updateProfile(id, { serie, name }) {
  const u = db.users.find((x) => x.id === id);
  if (!u) return null;
  if (serie !== undefined) u.serie = serie;
  if (name !== undefined) u.name = name;
  await persist();
  return u;
}

export async function createUser({ name, email, password, role = "aluno", serie = null }) {
  const user = {
    serie,
    id: crypto.randomUUID(),
    name: String(name).trim(),
    email: normalizeEmail(email),
    role,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  await persist();
  return user;
}

export async function checkLogin(email, password) {
  const user = findByEmail(email);
  // Verifica mesmo sem usuário, para não revelar pelo tempo de resposta quais e-mails existem.
  const ok = await verifyPassword(password, user?.passwordHash ?? "scrypt$00$00");
  return ok && user ? user : null;
}

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const now = Date.now();
  db.sessions = db.sessions.filter((s) => s.expiresAt > now); // limpa expiradas
  db.sessions.push({ tokenHash: sha256(token), userId, expiresAt: now + SESSION_DAYS * 86_400_000 });
  await persist();
  return token;
}

export function userFromToken(token) {
  if (!token) return null;
  const h = sha256(token);
  const s = db.sessions.find((x) => x.tokenHash === h && x.expiresAt > Date.now());
  return s ? db.users.find((u) => u.id === s.userId) ?? null : null;
}

export async function deleteSession(token) {
  const h = sha256(token);
  db.sessions = db.sessions.filter((s) => s.tokenHash !== h);
  await persist();
}

export function listUsers() {
  return db.users.map(publicUser);
}

export async function setRole(id, role) {
  const u = db.users.find((x) => x.id === id);
  if (!u) return null;
  u.role = role;
  await persist();
  return u;
}

export async function deleteUser(id) {
  const before = db.users.length;
  db.users = db.users.filter((u) => u.id !== id);
  db.sessions = db.sessions.filter((s) => s.userId !== id);
  await persist();
  return db.users.length < before;
}

export async function changePassword(id, password) {
  const u = db.users.find((x) => x.id === id);
  if (!u) return false;
  u.passwordHash = await hashPassword(password);
  db.sessions = db.sessions.filter((s) => s.userId !== id); // derruba sessões antigas
  await persist();
  return true;
}

export const countAdmins = () => db.users.filter((u) => u.role === "admin").length;

/**
 * Garante que existe um administrador.
 * Usa ADMIN_EMAIL / ADMIN_PASSWORD do .env. Sem ADMIN_PASSWORD, gera uma senha forte
 * e mostra UMA vez no terminal — troque-a depois de entrar.
 */
export async function ensureAdmin() {
  load();
  const email = normalizeEmail(process.env.ADMIN_EMAIL || "admin@ensina.ai");
  const existing = findByEmail(email);
  if (existing) {
    if (existing.role !== "admin") await setRole(existing.id, "admin");
    return;
  }
  let password = process.env.ADMIN_PASSWORD || "";
  let generated = false;
  if (!password) {
    password = `${crypto.randomBytes(9).toString("base64url")}9a`;
    generated = true;
  } else if (validatePassword(password)) {
    throw new Error(`ADMIN_PASSWORD inválida: ${validatePassword(password)}`);
  }
  await createUser({ name: "Administrador", email, password, role: "admin" });
  console.log(`👤 Usuário administrador criado: ${email}`);
  if (generated) {
    console.log(`🔑 Senha gerada (aparece só agora, anote e troque depois): ${password}`);
  }
}

// ---------- Progresso por assunto (ENEM / SSA) ----------
// status: 0 = a estudar, 1 = estudando, 2 = dominado
const TOPIC_ID = /^[a-z0-9][a-z0-9.-]{0,99}$/;
const MAX_TOPICS = 2000;

export function getTopics(userId) {
  const u = db.users.find((x) => x.id === userId);
  return u?.topics ?? {};
}

export async function setTopic(userId, topicId, status) {
  if (!TOPIC_ID.test(topicId)) return "Assunto inválido.";
  if (![0, 1, 2].includes(status)) return "Status inválido.";
  const u = db.users.find((x) => x.id === userId);
  if (!u) return "Usuário não encontrado.";
  u.topics ??= {};
  if (status === 0) delete u.topics[topicId];
  else {
    if (!(topicId in u.topics) && Object.keys(u.topics).length >= MAX_TOPICS) return "Limite de assuntos atingido.";
    u.topics[topicId] = status;
  }
  u.topicsUpdatedAt = new Date().toISOString();
  await persist();
  return null;
}
