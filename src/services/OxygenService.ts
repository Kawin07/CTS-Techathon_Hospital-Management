import { executeQuery, executeTransaction } from '../config/database';
import {
  OxygenStation,
  OxygenReading,
  CreateOxygenStation,
  CreateOxygenReading,
  UpdateOxygenStation,
  OxygenStationFilter,
  OxygenStatusSummary,
  PaginationParams,
  PaginatedResult,
  DatabaseResult
} from '../types/database';

export class OxygenService {
  // ============================================================================
  // OXYGEN STATION METHODS
  // ============================================================================

  // Create new oxygen station
  static async createStation(stationData: CreateOxygenStation): Promise<DatabaseResult<OxygenStation>> {
    try {
      const query = `
        INSERT INTO oxygen_stations (
          station_name, location, capacity_liters, current_level, pressure_psi,
          flow_rate, status, last_refill, next_maintenance, supplier, alerts_enabled
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        stationData.station_name,
        stationData.location,
        stationData.capacity_liters,
        stationData.current_level,
        stationData.pressure_psi || null,
        stationData.flow_rate || null,
        stationData.status,
        stationData.last_refill || null,
        stationData.next_maintenance || null,
        stationData.supplier || null,
        stationData.alerts_enabled
      ];

      const result = await executeQuery(query, params);
      const insertId = (result as any).insertId;
      
      const createdStation = await this.findStationById(insertId);
      
      return {
        success: true,
        data: createdStation.data,
        insert_id: insertId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Find oxygen station by ID
  static async findStationById(stationId: number): Promise<DatabaseResult<OxygenStation>> {
    try {
      const query = 'SELECT * FROM oxygen_stations WHERE station_id = ?';
      const stations = await executeQuery<OxygenStation>(query, [stationId]);
      
      if (stations.length === 0) {
        return {
          success: false,
          error: 'Oxygen station not found'
        };
      }

      return {
        success: true,
        data: stations[0]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get all oxygen stations with filtering
  static async findAllStations(
    filters: OxygenStationFilter = {},
    pagination: PaginationParams = {}
  ): Promise<DatabaseResult<PaginatedResult<OxygenStation>>> {
    try {
      const { page = 1, limit = 50, sort_by = 'station_name', sort_order = 'ASC' } = pagination;
      const offset = (page - 1) * limit;

      const whereConditions: string[] = [];
      const params: any[] = [];

      if (filters.status) {
        whereConditions.push('status = ?');
        params.push(filters.status);
      }

      if (filters.location) {
        whereConditions.push('location LIKE ?');
        params.push(`%${filters.location}%`);
      }

      if (filters.level_below) {
        whereConditions.push('current_level < ?');
        params.push(filters.level_below);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count total records
      const countQuery = `SELECT COUNT(*) as total FROM oxygen_stations ${whereClause}`;
      const countResult = await executeQuery<{ total: number }>(countQuery, params);
      const total = countResult[0].total;

      // Fetch paginated data
      const dataQuery = `
        SELECT * FROM oxygen_stations 
        ${whereClause}
        ORDER BY ${sort_by} ${sort_order}
        LIMIT ? OFFSET ?
      `;
      const stations = await executeQuery<OxygenStation>(dataQuery, [...params, limit, offset]);

      return {
        success: true,
        data: {
          data: stations,
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Update oxygen station
  static async updateStation(stationId: number, updateData: UpdateOxygenStation): Promise<DatabaseResult<OxygenStation>> {
    try {
      const setParts: string[] = [];
      const params: any[] = [];

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          setParts.push(`${key} = ?`);
          params.push(value);
        }
      });

      if (setParts.length === 0) {
        return {
          success: false,
          error: 'No fields to update'
        };
      }

      params.push(stationId);

      const query = `
        UPDATE oxygen_stations 
        SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE station_id = ?
      `;

      const result = await executeQuery(query, params);
      
      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          error: 'Oxygen station not found or no changes made'
        };
      }

      const updatedStation = await this.findStationById(stationId);
      
      return {
        success: true,
        data: updatedStation.data,
        affected_rows: (result as any).affectedRows
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Delete oxygen station
  static async deleteStation(stationId: number): Promise<DatabaseResult<boolean>> {
    try {
      const query = 'DELETE FROM oxygen_stations WHERE station_id = ?';
      const result = await executeQuery(query, [stationId]);
      
      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          error: 'Oxygen station not found'
        };
      }

      return {
        success: true,
        data: true,
        affected_rows: (result as any).affectedRows
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // ============================================================================
  // OXYGEN READING METHODS
  // ============================================================================

  // Add new oxygen reading
  static async addReading(readingData: CreateOxygenReading): Promise<DatabaseResult<OxygenReading>> {
    try {
      const query = `
        INSERT INTO oxygen_readings (
          station_id, oxygen_level, pressure_psi, flow_rate, temperature, 
          recorded_by_staff_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        readingData.station_id,
        readingData.oxygen_level,
        readingData.pressure_psi || null,
        readingData.flow_rate || null,
        readingData.temperature || null,
        readingData.recorded_by_staff_id || null,
        readingData.notes || null
      ];

      const result = await executeQuery(query, params);
      const insertId = (result as any).insertId;

      // Also update the current level in the station
      await this.updateStation(readingData.station_id, {
        current_level: readingData.oxygen_level,
        pressure_psi: readingData.pressure_psi,
        flow_rate: readingData.flow_rate
      });
      
      const createdReading = await this.findReadingById(insertId);
      
      return {
        success: true,
        data: createdReading.data,
        insert_id: insertId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Find reading by ID
  static async findReadingById(readingId: number): Promise<DatabaseResult<OxygenReading>> {
    try {
      const query = `
        SELECT or.*, os.station_name, os.location, s.first_name, s.last_name
        FROM oxygen_readings or
        LEFT JOIN oxygen_stations os ON or.station_id = os.station_id
        LEFT JOIN staff s ON or.recorded_by_staff_id = s.staff_id
        WHERE or.reading_id = ?
      `;
      const readings = await executeQuery<OxygenReading & {
        station_name?: string;
        location?: string;
        first_name?: string;
        last_name?: string;
      }>(query, [readingId]);
      
      if (readings.length === 0) {
        return {
          success: false,
          error: 'Oxygen reading not found'
        };
      }

      return {
        success: true,
        data: readings[0]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get readings for a specific station
  static async getStationReadings(
    stationId: number,
    limit: number = 100,
    hours: number = 24
  ): Promise<DatabaseResult<OxygenReading[]>> {
    try {
      const query = `
        SELECT or.*, s.first_name, s.last_name
        FROM oxygen_readings or
        LEFT JOIN staff s ON or.recorded_by_staff_id = s.staff_id
        WHERE or.station_id = ? 
          AND or.reading_timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        ORDER BY or.reading_timestamp DESC
        LIMIT ?
      `;
      
      const readings = await executeQuery<OxygenReading & {
        first_name?: string;
        last_name?: string;
      }>(query, [stationId, hours, limit]);

      return {
        success: true,
        data: readings
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // ============================================================================
  // SPECIALIZED QUERIES
  // ============================================================================

  // Get oxygen status summary (using the database view)
  static async getStatusSummary(): Promise<DatabaseResult<OxygenStatusSummary[]>> {
    try {
      const query = 'SELECT * FROM oxygen_status_summary ORDER BY alert_level DESC, current_level ASC';
      const summary = await executeQuery<OxygenStatusSummary>(query);

      return {
        success: true,
        data: summary
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get critical oxygen stations (below 20%)
  static async getCriticalStations(): Promise<DatabaseResult<OxygenStation[]>> {
    try {
      const query = `
        SELECT * FROM oxygen_stations 
        WHERE current_level < 20 OR status = 'critical'
        ORDER BY current_level ASC
      `;
      
      const stations = await executeQuery<OxygenStation>(query);

      return {
        success: true,
        data: stations
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get stations needing maintenance
  static async getMaintenanceNeeded(): Promise<DatabaseResult<OxygenStation[]>> {
    try {
      const query = `
        SELECT * FROM oxygen_stations 
        WHERE next_maintenance <= DATE_ADD(NOW(), INTERVAL 7 DAY)
           OR status = 'maintenance'
        ORDER BY next_maintenance ASC
      `;
      
      const stations = await executeQuery<OxygenStation>(query);

      return {
        success: true,
        data: stations
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get oxygen consumption trends
  static async getConsumptionTrends(
    stationId?: number,
    days: number = 7
  ): Promise<DatabaseResult<{
    date: string;
    station_id: number;
    station_name: string;
    avg_level: number;
    min_level: number;
    max_level: number;
    readings_count: number;
  }[]>> {
    try {
      const stationFilter = stationId ? 'AND os.station_id = ?' : '';
      const params = [days];
      if (stationId) params.push(stationId);

      const query = `
        SELECT 
          DATE(or.reading_timestamp) as date,
          os.station_id,
          os.station_name,
          AVG(or.oxygen_level) as avg_level,
          MIN(or.oxygen_level) as min_level,
          MAX(or.oxygen_level) as max_level,
          COUNT(*) as readings_count
        FROM oxygen_readings or
        JOIN oxygen_stations os ON or.station_id = os.station_id
        WHERE or.reading_timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
          ${stationFilter}
        GROUP BY DATE(or.reading_timestamp), os.station_id, os.station_name
        ORDER BY date DESC, os.station_name
      `;
      
      const trends = await executeQuery(query, params);

      return {
        success: true,
        data: trends
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Refill oxygen station
  static async refillStation(stationId: number, newLevel: number = 100): Promise<DatabaseResult<boolean>> {
    try {
      const queries = [
        {
          query: `
            UPDATE oxygen_stations 
            SET current_level = ?, last_refill = CURRENT_TIMESTAMP, status = 'normal'
            WHERE station_id = ?
          `,
          params: [newLevel, stationId]
        },
        {
          query: `
            INSERT INTO oxygen_readings (station_id, oxygen_level, notes, recorded_by_staff_id)
            VALUES (?, ?, 'Station refilled', NULL)
          `,
          params: [stationId, newLevel]
        }
      ];

      await executeTransaction(queries);

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get oxygen statistics
  static async getStatistics(): Promise<DatabaseResult<{
    total_stations: number;
    critical_stations: number;
    low_stations: number;
    normal_stations: number;
    maintenance_stations: number;
    avg_level: number;
    total_capacity: number;
    stations_by_location: Record<string, number>;
    recent_readings: number;
  }>> {
    try {
      const queries = [
        'SELECT COUNT(*) as total FROM oxygen_stations',
        'SELECT COUNT(*) as critical FROM oxygen_stations WHERE current_level < 20 OR status = "critical"',
        'SELECT COUNT(*) as low FROM oxygen_stations WHERE current_level >= 20 AND current_level < 40',
        'SELECT COUNT(*) as normal FROM oxygen_stations WHERE current_level >= 40 AND status != "maintenance"',
        'SELECT COUNT(*) as maintenance FROM oxygen_stations WHERE status = "maintenance"',
        'SELECT AVG(current_level) as avg_level FROM oxygen_stations WHERE status != "maintenance"',
        'SELECT SUM(capacity_liters) as total_capacity FROM oxygen_stations',
        'SELECT location, COUNT(*) as count FROM oxygen_stations GROUP BY location',
        'SELECT COUNT(*) as recent_readings FROM oxygen_readings WHERE reading_timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)'
      ];

      const [
        totalResult,
        criticalResult,
        lowResult,
        normalResult,
        maintenanceResult,
        avgLevelResult,
        capacityResult,
        locationResult,
        recentReadingsResult
      ] = await Promise.all(queries.map(query => executeQuery(query)));

      const stationsByLocation: Record<string, number> = {};
      (locationResult as any[]).forEach((row: any) => {
        stationsByLocation[row.location] = row.count;
      });

      return {
        success: true,
        data: {
          total_stations: (totalResult as any)[0].total,
          critical_stations: (criticalResult as any)[0].critical,
          low_stations: (lowResult as any)[0].low,
          normal_stations: (normalResult as any)[0].normal,
          maintenance_stations: (maintenanceResult as any)[0].maintenance,
          avg_level: parseFloat((avgLevelResult as any)[0].avg_level || 0),
          total_capacity: parseFloat((capacityResult as any)[0].total_capacity || 0),
          stations_by_location: stationsByLocation,
          recent_readings: (recentReadingsResult as any)[0].recent_readings
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get real-time oxygen data for dashboard
  static async getRealTimeData(): Promise<DatabaseResult<{
    stations: OxygenStatusSummary[];
    recent_readings: OxygenReading[];
    alerts: number;
    total_consumption: number;
  }>> {
    try {
      const [statusResult, readingsResult, alertsResult, consumptionResult] = await Promise.all([
        this.getStatusSummary(),
        executeQuery(`
          SELECT or.*, os.station_name, os.location
          FROM oxygen_readings or
          JOIN oxygen_stations os ON or.station_id = os.station_id
          WHERE or.reading_timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
          ORDER BY or.reading_timestamp DESC
          LIMIT 50
        `),
        executeQuery(`
          SELECT COUNT(*) as alerts 
          FROM alerts 
          WHERE category = 'oxygen' AND status = 'active'
        `),
        executeQuery(`
          SELECT SUM(flow_rate) as total_flow 
          FROM oxygen_stations 
          WHERE status != 'maintenance' AND flow_rate IS NOT NULL
        `)
      ]);

      return {
        success: true,
        data: {
          stations: statusResult.data || [],
          recent_readings: readingsResult as OxygenReading[],
          alerts: (alertsResult as any)[0].alerts,
          total_consumption: parseFloat((consumptionResult as any)[0].total_flow || 0)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}