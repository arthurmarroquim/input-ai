# ENSINA A.I 💡📚

Aplicativo para celular que ajuda estudantes a **aprenderem a estudar**, com:

- **Login e cadastro**: conta com e-mail e senha, perfil, troca de senha e **painel do administrador** (listar, promover e excluir usuários).

- **Série do aluno + BNCC**: no cadastro o aluno informa a série (1º, 2º ou 3º ano do Ensino Médio, ou já concluído). A tela *Minha série na BNCC* indica os assuntos da série e mostra as habilidades (códigos EM13…), as competências específicas de cada área e as competências gerais, com o progresso de cada uma. Cada assunto tem uma página com as habilidades e competências relacionadas. A relação está em `mobile/src/data/bncc.ts` (textos resumidos; o texto oficial está em basenacionalcomum.mec.gov.br).
- **Painel de progresso ENEM e SSA**: o aluno marca cada assunto como *a estudar*, *estudando* ou *dominado* e acompanha o progresso por área do ENEM e por fase do SSA (UPE: SSA 1, 2 e 3), com sugestão do próximo assunto e atalhos para o Tutor IA e as videoaulas. Os 140 assuntos ficam em `mobile/src/data/conteudos.ts` (confira e ajuste conforme a matriz do ENEM e o edital do SSA do ano).
- **Aprenda a estudar**: técnicas explicadas passo a passo (Pomodoro, recordação ativa, repetição espaçada, Feynman, mapa mental, intercalação e planejamento), dica do dia e progresso (dias seguidos, minutos de foco, técnicas aprendidas).
- **Pomodoro**: timer de foco/pausa que registra seu tempo de estudo.
- **Shorts**: feed vertical de vídeos curtos do YouTube por matéria. Deslize para ver o próximo.
- **Videoaulas**: busca de aulas do YouTube por matéria ou assunto, com player no app e dicas de como assistir para aprender.
- **Tutor IA com câmera**: tire uma foto do exercício, do caderno ou da lousa e a IA (Claude, da Anthropic) reconhece o conteúdo e ajuda:
  - **💡 Modo Dica**: pistas e perguntas guiadas, sem entregar a resposta.
  - **📖 Modo Explicar**: resolução passo a passo e um exercício parecido para praticar.

## Estrutura

```
mobile/   App Expo (React Native + TypeScript, Expo Router): Android, iOS e web
server/   API Node.js (Express): chama o Claude e a API de dados do YouTube
```

As chaves de API ficam **só no servidor**. O app nunca vê as chaves.

## Como rodar

### 1. Servidor

```bash
cd server
npm install
cp .env.example .env   # preencha as chaves
npm start              # http://localhost:3333
```

| Variável | Para quê |
|---|---|
| `ANTHROPIC_API_KEY` | Tutor IA ([console.anthropic.com](https://console.anthropic.com)) |
| `YOUTUBE_API_KEY` | Busca de Shorts e videoaulas ([YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com)) |
| `PORT` | Porta do servidor (padrão 3333) |
| `ADMIN_EMAIL` | E-mail do administrador (padrão `admin@ensina.ai`) |
| `ADMIN_PASSWORD` | Senha do administrador. Se ficar vazia, uma senha forte é gerada e mostrada **uma vez** no terminal |

### Usuário administrador

Na primeira vez que o servidor sobe, ele cria o administrador com `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Entre no app com esses dados e abra **Perfil → Painel do administrador**. Para promover outra pessoa a admin, toque no escudo ao lado do nome dela.

Os usuários ficam em `server/data/users.json`. As senhas são guardadas só como hash (scrypt), e o arquivo não vai para o Git. Faça backup dele em produção.

Sem `YOUTUBE_API_KEY`, as telas de vídeo mostram um botão para abrir a busca direto no YouTube.

### 2. Aplicativo

```bash
cd mobile
npm install
cp .env.example .env   # EXPO_PUBLIC_API_URL=http://SEU_IP:3333
npx expo start
```

Abra no celular com o app **Expo Go** (leia o QR code) ou aperte `w` para abrir no navegador.
No celular físico, use o **IP da sua máquina na rede** em `EXPO_PUBLIC_API_URL` (não `localhost`).

Para gerar o app instalável (APK/AAB/IPA): `npx eas-cli@latest build`.

### Demonstração no navegador (GitHub Pages)

A pasta `docs/` tem uma versão de demonstração que funciona sem servidor: contas e progresso ficam salvos só no aparelho, e o Tutor IA e os vídeos mostram mensagens de demonstração. Para publicar: GitHub → **Settings → Pages → Deploy from a branch**, escolha a branch e a pasta `/docs`. O endereço fica `https://<usuario>.github.io/input-ai/`.

Para gerar de novo:

```bash
cd mobile
EXPO_PUBLIC_DEMO=1 EXPO_BASE_URL=/input-ai npx expo export --platform web --output-dir ../docs
touch ../docs/.nojekyll && cp ../docs/index.html ../docs/404.html
```

### Versão web num endereço só (teste no navegador do celular)

```bash
cd mobile && npx expo export --platform web --output-dir ../web-build
cd ../server && WEB_DIR=../web-build npm start   # app e API em http://SEU_IP:3333
```

## Endpoints da API

Tutor e vídeos exigem login (`Authorization: Bearer <token>`).

- `POST /api/auth/register` `{ name, email, password, serie }` e `POST /api/auth/login` `{ email, password }` → `{ token, user }`
- `GET /api/auth/me`, `PATCH /api/auth/me` `{ serie?: 1 | 2 | 3 | "concluido", name? }`, `POST /api/auth/logout`, `POST /api/auth/password` `{ currentPassword, newPassword }`
- Progresso: `GET /api/topics` → `{ status: { [assuntoId]: 1 | 2 } }`, `PUT /api/topics/:id` `{ status: 0 | 1 | 2 }`
- Admin: `GET /api/admin/users`, `PATCH /api/admin/users/:id` `{ role: "aluno" | "admin" }`, `DELETE /api/admin/users/:id`

- `GET /api/health`: diz quais integrações estão configuradas.
- `POST /api/tutor`: `{ mode: "dica" | "explicar", messages: [{ role, text, image?: { base64, mediaType } }] }` → `{ reply }`
- `GET /api/videos?tipo=short|aula&q=assunto` → `{ items: [{ id, title, channel, thumbnail }] }`

O tutor usa o modelo `claude-opus-5-5` com raciocínio adaptativo e fallback automático do servidor caso uma resposta seja recusada.
