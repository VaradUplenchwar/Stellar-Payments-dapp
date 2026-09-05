@echo off
title Second Brain — Infinite Canvas
cd /d "%~dp0"

echo.
echo   Starting Second Brain — Infinite Canvas
echo   -------------------------------
echo.

if not exist "dist\index.html" (
  echo   [1/2] Building app for the first time...
  call npm run build
  if errorlevel 1 (
    echo.
    echo   Build failed. Make sure Node.js is installed, then run: npm install
    pause
    exit /b 1
  )
)

echo   [1/2] App is ready.
echo   [2/2] Starting server and opening your browser...
node server.mjs

pause