@echo off
title Smart Ordering System

echo Starting AI-Smart Ordering System...
echo.

:: Start backend in a new window
start "Smart Ordering - Backend" cmd /k "cd /d D:\Smart Ordering\backend && node src\index.js"

:: Wait 4 seconds for backend to initialise
timeout /t 4 /nobreak > nul

:: Start frontend in a new window
start "Smart Ordering - Frontend" cmd /k "cd /d D:\Smart Ordering\frontend && npm run dev"

:: Wait 5 seconds for frontend to be ready
timeout /t 5 /nobreak > nul

:: Open browser
start http://localhost:5173

echo.
echo Both servers started! Browser opening...
echo You can minimise the two black server windows - do NOT close them.
