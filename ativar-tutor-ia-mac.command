#!/usr/bin/env bash
# ENSINA A.I — grava a chave da Anthropic e testa o Tutor IA.
cd "$(dirname "$0")" || exit 1
[ -d server/node_modules/@anthropic-ai ] || npm --prefix server install --no-audit --no-fund
npm --prefix server run ativar-ia
echo; echo "Se a IA respondeu, abra (ou reabra) o app pelo iniciar-mac.command."
