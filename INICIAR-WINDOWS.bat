@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
 start "" http://localhost:8000
 py -m http.server 8000 --bind 0.0.0.0
) else (
 where python >nul 2>nul
 if %errorlevel%==0 (
  start "" http://localhost:8000
  python -m http.server 8000 --bind 0.0.0.0
 ) else (
  echo Necesitas Python 3 o Node.js. Con Node ejecuta npm start en esta carpeta.
  pause
 )
)
