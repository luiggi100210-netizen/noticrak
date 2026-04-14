@echo off
echo ================================
echo   NOTICRACK — BUILD Y DEPLOY
echo ================================
cd C:\dev\noticrack\frontend
call npm run build
echo.
echo Build listo en: frontend\out\
echo Sube esa carpeta al cPanel con FileZilla
echo.
echo FTP Host: 198.58.106.39
echo Usuario:  noticrac
echo Carpeta destino: public_html\
echo ================================
pause
