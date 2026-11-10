@echo off
chcp 65001 >nul
title ENSINA A.I - nova senha do administrador
cd /d "%~dp0"
echo.
echo  Antes de continuar, FECHE a janela do app (a janela preta do iniciar-windows.bat).
echo.
pause
if not exist "server\node_modules\express" (
  echo  Instalando o servidor...
  call npm --prefix server install --no-audit --no-fund
)
call npm --prefix server run resetar-admin
pause
