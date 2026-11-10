#!/usr/bin/env bash
# ENSINA A.I — instala o que faltar, monta o site e abre o app no navegador.
cd "$(dirname "$0")" || exit 1
echo; echo "===== ENSINA A.I ====="; echo
if ! command -v node >/dev/null 2>&1; then
  echo "O Node.js não está instalado. Baixe a versão LTS em https://nodejs.org, instale e rode este arquivo de novo."
  (open https://nodejs.org 2>/dev/null || xdg-open https://nodejs.org 2>/dev/null) &
  exit 1
fi
echo "Node.js $(node -v)"
[ -f server/.env ] || npm run configurar
falhou() { echo; echo "A instalação não terminou. Verifique a internet e rode de novo. Se continuar, mande um print desta janela."; exit 1; }
if [ ! -d server/node_modules/express ]; then
  echo "[1/2] Instalando o servidor (só na primeira vez)..."
  npm --prefix server install --no-audit --no-fund || falhou
fi
if [ ! -x mobile/node_modules/.bin/expo ]; then
  echo "[2/2] Instalando o app (só na primeira vez, pode levar alguns minutos)..."
  npm --prefix mobile install --no-audit --no-fund || falhou
fi
[ -x mobile/node_modules/.bin/expo ] || falhou
echo "Montando o site do app..."
npm --prefix mobile run build:web || { echo "Não consegui montar o site. Mande um print desta janela."; exit 1; }
( sleep 3; open http://localhost:3333 2>/dev/null || xdg-open http://localhost:3333 2>/dev/null ) &
npm --prefix server start
