from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
from pydantic import BaseModel, Field
import json
from contextlib import asynccontextmanager

load_dotenv()

# Pydantic models for API responses
class Patient(BaseModel):
    patient_id: int
    identifier: str
    given_name: str
    family_name: str
    full_name: str
    birth_date: date
    age: int
    gender: str
    phone: Optional[str] = None
    email: Optional[str] = None
    blood_type: Optional[str] = None
    insurance_provider: Optional[str] = None
    marital_status: Optional[str] = None

class PatientCondition(BaseModel):
    condition_id: int
    patient_id: int
    condition_code: str
    condition_name: str
    condition_category: str
    severity: str
    onset_date: date
    resolved_date: Optional[date] = None
    status: str
    diagnosed_by: Optional[str] = None

class OxygenStation(BaseModel):
    station_id: int
    station_code: str
    station_name: str
    location: str
    current_level_percentage: float
    pressure_psi: Optional[float] = None
    flow_rate_lpm: Optional[float] = None
    status: str
    patient_name: Optional[str] = None
    patient_identifier: Optional[str] = None
    assigned_staff: Optional[str] = None
    ward_name: Optional[str] = None
    bed_number: Optional[str] = None
    capacity_liters: int
    current_level_liters: int
    last_maintenance: Optional[datetime] = None
    next_maintenance_due: Optional[date] = None

class Staff(BaseModel):
    staff_id: str
    given_name: str
    family_name: str
    full_name: str
    role: str
    department: str
    status: str
    shift: str
    email: Optional[str] = None
    phone: Optional[str] = None
    years_experience: int
    specialization: List[str] = []
    workload: int

class HealthcareStats(BaseModel):
    year_period: int
    population_total: Optional[int] = None
    life_expectancy_male: Optional[float] = None
    life_expectancy_female: Optional[float] = None
    obesity_rate: Optional[float] = None
    diabetes_prevalence: Optional[float] = None
    hypertension_prevalence: Optional[float] = None
    healthcare_spending_per_capita: Optional[float] = None

class DiseasePattern(BaseModel):
    pattern_id: int
    year_period: int
    month_period: int
    disease_category: str
    disease_name: str
    icd10_code: Optional[str] = None
    cases_per_100k: int
    mortality_rate: Optional[float] = None

# Database connection manager
class DatabaseManager:
    def __init__(self):
        self.config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 3306)),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_NAME', 'healthcare_db'),
            'pool_name': 'healthcare_pool',
            'pool_size': 10,
            'pool_reset_session': True,
            'autocommit': True
        }
        self.pool = None
    
    def create_pool(self):
        try:
            self.pool = mysql.connector.pooling.MySQLConnectionPool(**self.config)
            print("✅ Database connection pool created")
        except Error as e:
            print(f"❌ Error creating connection pool: {e}")
            raise
    
    def get_connection(self):
        if not self.pool:
            self.create_pool()
        return self.pool.get_connection()
    
    def execute_query(self, query: str, params: tuple = None, fetch_one: bool = False, fetch_all: bool = True):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(dictionary=True)
            
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            if fetch_one:
                return cursor.fetchone()
            elif fetch_all:
                return cursor.fetchall()
            else:
                return cursor.rowcount
                
        except Error as e:
            print(f"❌ Database error: {e}")
            print(f"Query: {query}")
            if params:
                print(f"Params: {params}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

# Global database manager
db_manager = DatabaseManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    db_manager.create_pool()
    yield
    # Shutdown
    if db_manager.pool:
        db_manager.pool._remove_connections()

# FastAPI app with lifespan management
app = FastAPI(
    title="Healthcare Data API",
    description="FHIR-compliant Healthcare Management System API with 15 years of realistic data (2010-2025)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/", tags=["Health Check"])
async def root():
    return {
        "message": "Healthcare Data API",
        "version": "1.0.0",
        "status": "operational",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health", tags=["Health Check"])
async def health_check():
    try:
        # Test database connection
        result = db_manager.execute_query("SELECT 1 as test", fetch_one=True)
        db_status = "connected" if result else "disconnected"
    except:
        db_status = "error"
    
    return {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "database": db_status,
        "timestamp": datetime.now().isoformat()
    }

# Patient endpoints
@app.get("/patients", response_model=List[Patient], tags=["Patients"])
async def get_patients(
    limit: int = Query(100, ge=1, le=1000, description="Number of patients to retrieve"),
    offset: int = Query(0, ge=0, description="Number of patients to skip"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    age_min: Optional[int] = Query(None, ge=0, le=120, description="Minimum age"),
    age_max: Optional[int] = Query(None, ge=0, le=120, description="Maximum age"),
    blood_type: Optional[str] = Query(None, description="Filter by blood type"),
    search: Optional[str] = Query(None, description="Search by name or identifier")
):
    query = """
    SELECT 
        patient_id,
        identifier,
        given_name,
        family_name,
        CONCAT(given_name, ' ', family_name) as full_name,
        birth_date,
        TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) as age,
        gender,
        phone,
        email,
        blood_type,
        insurance_provider,
        marital_status
    FROM fhir_patients 
    WHERE is_active = TRUE
    """
    
    params = []
    
    if gender:
        query += " AND gender = %s"
        params.append(gender)
    
    if age_min is not None:
        query += " AND TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) >= %s"
        params.append(age_min)
    
    if age_max is not None:
        query += " AND TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) <= %s"
        params.append(age_max)
    
    if blood_type:
        query += " AND blood_type = %s"
        params.append(blood_type)
    
    if search:
        query += " AND (CONCAT(given_name, ' ', family_name) LIKE %s OR identifier LIKE %s)"
        search_param = f"%{search}%"
        params.extend([search_param, search_param])
    
    query += " ORDER BY patient_id LIMIT %s OFFSET %s"
    params.extend([limit, offset])
    
    patients = db_manager.execute_query(query, tuple(params))
    return [Patient(**patient) for patient in patients]

@app.get("/patients/{patient_id}", response_model=Patient, tags=["Patients"])
async def get_patient(patient_id: int):
    query = """
    SELECT 
        patient_id,
        identifier,
        given_name,
        family_name,
        CONCAT(given_name, ' ', family_name) as full_name,
        birth_date,
        TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) as age,
        gender,
        phone,
        email,
        blood_type,
        insurance_provider,
        marital_status,
        address_line,
        address_city,
        address_state,
        emergency_contact_name,
        emergency_contact_phone
    FROM fhir_patients 
    WHERE patient_id = %s AND is_active = TRUE
    """
    
    patient = db_manager.execute_query(query, (patient_id,), fetch_one=True)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return Patient(**patient)

@app.get("/patients/{patient_id}/conditions", response_model=List[PatientCondition], tags=["Patients"])
async def get_patient_conditions(patient_id: int):
    query = """
    SELECT * FROM patient_conditions 
    WHERE patient_id = %s 
    ORDER BY onset_date DESC
    """
    
    conditions = db_manager.execute_query(query, (patient_id,))
    return [PatientCondition(**condition) for condition in conditions]

# Oxygen monitoring endpoints
@app.get("/oxygen-stations", response_model=List[OxygenStation], tags=["Oxygen Monitoring"])
async def get_oxygen_stations(
    status: Optional[str] = Query(None, description="Filter by status"),
    ward_id: Optional[int] = Query(None, description="Filter by ward ID"),
    low_level_only: bool = Query(False, description="Show only low/critical levels")
):
    query = """
    SELECT 
        os.station_id,
        os.station_code,
        os.station_name,
        os.location,
        os.current_level_percentage,
        os.pressure_psi,
        os.flow_rate_lpm,
        os.status,
        os.capacity_liters,
        os.current_level_liters,
        os.last_maintenance,
        os.next_maintenance_due,
        CASE 
            WHEN p.patient_id IS NOT NULL THEN CONCAT(p.given_name, ' ', p.family_name)
            ELSE NULL
        END as patient_name,
        p.identifier as patient_identifier,
        CASE 
            WHEN s.staff_id IS NOT NULL THEN CONCAT(s.given_name, ' ', s.family_name)
            ELSE NULL
        END as assigned_staff,
        w.ward_name,
        b.bed_number
    FROM oxygen_stations os
    LEFT JOIN fhir_patients p ON os.patient_id = p.patient_id
    LEFT JOIN staff s ON os.assigned_staff_id = s.staff_id
    LEFT JOIN wards w ON os.ward_id = w.ward_id
    LEFT JOIN beds b ON os.bed_id = b.bed_id
    WHERE 1=1
    """
    
    params = []
    
    if status:
        query += " AND os.status = %s"
        params.append(status)
    
    if ward_id:
        query += " AND os.ward_id = %s"
        params.append(ward_id)
    
    if low_level_only:
        query += " AND os.current_level_percentage <= 30"
    
    query += " ORDER BY os.station_code"
    
    stations = db_manager.execute_query(query, tuple(params) if params else None)
    return [OxygenStation(**station) for station in stations]

@app.put("/oxygen-stations/{station_id}/level", tags=["Oxygen Monitoring"])
async def update_oxygen_level(station_id: int, new_level_liters: int):
    # First check if station exists
    check_query = "SELECT capacity_liters FROM oxygen_stations WHERE station_id = %s"
    station = db_manager.execute_query(check_query, (station_id,), fetch_one=True)
    
    if not station:
        raise HTTPException(status_code=404, detail="Oxygen station not found")
    
    capacity = station['capacity_liters']
    if new_level_liters > capacity:
        raise HTTPException(status_code=400, detail="Level cannot exceed capacity")
    
    # Update oxygen level and status
    update_query = """
    UPDATE oxygen_stations 
    SET current_level_liters = %s,
        status = CASE 
            WHEN (%s / capacity_liters) * 100 <= alert_threshold_critical THEN 'critical'
            WHEN (%s / capacity_liters) * 100 <= alert_threshold_low THEN 'low'
            ELSE 'normal'
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE station_id = %s
    """
    
    db_manager.execute_query(update_query, (new_level_liters, new_level_liters, new_level_liters, station_id), fetch_all=False)
    
    return {"message": "Oxygen level updated successfully", "new_level_liters": new_level_liters}

# Staff endpoints
@app.get("/staff", response_model=List[Staff], tags=["Staff"])
async def get_staff(
    department: Optional[str] = Query(None, description="Filter by department"),
    role: Optional[str] = Query(None, description="Filter by role"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(100, ge=1, le=500)
):
    query = """
    SELECT 
        staff_id,
        given_name,
        family_name,
        CONCAT(given_name, ' ', family_name) as full_name,
        role,
        department,
        status,
        shift,
        email,
        phone,
        years_experience,
        specialization,
        workload
    FROM staff
    WHERE 1=1
    """
    
    params = []
    
    if department:
        query += " AND department = %s"
        params.append(department)
    
    if role:
        query += " AND role = %s"
        params.append(role)
    
    if status:
        query += " AND status = %s"
        params.append(status)
    
    query += " ORDER BY family_name, given_name LIMIT %s"
    params.append(limit)
    
    staff_data = db_manager.execute_query(query, tuple(params))
    
    # Parse specialization JSON
    for staff_member in staff_data:
        try:
            staff_member['specialization'] = json.loads(staff_member['specialization']) if staff_member['specialization'] else []
        except:
            staff_member['specialization'] = []
    
    return [Staff(**staff_member) for staff_member in staff_data]

# Analytics endpoints
@app.get("/analytics/healthcare-stats", response_model=List[HealthcareStats], tags=["Analytics"])
async def get_healthcare_statistics(
    year_start: int = Query(2010, ge=2010, le=2025),
    year_end: int = Query(2025, ge=2010, le=2025)
):
    query = """
    SELECT * FROM healthcare_statistics
    WHERE year_period BETWEEN %s AND %s
    ORDER BY year_period
    """
    
    stats = db_manager.execute_query(query, (year_start, year_end))
    return [HealthcareStats(**stat) for stat in stats]

@app.get("/analytics/disease-patterns", response_model=List[DiseasePattern], tags=["Analytics"])
async def get_disease_patterns(
    year: Optional[int] = Query(None, ge=2010, le=2025),
    disease_category: Optional[str] = Query(None),
    disease_name: Optional[str] = Query(None),
    limit: int = Query(1000, ge=1, le=5000)
):
    query = """
    SELECT 
        pattern_id,
        year_period,
        month_period,
        disease_category,
        disease_name,
        icd10_code,
        cases_per_100k,
        mortality_rate
    FROM seasonal_disease_patterns
    WHERE 1=1
    """
    
    params = []
    
    if year:
        query += " AND year_period = %s"
        params.append(year)
    
    if disease_category:
        query += " AND disease_category = %s"
        params.append(disease_category)
    
    if disease_name:
        query += " AND disease_name LIKE %s"
        params.append(f"%{disease_name}%")
    
    query += " ORDER BY year_period, month_period, cases_per_100k DESC LIMIT %s"
    params.append(limit)
    
    patterns = db_manager.execute_query(query, tuple(params))
    return [DiseasePattern(**pattern) for pattern in patterns]

@app.get("/analytics/disease-trends/{disease_name}", tags=["Analytics"])
async def get_disease_trend(disease_name: str):
    query = """
    SELECT 
        year_period,
        SUM(cases_per_100k) as total_cases,
        AVG(mortality_rate) as avg_mortality_rate,
        COUNT(*) as data_points
    FROM seasonal_disease_patterns
    WHERE disease_name LIKE %s
    GROUP BY year_period
    ORDER BY year_period
    """
    
    trends = db_manager.execute_query(query, (f"%{disease_name}%",))
    
    if not trends:
        raise HTTPException(status_code=404, detail="Disease trend data not found")
    
    return {
        "disease_name": disease_name,
        "trend_data": trends,
        "total_years": len(trends),
        "year_range": [trends[0]['year_period'], trends[-1]['year_period']] if trends else []
    }

# Dashboard summary endpoint
@app.get("/dashboard/summary", tags=["Dashboard"])
async def get_dashboard_summary():
    # Get various counts and summaries
    queries = {
        "total_patients": "SELECT COUNT(*) as count FROM fhir_patients WHERE is_active = TRUE",
        "total_staff": "SELECT COUNT(*) as count FROM staff",
        "active_conditions": "SELECT COUNT(*) as count FROM patient_conditions WHERE status = 'active'",
        "oxygen_stations": "SELECT COUNT(*) as count FROM oxygen_stations",
        "critical_oxygen": "SELECT COUNT(*) as count FROM oxygen_stations WHERE status IN ('critical', 'low')",
        "staff_on_duty": "SELECT COUNT(*) as count FROM staff WHERE status = 'on-duty'",
        "available_beds": "SELECT COUNT(*) as count FROM beds WHERE status = 'available'",
        "occupied_beds": "SELECT COUNT(*) as count FROM beds WHERE status = 'occupied'"
    }
    
    summary = {}
    for key, query in queries.items():
        result = db_manager.execute_query(query, fetch_one=True)
        summary[key] = result['count'] if result else 0
    
    # Get recent trends
    recent_conditions_query = """
    SELECT 
        condition_category,
        COUNT(*) as count
    FROM patient_conditions 
    WHERE onset_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY condition_category
    ORDER BY count DESC
    LIMIT 5
    """
    
    recent_conditions = db_manager.execute_query(recent_conditions_query)
    summary['recent_conditions'] = recent_conditions
    
    # Oxygen status distribution
    oxygen_status_query = """
    SELECT 
        status,
        COUNT(*) as count,
        AVG(current_level_percentage) as avg_level
    FROM oxygen_stations
    GROUP BY status
    """
    
    oxygen_status = db_manager.execute_query(oxygen_status_query)
    summary['oxygen_status'] = oxygen_status
    
    return summary

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)