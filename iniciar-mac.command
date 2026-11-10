#!/usr/bin/env bash
# ENSINA A.I — instala (na primeira vez), monta o site e abre o app no navegador.
cd "$(dirname "$0")" || exit 1
echo; echo "===== ENSINA A.I ====="; echo
if ! command -v node >/dev/null 2>&1; then
  echo "O Node.js não está instalado. Baixe a versão LTS em https://nodejs.org, instale e rode este arquivo de novo."
  (open https://nodejs.org 2>/dev/null || xdg-open https://nodejs.org 2>/dev/null) &
  exit 1
fi
if [ ! -d server/node_modules ]; then
  echo "Instalando (só na primeira vez, pode levar alguns minutos)..."
  npm run instalar || exit 1
fi
[ -f server/.env ] || npm run configurar
echo "Montando o site do app..."
npm run montar-site || exit 1
( sleep 3; open http://localhost:3333 2>/dev/null || xdg-open http://localhost:3333 2>/dev/null ) &
npm run servidor
