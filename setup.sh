#!/bin/bash
# Healthcare Management System Setup Script
# This script sets up the complete FHIR-compliant healthcare system

echo "🏥 Healthcare Management System Setup"
echo "===================================="
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check for required tools
echo "🔍 Checking system requirements..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Python
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check MySQL
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL is not found. Make sure MySQL is installed and accessible."
fi

echo "✅ System requirements check completed"
echo ""

# Setup frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed"
    exit 1
fi
echo "✅ Frontend dependencies installed"
echo ""

# Setup backend
echo "🐍 Setting up Python backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create virtual environment"
        exit 1
    fi
    echo "✅ Virtual environment created"
fi

# Activate virtual environment and install dependencies
echo "Installing Python dependencies..."
source venv/bin/activate 2>/dev/null || venv\Scripts\activate.bat

pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Python dependency installation failed"
    exit 1
fi
echo "✅ Python dependencies installed"

cd ..

# Database setup
echo ""
echo "🗄️  Database Setup"
echo "=================="
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "Creating environment configuration..."
    cat > backend/.env << EOL
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
EOL
    echo "✅ Environment file created at backend/.env"
    echo "⚠️  Please update the database credentials in backend/.env if needed"
else
    echo "✅ Environment file already exists"
fi

echo ""
echo "📊 Database Schema Setup"
echo "======================="
echo ""

# Check if MySQL is accessible
echo "Checking MySQL connection..."
mysql --version > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ MySQL is accessible"
    
    # Prompt for database setup
    read -p "Do you want to create/reset the database schema? (y/N): " setup_db
    if [[ $setup_db =~ ^[Yy]$ ]]; then
        echo "Setting up database schema..."
        
        # Create database
        mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS healthcare_db;" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✅ Database created/verified"
        else
            echo "⚠️  Could not create database. Please create 'healthcare_db' manually."
        fi
        
        # Run schema
        mysql -u root -p healthcare_db < database/enhanced-fhir-schema.sql 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✅ Database schema created"
        else
            echo "⚠️  Could not create schema. Please run database/enhanced-fhir-schema.sql manually."
        fi
    else
        echo "⏭️  Skipping database setup"
    fi
else
    echo "⚠️  MySQL not accessible. Please set up the database manually using:"
    echo "   1. Create database: CREATE DATABASE healthcare_db;"
    echo "   2. Run schema: mysql healthcare_db < database/enhanced-fhir-schema.sql"
fi

echo ""
echo "🎲 Sample Data Generation"
echo "========================="
echo ""

read -p "Do you want to generate sample healthcare data (2010-2025)? This may take several minutes. (y/N): " generate_data
if [[ $generate_data =~ ^[Yy]$ ]]; then
    echo "Generating comprehensive healthcare data..."
    echo "This includes:"
    echo "  - 10,000 realistic patients"
    echo "  - Medical conditions based on real disease trends"
    echo "  - 500 healthcare staff members"
    echo "  - Hospital infrastructure (wards, beds, oxygen stations)"
    echo "  - 15 years of seasonal disease patterns"
    echo "  - Healthcare statistics (2010-2025)"
    echo ""
    
    cd backend
    source venv/bin/activate 2>/dev/null || venv\Scripts\activate.bat
    python ../scripts/generate-fhir-data.py
    
    if [ $? -eq 0 ]; then
        echo "✅ Sample data generated successfully"
    else
        echo "⚠️  Sample data generation had issues. Check the output above."
    fi
    
    cd ..
else
    echo "⏭️  Skipping sample data generation"
fi

echo ""
echo "🚀 Setup Complete!"
echo "=================="
echo ""
echo "Your Healthcare Management System is ready! Here's how to start:"
echo ""
echo "1. Start the backend API server:"
echo "   cd backend"
echo "   source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "   python main.py"
echo "   # API will be available at http://localhost:8000"
echo ""
echo "2. Start the frontend development server (in a new terminal):"
echo "   npm run dev"
echo "   # Frontend will be available at http://localhost:5173 (or next available port)"
echo ""
echo "📚 API Documentation:"
echo "   - Interactive docs: http://localhost:8000/docs"
echo "   - Health check: http://localhost:8000/health"
echo "   - Dashboard summary: http://localhost:8000/dashboard/summary"
echo ""
echo "🔧 Configuration:"
echo "   - Backend config: backend/.env"
echo "   - Database schema: database/enhanced-fhir-schema.sql"
echo "   - Frontend config: package.json, vite.config.ts"
echo ""
echo "📈 Features Available:"
echo "   - 15 years of realistic healthcare data (2010-2025)"
echo "   - FHIR-compliant patient records"
echo "   - Real-time oxygen monitoring"
echo "   - Disease trend analytics"
echo "   - Staff management"
echo "   - Hospital infrastructure management"
echo ""

if [[ $generate_data =~ ^[Yy]$ ]]; then
echo "📊 Sample Data Summary:"
echo "   - Patients: ~10,000 with realistic demographics"
echo "   - Medical conditions: Based on real disease trends"
echo "   - Staff: ~500 healthcare professionals"
echo "   - Infrastructure: Wards, beds, and oxygen stations"
echo "   - Historical data: Disease patterns, outbreaks, statistics"
fi

echo ""
echo "🎉 Ready to go! Start both servers and visit the frontend to explore your healthcare system."
echo ""