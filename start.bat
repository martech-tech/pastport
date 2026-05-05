@echo off
title Pastport Dev Server
color 0A

echo.
echo  =============================================
echo    PASTPORT — Dev Server
echo  =============================================
echo.

:: หยุด process เดิมที่ใช้ port 3000 (ถ้ามี)
echo [1/3] หยุด server เดิม (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING" 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo       เสร็จแล้ว

:: อัพเดท password เป็น 444444
echo.
echo [2/3] อัพเดท password เป็น 444444...
call npm run update-passwords
if %errorlevel% neq 0 (
    echo       [WARNING] อัพเดท password ไม่สำเร็จ — ข้ามขั้นตอนนี้
)

:: เริ่ม dev server
echo.
echo [3/3] เริ่ม Dev Server...
echo.
echo  =============================================
echo    เปิดเบราว์เซอร์: http://localhost:3000
echo    กด Ctrl+C เพื่อหยุด server
echo  =============================================
echo.

call npm run dev

:: เมื่อ Ctrl+C ถูกกด
echo.
echo  Server หยุดแล้ว
pause
