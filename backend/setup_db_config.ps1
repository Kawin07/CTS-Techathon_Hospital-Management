# Healthcare Management System - Database Setup Helper
# This script helps you configure the database connection

Write-Host "🏥 Healthcare Management System - Database Setup" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Green
Write-Host ""

$envFile = "D:\Work\CTS\code\backend\.env"

Write-Host "📋 Current Configuration:" -ForegroundColor Yellow
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match "^DB_" } | ForEach-Object {
        if ($_ -match "DB_PASSWORD=") {
            $parts = $_ -split "=", 2
            Write-Host "   $($parts[0])=****" -ForegroundColor White
        } else {
            Write-Host "   $_" -ForegroundColor White
        }
    }
} else {
    Write-Host "   .env file not found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔧 To fix the database connection issue:" -ForegroundColor Cyan
Write-Host "1. You need to set your MySQL root password in the .env file" -ForegroundColor White
Write-Host "2. Edit the file: backend\.env" -ForegroundColor White
Write-Host "3. Change the line: DB_PASSWORD=your_mysql_password_here" -ForegroundColor White
Write-Host "4. To: DB_PASSWORD=your_actual_password" -ForegroundColor White
Write-Host ""

# Test if we can connect to MySQL
Write-Host "🔍 Testing MySQL availability..." -ForegroundColor Yellow
$mysqlTest = Get-Command mysql -ErrorAction SilentlyContinue
if ($mysqlTest) {
    Write-Host "✅ MySQL is available" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Available databases:" -ForegroundColor Cyan
    Write-Host "   (Run 'mysql -u root -p' and enter your password to see databases)" -ForegroundColor Gray
} else {
    Write-Host "⚠️  MySQL command not found in PATH" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 After setting the password:" -ForegroundColor Cyan
Write-Host "   python app.py          # Start the full backend server" -ForegroundColor White
Write-Host "   python simple_main.py  # Start the simple backend server" -ForegroundColor White
Write-Host ""

# Offer to open the .env file for editing
$editFile = Read-Host "Do you want to open the .env file for editing? (y/N)"
if ($editFile -match "^[Yy]$") {
    if (Test-Path $envFile) {
        try {
            notepad $envFile
            Write-Host "✅ Opened .env file in Notepad" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Could not open Notepad. Please edit manually: $envFile" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ .env file not found: $envFile" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "💡 Remember:" -ForegroundColor Blue
Write-Host "   - The password should be the same one you use to login to MySQL" -ForegroundColor White
Write-Host "   - Don't use quotes around the password in the .env file" -ForegroundColor White
Write-Host "   - Example: DB_PASSWORD=mypassword123" -ForegroundColor White