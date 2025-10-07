# Healthcare Management System Setup Script for Windows
# This script sets up the complete FHIR-compliant healthcare system

Write-Host "🏥 Healthcare Management System Setup" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check for required tools
Write-Host "🔍 Checking system requirements..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ and try again." -ForegroundColor Red
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version 2>$null
    if (-not $pythonVersion) {
        $pythonVersion = python3 --version 2>$null
    }
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed. Please install Python 3.8+ and try again." -ForegroundColor Red
    exit 1
}

# Check MySQL
try {
    mysql --version 2>$null | Out-Null
    Write-Host "✅ MySQL found" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MySQL is not found. Make sure MySQL is installed and accessible." -ForegroundColor Yellow
}

Write-Host "✅ System requirements check completed" -ForegroundColor Green
Write-Host ""

# Setup frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Setup backend
Write-Host "🐍 Setting up Python backend..." -ForegroundColor Yellow
Set-Location backend

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment and install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

python -m pip install --upgrade pip
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python dependencies installed" -ForegroundColor Green

Set-Location ..

# Database setup
Write-Host ""
Write-Host "🗄️  Database Setup" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating environment configuration..." -ForegroundColor Yellow
    @"
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=healthcare_db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=True

# Security
SECRET_KEY=healthcare-system-secret-key-change-in-production
"@ | Out-File -FilePath "backend\.env" -Encoding UTF8
    Write-Host "✅ Environment file created at backend\.env" -ForegroundColor Green
    Write-Host "⚠️  Please update the database credentials in backend\.env if needed" -ForegroundColor Yellow
} else {
    Write-Host "✅ Environment file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "📊 Database Schema Setup" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is accessible
Write-Host "Checking MySQL connection..." -ForegroundColor Yellow
try {
    mysql --version 2>$null | Out-Null
    Write-Host "✅ MySQL is accessible" -ForegroundColor Green
    
    # Prompt for database setup
    $setupDb = Read-Host "Do you want to create/reset the database schema? (y/N)"
    if ($setupDb -match "^[Yy]$") {
        Write-Host "Setting up database schema..." -ForegroundColor Yellow
        
        # Create database
        Write-Host "Please enter your MySQL root password when prompted..." -ForegroundColor Yellow
        mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS healthcare_db;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database created/verified" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Could not create database. Please create 'healthcare_db' manually." -ForegroundColor Yellow
        }
        
        # Run schema
        mysql -u root -p healthcare_db -e "source database/enhanced-fhir-schema.sql" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database schema created" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Could not create schema. Please run database/enhanced-fhir-schema.sql manually." -ForegroundColor Yellow
        }
    } else {
        Write-Host "⏭️  Skipping database setup" -ForegroundColor Blue
    }
} catch {
    Write-Host "⚠️  MySQL not accessible. Please set up the database manually using:" -ForegroundColor Yellow
    Write-Host "   1. Create database: CREATE DATABASE healthcare_db;" -ForegroundColor White
    Write-Host "   2. Run schema: mysql healthcare_db < database/enhanced-fhir-schema.sql" -ForegroundColor White
}

Write-Host ""
Write-Host "🎲 Sample Data Generation" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

$generateData = Read-Host "Do you want to generate sample healthcare data (2010-2025)? This may take several minutes. (y/N)"
if ($generateData -match "^[Yy]$") {
    Write-Host "Generating comprehensive healthcare data..." -ForegroundColor Yellow
    Write-Host "This includes:" -ForegroundColor White
    Write-Host "  - 10,000 realistic patients" -ForegroundColor White
    Write-Host "  - Medical conditions based on real disease trends" -ForegroundColor White
    Write-Host "  - 500 healthcare staff members" -ForegroundColor White
    Write-Host "  - Hospital infrastructure (wards, beds, oxygen stations)" -ForegroundColor White
    Write-Host "  - 15 years of seasonal disease patterns" -ForegroundColor White
    Write-Host "  - Healthcare statistics (2010-2025)" -ForegroundColor White
    Write-Host ""
    
    Set-Location backend
    & "venv\Scripts\Activate.ps1"
    python ..\scripts\generate-fhir-data.py
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Sample data generated successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Sample data generation had issues. Check the output above." -ForegroundColor Yellow
    }
    
    Set-Location ..
} else {
    Write-Host "⏭️  Skipping sample data generation" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🚀 Setup Complete!" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green
Write-Host ""
Write-Host "Your Healthcare Management System is ready! Here's how to start:" -ForegroundColor White
Write-Host ""
Write-Host "1. Start the backend API server:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "   python main.py" -ForegroundColor White
Write-Host "   # API will be available at http://localhost:8000" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the frontend development server (in a new terminal):" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "   # Frontend will be available at http://localhost:5173 (or next available port)" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 API Documentation:" -ForegroundColor Cyan
Write-Host "   - Interactive docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   - Health check: http://localhost:8000/health" -ForegroundColor White
Write-Host "   - Dashboard summary: http://localhost:8000/dashboard/summary" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Configuration:" -ForegroundColor Cyan
Write-Host "   - Backend config: backend\.env" -ForegroundColor White
Write-Host "   - Database schema: database\enhanced-fhir-schema.sql" -ForegroundColor White
Write-Host "   - Frontend config: package.json, vite.config.ts" -ForegroundColor White
Write-Host ""
Write-Host "📈 Features Available:" -ForegroundColor Cyan
Write-Host "   - 15 years of realistic healthcare data (2010-2025)" -ForegroundColor White
Write-Host "   - FHIR-compliant patient records" -ForegroundColor White
Write-Host "   - Real-time oxygen monitoring" -ForegroundColor White
Write-Host "   - Disease trend analytics" -ForegroundColor White
Write-Host "   - Staff management" -ForegroundColor White
Write-Host "   - Hospital infrastructure management" -ForegroundColor White
Write-Host ""

if ($generateData -match "^[Yy]$") {
    Write-Host "📊 Sample Data Summary:" -ForegroundColor Cyan
    Write-Host "   - Patients: ~10,000 with realistic demographics" -ForegroundColor White
    Write-Host "   - Medical conditions: Based on real disease trends" -ForegroundColor White
    Write-Host "   - Staff: ~500 healthcare professionals" -ForegroundColor White
    Write-Host "   - Infrastructure: Wards, beds, and oxygen stations" -ForegroundColor White
    Write-Host "   - Historical data: Disease patterns, outbreaks, statistics" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 Ready to go! Start both servers and visit the frontend to explore your healthcare system." -ForegroundColor Green
Write-Host ""