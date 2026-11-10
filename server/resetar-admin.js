// Define uma nova senha para o administrador (quando a senha foi esquecida).
// Uso (com o app FECHADO):  node --env-file-if-exists=.env resetar-admin.js [nova-senha]
// Sem nova senha, gera uma senha forte e mostra na tela.
import crypto from "node:crypto";
import * as auth from "./auth.js";

const email = auth.normalizeEmail(process.env.ADMIN_EMAIL || "admin@ensina.ai");
let senha = process.argv[2] || "";
if (!senha) senha = `${crypto.randomBytes(6).toString("base64url")}${Math.floor(10 + Math.random() * 89)}`;
const invalida = auth.validatePassword(senha);
if (invalida) {
  console.error(`Senha inválida: ${invalida}`);
  process.exit(1);
}

await auth.ensureAdmin(); // carrega os dados (e cria o admin se ainda não existir)
const admin = auth.findByEmail(email);
if (!admin) {
  console.error(`Administrador ${email} não encontrado.`);
  process.exit(1);
}
if (admin.role !== "admin") await auth.setRole(admin.id, "admin");
await auth.changePassword(admin.id, senha);

console.log("\n✅ Senha do administrador redefinida.");
console.log(`   E-mail: ${email}`);
console.log(`   Senha:  ${senha}\n`);
console.log("Agora abra o app de novo e entre com esses dados. Depois, se quiser, troque a senha em Perfil → Trocar senha.\n");
