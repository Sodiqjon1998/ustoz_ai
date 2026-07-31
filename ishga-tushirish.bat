@echo off
chcp 65001 >nul
title USTOZ AI - Ishga tushirish
set PHP_DIR=D:\OSPanel\modules\PHP-8.3\PHP
set OSP_BAT=D:\OSPanel\bin\osp.bat
set PATH=%PHP_DIR%;C:\Program Files\nodejs;%PATH%
set GENERATOR_OUTPUT_DIR=%~dp0storage\app\private\generated
set GENERATOR_PORT=4000
cd /d %~dp0

echo ==========================================
echo  USTOZ AI - Ishga tushirish
echo ==========================================
echo.

echo [1/6] OSPanel tekshirilmoqda...
tasklist /fi "imagename eq ospanel.exe" | find /i "ospanel.exe" >nul
if errorlevel 1 (
    echo       OSPanel ishga tushirilmoqda, kuting...
    start "" "D:\OSPanel\bin\ospanel.exe"
    timeout /t 8 /nobreak >nul
) else (
    echo       OK - OSPanel allaqachon ishlamoqda.
)

echo [2/6] PostgreSQL va Redis yoqilmoqda...
call "%OSP_BAT%" on PostgreSQL-17 >nul 2>&1
call "%OSP_BAT%" on Redis-7.4 >nul 2>&1
timeout /t 2 /nobreak >nul
echo       OK.

echo [3/6] Jadvallar tekshirilmoqda (migratsiya)...
php artisan migrate --force
if errorlevel 1 (
    echo.
    echo XATO: bazaga ulanib bo'lmadi. PostgreSQL/Redis modullari yoqilganiga
    echo ishonch hosil qiling va faylni qayta ishga tushiring.
    echo.
    pause
    exit /b 1
)
echo       OK - baza tayyor.

echo [4/6] Backend (Laravel) ishga tushirilmoqda - port 8123...
start "USTOZ AI - Backend (8123)" cmd /k "cd /d %~dp0 && php artisan serve --port=8123"

echo [5/6] Fayl generatori (Node) ishga tushirilmoqda - port 4000...
start "USTOZ AI - Generator (4000)" cmd /k "cd /d %~dp0generator && node src/server.js"

echo [6/6] Frontend (React) ishga tushirilmoqda - port 5173...
start "USTOZ AI - Frontend (5173)" cmd /k "cd /d %~dp0frontend && npm run dev -- --port=5173"

timeout /t 4 /nobreak >nul

echo.
echo ==========================================
echo  TAYYOR!
echo.
echo  Brauzerda oching:  http://localhost:5173
echo.
echo  Test admin bilan kirish:
echo    Telefon: +998900000000
echo    Parol:   admin123
echo.
echo  To'xtatish uchun ochilgan uchta qora (Backend/Generator/Frontend) oynani yoping.
echo ==========================================
echo.
start http://localhost:5173
pause
