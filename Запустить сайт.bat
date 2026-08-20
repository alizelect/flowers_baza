@echo off
cd /d "%~dp0"
title flowers_baza - dev server (ne zakryvat)
start "" cmd /c "timeout /t 5 >nul && start http://localhost:5173"
npm run dev
echo.
echo Server ostanovlen. Nazhmite lyubuyu klavishu.
pause >nul
