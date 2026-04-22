@echo off
echo Starting Crit 2048 Local Web Server...
echo.
echo Browsers restrict accessing local HTML files from other local HTML files directly.
echo This server temporarily bypasses those limits for safe local building.
echo.
echo Press Ctrl+C to stop the server at any time.
echo.
start http://localhost:8080
python -m http.server 8080
