#!/usr/bin/env bash
# ENSINA A.I — define uma nova senha para o administrador. Feche o app antes.
cd "$(dirname "$0")" || exit 1
echo; echo "Antes de continuar, FECHE a janela do app."; read -r -p "Aperte Enter para continuar..."
[ -d server/node_modules/express ] || npm --prefix server install --no-audit --no-fund
npm --prefix server run resetar-admin
