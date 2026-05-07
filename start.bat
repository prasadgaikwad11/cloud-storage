@echo off
echo ===================================================
echo    CloudVault - Cloud Based File Storage System
echo ===================================================
echo.

:: Check for Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found in PATH.
    echo Please ensure Node.js is installed and in your PATH.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js found: 
node --version
echo.

:: Check if node_modules exists
if not exist "backend\node_modules" (
    echo [INFO] Installing backend dependencies...
    cd backend
    npm install
    cd ..
    echo.
)

echo [INFO] Starting CloudVault backend server...
echo [INFO] API will be available at: http://localhost:5000/api
echo.
echo [HINT] Open frontend\index.html in a browser or serve with Live Server.
echo [HINT] Make sure your .env file is configured with AWS + MongoDB credentials.
echo.
echo Press Ctrl+C to stop the server.
echo.

cd backend
node server.js
