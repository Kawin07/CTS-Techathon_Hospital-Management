from typing import Dict, Any, Optional, List
from datetime import datetime
from dataclasses import dataclass

@dataclass
class DatabaseResult:
    """Standard database operation result"""
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    insert_id: Optional[int] = None

@dataclass
class PaginationParams:
    """Pagination parameters"""
    page: int = 1
    limit: int = 50
    sort_by: str = 'id'
    sort_order: str = 'ASC'

@dataclass
class PaginatedResult:
    """Paginated result wrapper"""
    data: List[Any]
    total: int
    page: int
    limit: int
    total_pages: int

# Patient related types
@dataclass
class Patient:
    patient_id: int
    patient_number: str
    first_name: str
    last_name: str
    date_of_birth: datetime
    gender: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None
    status: str = 'active'
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class CreatePatient:
    patient_number: str
    first_name: str
    last_name: str
    date_of_birth: datetime
    gender: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None
    status: str = 'active'

@dataclass
class UpdatePatient:
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None
    status: Optional[str] = None

@dataclass
class PatientFilter:
    status: Optional[str] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    search: Optional[str] = None

# Oxygen related types
@dataclass
class OxygenStation:
    station_id: int
    station_name: str
    location: str
    capacity_liters: float
    current_level: float
    pressure_psi: Optional[float] = None
    flow_rate: Optional[float] = None
    status: str = 'operational'
    last_refill: Optional[datetime] = None
    next_maintenance: Optional[datetime] = None
    supplier: Optional[str] = None
    alerts_enabled: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class CreateOxygenStation:
    station_name: str
    location: str
    capacity_liters: float
    current_level: float
    pressure_psi: Optional[float] = None
    flow_rate: Optional[float] = None
    status: str = 'operational'
    last_refill: Optional[datetime] = None
    next_maintenance: Optional[datetime] = None
    supplier: Optional[str] = None
    alerts_enabled: bool = True

@dataclass
class UpdateOxygenStation:
    station_name: Optional[str] = None
    location: Optional[str] = None
    capacity_liters: Optional[float] = None
    current_level: Optional[float] = None
    pressure_psi: Optional[float] = None
    flow_rate: Optional[float] = None
    status: Optional[str] = None
    last_refill: Optional[datetime] = None
    next_maintenance: Optional[datetime] = None
    supplier: Optional[str] = None
    alerts_enabled: Optional[bool] = None

@dataclass
class OxygenReading:
    reading_id: int
    station_id: int
    level_liters: float
    pressure_psi: Optional[float] = None
    flow_rate: Optional[float] = None
    temperature: Optional[float] = None
    timestamp: Optional[datetime] = None

@dataclass
class CreateOxygenReading:
    station_id: int
    level_liters: float
    pressure_psi: Optional[float] = None
    flow_rate: Optional[float] = None
    temperature: Optional[float] = None

@dataclass
class OxygenStationFilter:
    status: Optional[str] = None
    location: Optional[str] = None
    low_level_threshold: Optional[float] = None

@dataclass
class OxygenStatusSummary:
    total_stations: int
    operational_stations: int
    maintenance_stations: int
    offline_stations: int
    total_capacity: float
    total_current_level: float
    average_fill_percentage: float
    low_level_alerts: int