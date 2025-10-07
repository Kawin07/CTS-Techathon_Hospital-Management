from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
import uvicorn

load_dotenv()

# Simple FastAPI app for testing
app = FastAPI(
    title="Healthcare Management System API",
    description="FHIR-compliant healthcare management system with comprehensive patient and hospital management features",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Healthcare Management System API", "status": "online", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2025-01-25T14:30:00Z",
        "api_version": "1.0.0",
        "database_status": "pending_configuration"
    }

@app.get("/dashboard/summary")
async def get_dashboard_summary():
    """Get dashboard summary with mock data"""
    return {
        "total_patients": 0,
        "active_staff": 0,
        "available_beds": 100,
        "oxygen_stations": 10,
        "critical_alerts": 0,
        "system_status": "online"
    }

@app.get("/patients")
async def get_patients():
    """Get list of patients (mock data)"""
    return {
        "patients": [],
        "total": 0,
        "message": "Database not configured. Please set up MySQL connection."
    }

if __name__ == "__main__":
    host = os.getenv("API_HOST", "127.0.0.1")
    port = int(os.getenv("API_PORT", 8000))
    
    print("🏥 Healthcare Management System API")
    print("=" * 40)
    print(f"🚀 Starting server on http://{host}:{port}")
    print(f"📚 API Documentation: http://{host}:{port}/docs")
    print(f"🔍 Health Check: http://{host}:{port}/health")
    print("=" * 40)
    
    uvicorn.run(app, host=host, port=port, reload=False)