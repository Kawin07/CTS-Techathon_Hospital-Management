from typing import Optional, List
from datetime import datetime
import logging
from config.database import execute_query, execute_insert, execute_update
from models.database import (
    OxygenStation, OxygenReading, CreateOxygenStation, CreateOxygenReading,
    UpdateOxygenStation, OxygenStationFilter, OxygenStatusSummary,
    PaginationParams, PaginatedResult, DatabaseResult
)

logger = logging.getLogger(__name__)

class OxygenService:
    """Service class for oxygen station operations"""
    
    # ============================================================================
    # OXYGEN STATION METHODS
    # ============================================================================
    
    @staticmethod
    def create_station(station_data: CreateOxygenStation) -> DatabaseResult:
        """Create new oxygen station"""
        try:
            query = """
                INSERT INTO oxygen_stations (
                    station_name, location, capacity_liters, current_level, pressure_psi,
                    flow_rate, status, last_refill, next_maintenance, supplier, alerts_enabled
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            params = [
                station_data.station_name,
                station_data.location,
                station_data.capacity_liters,
                station_data.current_level,
                station_data.pressure_psi,
                station_data.flow_rate,
                station_data.status,
                station_data.last_refill,
                station_data.next_maintenance,
                station_data.supplier,
                station_data.alerts_enabled
            ]
            
            insert_id = execute_insert(query, params)
            
            # Fetch the created station
            created_station = OxygenService.find_station_by_id(insert_id)
            
            return DatabaseResult(
                success=True,
                data=created_station.data,
                insert_id=insert_id
            )
            
        except Exception as e:
            logger.error(f"Error creating oxygen station: {e}")
            return DatabaseResult(
                success=False,
                error=str(e)
            )
    
    @staticmethod
    def find_station_by_id(station_id: int) -> DatabaseResult:
        """Find oxygen station by ID"""
        try:
            query = "SELECT * FROM oxygen_stations WHERE station_id = %s"
            stations = execute_query(query, [station_id])
            
            if not stations:
                return DatabaseResult(
                    success=False,
                    error="Oxygen station not found"
                )
            
            station_dict = stations[0]
            station = OxygenStation(**station_dict)
            
            return DatabaseResult(
                success=True,
                data=station
            )
            
        except Exception as e:
            logger.error(f"Error finding oxygen station by ID: {e}")
            return DatabaseResult(
                success=False,
                error=str(e)
            )
    
    @staticmethod
    def find_all_stations(filters: OxygenStationFilter = None, pagination: PaginationParams = None) -> DatabaseResult:
        """Get all oxygen stations with filtering"""
        try:
            if filters is None:
                filters = OxygenStationFilter()
            if pagination is None:
                pagination = PaginationParams()
            
            # Build WHERE clause
            where_conditions = []
            params = []
            
            if filters.status:
                where_conditions.append("status = %s")
                params.append(filters.status)
            
            if filters.location:
                where_conditions.append("location LIKE %s")
                params.append(f"%{filters.location}%")
            
            if filters.low_level_threshold:
                where_conditions.append("(current_level / capacity_liters) < %s")
                params.append(filters.low_level_threshold / 100)
            
            where_clause = ""
            if where_conditions:
                where_clause = "WHERE " + " AND ".join(where_conditions)
            
            # Count query
            count_query = f"SELECT COUNT(*) as total FROM oxygen_stations {where_clause}"
            count_result = execute_query(count_query, params)
            total = count_result[0]['total']
            
            # Data query with pagination
            offset = (pagination.page - 1) * pagination.limit
            data_query = f"""
                SELECT * FROM oxygen_stations {where_clause}
                ORDER BY {pagination.sort_by} {pagination.sort_order}
                LIMIT %s OFFSET %s
            """
            data_params = params + [pagination.limit, offset]
            
            stations_data = execute_query(data_query, data_params)
            stations = [OxygenStation(**s) for s in stations_data]
            
            total_pages = (total + pagination.limit - 1) // pagination.limit
            
            result = PaginatedResult(
                data=stations,
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
            logger.error(f"Error finding all oxygen stations: {e}")
            return DatabaseResult(
                success=False,
                error=str(e)
            )
    
    @staticmethod
    def update_station(station_id: int, update_data: UpdateOxygenStation) -> DatabaseResult:
        """Update oxygen station"""
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
            
            params.append(station_id)
            
            query = f"""
                UPDATE oxygen_stations 
                SET {', '.join(update_fields)}, updated_at = NOW()
                WHERE station_id = %s
            """
            
            affected_rows = execute_update(query, params)
            
            if affected_rows == 0:
                return DatabaseResult(
                    success=False,
                    error="Oxygen station not found or no changes made"
                )
            
            # Fetch updated station
            updated_station = OxygenService.find_station_by_id(station_id)
            
            return DatabaseResult(
                success=True,
                data=updated_station.data
            )
            
        except Exception as e:
            logger.error(f"Error updating oxygen station: {e}")
            return DatabaseResult(
                success=False,
                error=str(e)
            )
    
    @staticmethod
    def delete_station(station_id: int) -> DatabaseResult:
        """Delete oxygen station"""
        try:
            query = "DELETE FROM oxygen_stations WHERE station_id = %s"
            affected_rows = execute_update(query, [station_id])
            
            if affected_rows == 0:
                return DatabaseResult(
                    success=False,
                    error="Oxygen station not found"
                )
            
            return DatabaseResult(
                success=True,
                data={"deleted": True}
            )
            
        except Exception as e:
            logger.error(f"Error deleting oxygen station: {e}")
            return DatabaseResult(
                success=False,
                error=str(e)
            )
    
    # ============================================================================
    # OXYGEN READING METHODS
    # ============================================================================
    
    @staticmethod
    def create_reading(reading_data: CreateOxygenReading) -> DatabaseResult:
        """Create new oxygen reading"""
        try:
            query = """
                INSERT INTO oxygen_readings (
                    station_id, level_liters, pressure_psi, flow_rate, temperature
                ) VALUES (%s, %s, %s, %s, %s)
            """
            
            params = [
                reading_data.station_id,
                reading_data.level_liters,
                reading_data.pressure_psi,
                reading_data.flow_rate,
                reading_data.temperature
            ]
            
            insert_id = execute_insert(query, params)
            
            # Update station current level
            update_query = "UPDATE oxygen_stations SET current_level = %s WHERE station_id = %s"
            execute_update(update_query, [reading_data.level_liters, reading_data.station_id])
            
            return DatabaseResult(
                success=True,
                data={"reading_id": insert_id},
                insert_id=insert_id
            )
            
        except Exception as e:
            logger.error(f"Error creating oxygen reading: {e}")
            return DatabaseResult(
                success=False,
                error=str(e)
            )
    
    @staticmethod
    def get_readings_for_station(station_id: int, pagination: PaginationParams = None) -> DatabaseResult:
        """Get readings for a specific station"""
        try:
            if pagination is None:
                pagination = PaginationParams(sort_by='timestamp', sort_order='DESC')
            
            # Count query
            count_query = "SELECT COUNT(*) as total FROM oxygen_readings WHERE station_id = %s"
            count_result = execute_query(count_query, [station_id])
            total = count_result[0]['total']
            
            # Data query with pagination
            offset = (pagination.page - 1) * pagination.limit
            data_query = f"""
                SELECT * FROM oxygen_readings 
                WHERE station_id = %s
                ORDER BY {pagination.sort_by} {pagination.sort_order}
                LIMIT %s OFFSET %s
            """
            
            readings_data = execute_query(data_query, [station_id, pagination.limit, offset])
            readings = [OxygenReading(**r) for r in readings_data]
            
            total_pages = (total + pagination.limit - 1) // pagination.limit
            
            result = PaginatedResult(
                data=readings,
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
            logger.error(f"Error getting readings for station: {e}")
            return DatabaseResult(
                success=False,
                error=str(e)
            )
    
    @staticmethod
    def get_statistics() -> DatabaseResult:
        """Get oxygen system statistics"""
        try:
            stats_query = """
                SELECT 
                    COUNT(*) as total_stations,
                    COUNT(CASE WHEN status = 'operational' THEN 1 END) as operational_stations,
                    COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_stations,
                    COUNT(CASE WHEN status = 'offline' THEN 1 END) as offline_stations,
                    SUM(capacity_liters) as total_capacity,
                    SUM(current_level) as total_current_level,
                    AVG((current_level / capacity_liters) * 100) as average_fill_percentage,
                    COUNT(CASE WHEN (current_level / capacity_liters) < 0.2 THEN 1 END) as low_level_alerts
                FROM oxygen_stations
            """
            
            result = execute_query(stats_query)
            stats_data = result[0] if result else {}
            
            # Convert to OxygenStatusSummary
            stats = OxygenStatusSummary(
                total_stations=stats_data.get('total_stations', 0),
                operational_stations=stats_data.get('operational_stations', 0),
                maintenance_stations=stats_data.get('maintenance_stations', 0),
                offline_stations=stats_data.get('offline_stations', 0),
                total_capacity=float(stats_data.get('total_capacity', 0) or 0),
                total_current_level=float(stats_data.get('total_current_level', 0) or 0),
                average_fill_percentage=float(stats_data.get('average_fill_percentage', 0) or 0),
                low_level_alerts=stats_data.get('low_level_alerts', 0)
            )
            
            return DatabaseResult(
                success=True,
                data=stats
            )
            
        except Exception as e:
            logger.error(f"Error getting oxygen statistics: {e}")
            return DatabaseResult(
                success=False,
                error=str(e)
            )