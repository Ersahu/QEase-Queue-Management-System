@echo off
echo ============================================
echo QEase - Database Reset Tool
echo ============================================
echo.
echo This will DELETE all data and create fresh demo data!
echo.
pause

echo.
echo Step 1: Dropping existing database...
mongosh --eval "db.getSiblingDB('qease').dropDatabase()"

if errorlevel 1 (
    echo.
    echo ERROR: Could not connect to MongoDB!
    echo Make sure MongoDB is running: mongod
    pause
    exit /b 1
)

echo.
echo Step 2: Creating fresh demo data...
cd backend
call npm run seed

if errorlevel 1 (
    echo.
    echo ERROR: Seeding failed!
    pause
    exit /b 1
)

echo.
echo ============================================
echo ✅ Database Reset Complete!
echo ============================================
echo.
echo Fresh demo data created:
echo - Demo Admin: demo@admin.com / demo123
echo - Demo Customer: demo@customer.com / demo123
echo - 3 Demo Queues created
echo.
echo You can now restart your application!
echo ============================================
pause
