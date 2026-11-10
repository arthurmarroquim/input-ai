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

## 4. Ligar o Tutor IA

1. Crie uma chave em https://console.anthropic.com (API Keys).
2. Abra o arquivo **`server/.env`** (no Bloco de Notas) e cole a chave depois de `ANTHROPIC_API_KEY=`.
3. Feche e abra o app de novo.

Para os vídeos, coloque também uma chave da YouTube Data API em `YOUTUBE_API_KEY=` (opcional).

## 5. Abrir no celular

Com o celular no **mesmo Wi-Fi** do computador, abra no navegador do celular o endereço que aparece no terminal na linha **📱 No celular**, algo como `http://192.168.0.10:3333`.

Se não abrir, permita o Node.js no firewall do computador (o Windows costuma perguntar na primeira vez: clique em **Permitir**).

## Comandos (para quem usa o terminal)

```bash
npm run instalar   # instala servidor e app (primeira vez)
npm start          # monta o site e liga o servidor em http://localhost:3333
npm run celular    # modo desenvolvimento com Expo Go (app nativo no celular)
```

Seus alunos, progresso e senhas ficam em `server/data/` no seu computador.
