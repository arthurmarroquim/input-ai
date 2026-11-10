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
if not exist "server\node_modules" (
  echo  Instalando ^(so na primeira vez, pode levar alguns minutos^)...
  call npm run instalar || (pause & exit /b 1)
)
if not exist "server\.env" call npm run configurar
echo  Montando o site do app...
call npm run montar-site || (pause & exit /b 1)
echo.
echo  Abrindo http://localhost:3333 ...
start "" http://localhost:3333
call npm run servidor
pause
