@echo off
chcp 65001 >nul
title ENSINA A.I
cd /d "%~dp0"
echo.
echo  ===== ENSINA A.I =====
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo  O Node.js nao esta instalado.
  echo  Baixe a versao LTS em https://nodejs.org , instale e rode este arquivo de novo.
  start https://nodejs.org
  pause
  exit /b 1
)
echo  Node.js encontrado:
node -v
echo.

if not exist "server\.env" call npm run configurar

rem --- Servidor ---
if not exist "server\node_modules\express" (
  echo  [1/2] Instalando o servidor ^(so na primeira vez^)...
  call npm --prefix server install --no-audit --no-fund
  if errorlevel 1 goto erro_instalar
)

rem --- App ---
if not exist "mobile\node_modules\.bin\expo.cmd" (
  echo  [2/2] Instalando o app ^(so na primeira vez, pode levar alguns minutos^)...
  call npm --prefix mobile install --no-audit --no-fund
  if errorlevel 1 goto erro_instalar
)
if not exist "mobile\node_modules\.bin\expo.cmd" goto erro_instalar

echo.
echo  Montando o site do app...
call npm --prefix mobile run build:web
if errorlevel 1 (
  echo.
  echo  Nao consegui montar o site. Tire um print desta janela e mande para o suporte.
  pause
  exit /b 1
)

echo.
echo  Abrindo http://localhost:3333 ...
start "" http://localhost:3333
call npm --prefix server start
pause
exit /b 0

:erro_instalar
echo.
echo  A instalacao nao terminou. Verifique a internet e rode este arquivo de novo.
echo  Se o erro continuar, tire um print desta janela ^(role para cima para ver a mensagem^).
pause
exit /b 1
