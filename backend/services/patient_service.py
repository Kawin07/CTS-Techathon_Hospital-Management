from typing import Optional, List
from datetime import datetime
import logging
from config.database import execute_query, execute_insert, execute_update
from models.database import (
    Patient, CreatePatient, UpdatePatient, PatientFilter,
    PaginationParams, PaginatedResult, DatabaseResult
)

logger = logging.getLogger(__name__)

class PatientService:
    """Service class for patient operations"""
    
    @staticmethod
    def create(patient_data: CreatePatient) -> DatabaseResult:
        """Create a new patient"""
        try:
            query = """
                INSERT INTO patients (
                    patient_number, first_name, last_name, date_of_birth, gender,
                    phone, email, address, emergency_contact_name, emergency_contact_phone,
                    blood_type, allergies, medical_history, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            params = [
                patient_data.patient_number,
                patient_data.first_name,
                patient_data.last_name,
                patient_data.date_of_birth,
                patient_data.gender,
                patient_data.phone,
                patient_data.email,
                patient_data.address,
                patient_data.emergency_contact_name,
                patient_data.emergency_contact_phone,
                patient_data.blood_type,
                patient_data.allergies,
                patient_data.medical_history,
                patient_data.status
            ]
            
            insert_id = execute_insert(query, params)
            
            # Fetch the created patient
            created_patient = PatientService.find_by_id(insert_id)
            
            return DatabaseResult(
                success=True,
                data=created_patient.data,
                insert_id=insert_id
            )
            
        except Exception as e:
            logger.error(f"Error creating patient: {e}")
            return DatabaseResult(
                success=False,
                error=str(e)
            )
    
    @staticmethod
    def find_by_id(patient_id: int) -> DatabaseResult:
        """Find patient by ID"""
        try:
            query = "SELECT * FROM patients WHERE patient_id = %s"
            patients = execute_query(query, [patient_id])
            
            if not patients:
                return DatabaseResult(
                    success=False,
                    error="Patient not found"
                )
            
            patient_dict = patients[0]
            patient = Patient(**patient_dict)
            
            return DatabaseResult(
                success=True,
                data=patient
            )
            
        except Exception as e:
            logger.error(f"Error finding patient by ID: {e}")
            return DatabaseResult(
                success=False,
                error=str(e)
            )
    
    @staticmethod
    def find_by_patient_number(patient_number: str) -> DatabaseResult:
        """Find patient by patient number"""
        try:
            query = "SELECT * FROM patients WHERE patient_number = %s"
            patients = execute_query(query, [patient_number])
            
            if not patients:
                return DatabaseResult(
                    success=False,
                    error="Patient not found"
                )
            
            patient_dict = patients[0]
            patient = Patient(**patient_dict)
            
            return DatabaseResult(
                success=True,
                data=patient
            )
            
        except Exception as e:
            logger.error(f"Error finding patient by number: {e}")
            return DatabaseResult(
                success=False,
                error=str(e)
            )
    
    @staticmethod
    def find_all(filters: PatientFilter = None, pagination: PaginationParams = None) -> DatabaseResult:
        """Get all patients with filtering and pagination"""
        try:
            if filters is None:
                filters = PatientFilter()
            if pagination is None:
                pagination = PaginationParams()
            
            # Build WHERE clause
            where_conditions = []
            params = []
            
            if filters.status:
                where_conditions.append("status = %s")
                params.append(filters.status)
            
            if filters.gender:
                where_conditions.append("gender = %s")
                params.append(filters.gender)
            
            if filters.blood_type:
                where_conditions.append("blood_type = %s")
                params.append(filters.blood_type)
            
            if filters.search:
                where_conditions.append(
                    "(first_name LIKE %s OR last_name LIKE %s OR patient_number LIKE %s)"
                )
                search_term = f"%{filters.search}%"
                params.extend([search_term, search_term, search_term])
            
            where_clause = ""
            if where_conditions:
                where_clause = "WHERE " + " AND ".join(where_conditions)
            
            # Count query
            count_query = f"SELECT COUNT(*) as total FROM patients {where_clause}"
            count_result = execute_query(count_query, params)
            total = count_result[0]['total']
            
            # Data query with pagination
            offset = (pagination.page - 1) * pagination.limit
            data_query = f"""
                SELECT * FROM patients {where_clause}
                ORDER BY {pagination.sort_by} {pagination.sort_order}
                LIMIT %s OFFSET %s
            """
            data_params = params + [pagination.limit, offset]
            
            patients_data = execute_query(data_query, data_params)
            patients = [Patient(**p) for p in patients_data]
            
            total_pages = (total + pagination.limit - 1) // pagination.limit
            
            result = PaginatedResult(
                data=patients,
                total=total,
                page=pagination.page,
                limit=pagination.limit,
                total_pages=total_pages
            )
            
            return DatabaseResult(
                success=True,
                data=result
            )
            
        except Exception as e:
            logger.error(f"Error finding all patients: {e}")
            return DatabaseResult(
                success=False,
                error=str(e)
            )
    
    @staticmethod
    def update(patient_id: int, update_data: UpdatePatient) -> DatabaseResult:
        """Update patient"""
        try:
            # Build update query dynamically
            update_fields = []
            params = []
            
            for field, value in update_data.__dict__.items():
                if value is not None:
                    update_fields.append(f"{field} = %s")
                    params.append(value)
            
            if not update_fields:
                return DatabaseResult(
                    success=False,
                    error="No fields to update"
                )
            
            params.append(patient_id)
            
            query = f"""
                UPDATE patients 
                SET {', '.join(update_fields)}, updated_at = NOW()
                WHERE patient_id = %s
            """
            
            affected_rows = execute_update(query, params)
            
            if affected_rows == 0:
                return DatabaseResult(
                    success=False,
                    error="Patient not found or no changes made"
                )
            
            # Fetch updated patient
            updated_patient = PatientService.find_by_id(patient_id)
            
            return DatabaseResult(
                success=True,
                data=updated_patient.data
            )
            
        except Exception as e:
            logger.error(f"Error updating patient: {e}")
            return DatabaseResult(
                success=False,
                error=str(e)
            )
    
    @staticmethod
    def delete(patient_id: int) -> DatabaseResult:
        """Delete patient (soft delete by setting status to 'deleted')"""
        try:
            query = "UPDATE patients SET status = 'deleted', updated_at = NOW() WHERE patient_id = %s"
            affected_rows = execute_update(query, [patient_id])
            
            if affected_rows == 0:
                return DatabaseResult(
                    success=False,
                    error="Patient not found"
                )
            
            return DatabaseResult(
                success=True,
                data={"deleted": True}
            )
            
        except Exception as e:
            logger.error(f"Error deleting patient: {e}")
            return DatabaseResult(
                success=False,
                error=str(e)
            )
    
    @staticmethod
    def get_statistics() -> DatabaseResult:
        """Get patient statistics"""
        try:
            stats_query = """
                SELECT 
                    COUNT(*) as total_patients,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_patients,
                    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_patients,
                    COUNT(CASE WHEN status = 'admitted' THEN 1 END) as admitted_patients,
                    COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_patients,
                    COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_patients,
                    COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as new_today
                FROM patients 
                WHERE status != 'deleted'
            """
            
            result = execute_query(stats_query)
            stats = result[0] if result else {}
            
            return DatabaseResult(
                success=True,
                data=stats
            )
            
        except Exception as e:
            logger.error(f"Error getting patient statistics: {e}")
            return DatabaseResult(
                success=False,
                error=str(e)
            )