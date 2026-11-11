# Como rodar o ENSINA A.I no seu computador

## 1. Instale o Node.js (uma vez só)

Baixe a versão **LTS** em https://nodejs.org e instale (é só avançar). A versão precisa ser a 22 ou mais nova.

## 2. Baixe o projeto

- No GitHub: botão verde **Code → Download ZIP**, ou pelo link direto:
  https://github.com/arthurmarroquim/input-ai/archive/refs/heads/claude/estude-ai-learning-app-qaglre.zip
- Descompacte o ZIP numa pasta (por exemplo, na Área de Trabalho).

## 3. Rode

| Sistema | O que fazer |
|---|---|
| **Windows** | Dê dois cliques em **`iniciar-windows.bat`** |
| **Mac** | Clique com o botão direito em **`iniciar-mac.command`** → **Abrir** (na primeira vez o Mac pede confirmação) |
| **Linux** | No terminal, dentro da pasta: `./iniciar-mac-linux.sh` |

Na primeira vez ele instala tudo (alguns minutos). Depois abre sozinho o app em **http://localhost:3333**.

A janela preta (terminal) precisa ficar aberta enquanto você usa o app. Para desligar, feche a janela ou aperte `Ctrl + C`.

### Entrar como administrador

Na primeira vez, o terminal mostra uma linha assim:

```
🔑 Senha gerada (aparece só agora, anote e troque depois): ...
```

Entre com **admin@ensina.ai** e essa senha. Para escolher a senha, coloque `ADMIN_PASSWORD=SuaSenha123` no arquivo `server/.env` **antes** da primeira vez.

**Esqueceu ou não anotou a senha?** Feche o app e dê dois cliques em **`resetar-senha-admin-windows.bat`** (Windows) ou **`resetar-senha-admin-mac.command`** (Mac). Ele mostra uma senha nova. Para escolher a senha, use o terminal: `npm run resetar-senha-admin -- SuaSenha123`. Os alunos e o progresso não são apagados.

## 4. Ligar o Tutor IA

1. Crie uma chave em https://console.anthropic.com (API Keys).
2. Abra o arquivo **`server/.env`** (no Bloco de Notas) e cole a chave depois de `ANTHROPIC_API_KEY=`.
3. Feche e abra o app de novo.

Para os vídeos, coloque também uma chave da YouTube Data API em `YOUTUBE_API_KEY=` (opcional).

## Vídeos do YouTube (ENEM e SSA)

- **Busca automática:** coloque uma chave da **YouTube Data API v3** em `YOUTUBE_API_KEY=` no `server/.env` (crie em https://console.cloud.google.com → APIs → YouTube Data API v3 → Credenciais). A cota gratuita dá cerca de 100 buscas por dia; o app guarda cada busca por 24 h para economizar.
- **Vídeos indicados (não precisa de chave):** entre como administrador → **Perfil → Vídeos indicados** → cole o link do vídeo do YouTube, escolha a prova (ENEM, SSA 1, 2, 3 ou Todas) e a matéria. Os alunos veem em **Aulas** e **Shorts** com o selo ⭐ Professor.

## 5. Abrir no celular

Com o celular no **mesmo Wi-Fi** do computador, abra no navegador do celular o endereço que aparece no terminal na linha **📱 No celular**, algo como `http://192.168.0.10:3333`.

Se não abrir, permita o Node.js no firewall do computador (o Windows costuma perguntar na primeira vez: clique em **Permitir**).

## Se der erro

- **"'expo' não é reconhecido…"**: a instalação do app não terminou. Rode o `iniciar-windows.bat` de novo: ele instala o que faltar. Se continuar, abra a pasta do projeto, clique na barra de endereço do Explorador, digite `cmd` e Enter, e rode `npm --prefix mobile install`. Depois clique no `iniciar-windows.bat` de novo.
- **"'node' não é reconhecido…"**: instale o Node.js LTS (passo 1) e **reinicie o computador**.
- **`npm audit` mostra "ENOLOCK"**: na pasta principal não há bibliotecas para verificar. Use `npm run verificar-seguranca`, que verifica o servidor e o app. Os avisos "moderate" do app vêm de ferramentas da Expo usadas só para montar o app. **Não rode `npm audit fix --force`**: ele troca a versão do Expo e quebra o app.
- **Outra mensagem**: role a janela preta para cima, tire um print da primeira mensagem de erro e mande para o suporte.

## Comandos (para quem usa o terminal)

```bash
npm run instalar   # instala servidor e app (primeira vez)
npm start          # monta o site e liga o servidor em http://localhost:3333
npm run celular    # modo desenvolvimento com Expo Go (app nativo no celular)
```

Seus alunos, progresso e senhas ficam em `server/data/` no seu computador.
