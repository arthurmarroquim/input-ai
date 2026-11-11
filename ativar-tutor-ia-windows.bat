@echo off
chcp 65001 >nul
title ENSINA A.I - Ativar o Tutor IA
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo  O Node.js nao esta instalado. Baixe a versao LTS em https://nodejs.org
  start https://nodejs.org
  pause
  exit /b 1
)
if not exist "server\node_modules\@anthropic-ai" (
  echo  Instalando o servidor ^(so na primeira vez^)...
  call npm --prefix server install --no-audit --no-fund
)
call npm --prefix server run ativar-ia
echo.
echo  Se a IA respondeu, feche esta janela e abra o app pelo iniciar-windows.bat
echo  ^(se o app ja estava aberto, feche a janela preta dele e abra de novo^).
pause
