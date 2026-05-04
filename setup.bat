@echo off
echo ============================================
echo QEase - Smart Queue Management System
echo Setup Wizard
echo ============================================
echo.

echo Step 1: Installing Backend Dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo Step 2: Installing Frontend Dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo ============================================
echo Installation Complete!
echo ============================================
echo.
echo Next Steps:
echo 1. Create backend\.env file (see QUICKSTART.md)
echo 2. Create frontend\.env file (see QUICKSTART.md)
echo 3. Start MongoDB or configure MongoDB Atlas
echo 4. Run: npm run dev in backend folder
echo 5. Run: npm run dev in frontend folder
echo.
echo See QUICKSTART.md for detailed instructions
echo ============================================
pause
