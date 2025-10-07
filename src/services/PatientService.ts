import { executeQuery, executeTransaction } from '../config/database';
import {
  Patient,
  CreatePatient,
  UpdatePatient,
  PatientFilter,
  PaginationParams,
  PaginatedResult,
  DatabaseResult
} from '../types/database';

export class PatientService {
  // Create a new patient
  static async create(patientData: CreatePatient): Promise<DatabaseResult<Patient>> {
    try {
      const query = `
        INSERT INTO patients (
          patient_number, first_name, last_name, date_of_birth, gender,
          phone, email, address, emergency_contact_name, emergency_contact_phone,
          blood_type, allergies, medical_history, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        patientData.patient_number,
        patientData.first_name,
        patientData.last_name,
        patientData.date_of_birth,
        patientData.gender,
        patientData.phone || null,
        patientData.email || null,
        patientData.address || null,
        patientData.emergency_contact_name || null,
        patientData.emergency_contact_phone || null,
        patientData.blood_type || null,
        patientData.allergies || null,
        patientData.medical_history || null,
        patientData.status
      ];

      const result = await executeQuery(query, params);
      const insertId = (result as any).insertId;
      
      // Fetch the created patient
      const createdPatient = await this.findById(insertId);
      
      return {
        success: true,
        data: createdPatient.data,
        insert_id: insertId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Find patient by ID
  static async findById(patientId: number): Promise<DatabaseResult<Patient>> {
    try {
      const query = 'SELECT * FROM patients WHERE patient_id = ?';
      const patients = await executeQuery<Patient>(query, [patientId]);
      
      if (patients.length === 0) {
        return {
          success: false,
          error: 'Patient not found'
        };
      }

      return {
        success: true,
        data: patients[0]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Find patient by patient number
  static async findByPatientNumber(patientNumber: string): Promise<DatabaseResult<Patient>> {
    try {
      const query = 'SELECT * FROM patients WHERE patient_number = ?';
      const patients = await executeQuery<Patient>(query, [patientNumber]);
      
      if (patients.length === 0) {
        return {
          success: false,
          error: 'Patient not found'
        };
      }

      return {
        success: true,
        data: patients[0]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Find all patients with filtering and pagination
  static async findAll(
    filters: PatientFilter = {},
    pagination: PaginationParams = {}
  ): Promise<DatabaseResult<PaginatedResult<Patient>>> {
    try {
      const { page = 1, limit = 50, sort_by = 'created_at', sort_order = 'DESC' } = pagination;
      const offset = (page - 1) * limit;

      // Build WHERE clause
      const whereConditions: string[] = [];
      const params: any[] = [];

      if (filters.status) {
        whereConditions.push('status = ?');
        params.push(filters.status);
      }

      if (filters.blood_type) {
        whereConditions.push('blood_type = ?');
        params.push(filters.blood_type);
      }

      if (filters.admission_date_from) {
        whereConditions.push('admission_date >= ?');
        params.push(filters.admission_date_from);
      }

      if (filters.admission_date_to) {
        whereConditions.push('admission_date <= ?');
        params.push(filters.admission_date_to);
      }

      if (filters.search) {
        whereConditions.push('(first_name LIKE ? OR last_name LIKE ? OR patient_number LIKE ?)');
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count total records
      const countQuery = `SELECT COUNT(*) as total FROM patients ${whereClause}`;
      const countResult = await executeQuery<{ total: number }>(countQuery, params);
      const total = countResult[0].total;

      // Fetch paginated data
      const dataQuery = `
        SELECT * FROM patients 
        ${whereClause}
        ORDER BY ${sort_by} ${sort_order}
        LIMIT ? OFFSET ?
      `;
      const patients = await executeQuery<Patient>(dataQuery, [...params, limit, offset]);

      return {
        success: true,
        data: {
          data: patients,
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

  // Update patient
  static async update(patientId: number, updateData: UpdatePatient): Promise<DatabaseResult<Patient>> {
    try {
      const setParts: string[] = [];
      const params: any[] = [];

      // Dynamically build SET clause
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

      params.push(patientId);

      const query = `
        UPDATE patients 
        SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE patient_id = ?
      `;

      const result = await executeQuery(query, params);
      
      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          error: 'Patient not found or no changes made'
        };
      }

      // Fetch updated patient
      const updatedPatient = await this.findById(patientId);
      
      return {
        success: true,
        data: updatedPatient.data,
        affected_rows: (result as any).affectedRows
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Delete patient (soft delete by setting status to 'discharged')
  static async delete(patientId: number): Promise<DatabaseResult<boolean>> {
    try {
      const query = 'UPDATE patients SET status = ?, discharge_date = CURRENT_TIMESTAMP WHERE patient_id = ?';
      const result = await executeQuery(query, ['discharged', patientId]);
      
      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          error: 'Patient not found'
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

  // Hard delete patient (use with caution)
  static async hardDelete(patientId: number): Promise<DatabaseResult<boolean>> {
    try {
      const query = 'DELETE FROM patients WHERE patient_id = ?';
      const result = await executeQuery(query, [patientId]);
      
      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          error: 'Patient not found'
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

  // Get admitted patients
  static async getAdmittedPatients(): Promise<DatabaseResult<Patient[]>> {
    try {
      const query = `
        SELECT p.*, b.bed_number, w.ward_name, w.ward_type
        FROM patients p
        LEFT JOIN beds b ON p.patient_id = b.patient_id
        LEFT JOIN wards w ON b.ward_id = w.ward_id
        WHERE p.status = 'admitted'
        ORDER BY p.admission_date DESC
      `;
      
      const patients = await executeQuery<Patient & { bed_number?: string; ward_name?: string; ward_type?: string }>(query);
      
      return {
        success: true,
        data: patients
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Admit patient to bed
  static async admitPatient(patientId: number, bedId: number): Promise<DatabaseResult<boolean>> {
    try {
      const queries = [
        {
          query: 'UPDATE patients SET status = ?, admission_date = CURRENT_TIMESTAMP WHERE patient_id = ?',
          params: ['admitted', patientId]
        },
        {
          query: 'UPDATE beds SET status = ?, patient_id = ? WHERE bed_id = ? AND status = ?',
          params: ['occupied', patientId, bedId, 'available']
        }
      ];

      const results = await executeTransaction(queries);
      
      // Check if bed was successfully assigned
      if ((results[1] as any).affectedRows === 0) {
        return {
          success: false,
          error: 'Bed not available for assignment'
        };
      }

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

  // Discharge patient
  static async dischargePatient(patientId: number): Promise<DatabaseResult<boolean>> {
    try {
      const queries = [
        {
          query: 'UPDATE patients SET status = ?, discharge_date = CURRENT_TIMESTAMP WHERE patient_id = ?',
          params: ['discharged', patientId]
        },
        {
          query: 'UPDATE beds SET status = ?, patient_id = NULL WHERE patient_id = ?',
          params: ['available', patientId]
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

  // Get patient statistics
  static async getStatistics(): Promise<DatabaseResult<{
    total_patients: number;
    admitted_patients: number;
    discharged_today: number;
    admitted_today: number;
    by_status: Record<string, number>;
    by_blood_type: Record<string, number>;
  }>> {
    try {
      const queries = [
        'SELECT COUNT(*) as total FROM patients',
        'SELECT COUNT(*) as admitted FROM patients WHERE status = "admitted"',
        'SELECT COUNT(*) as discharged_today FROM patients WHERE DATE(discharge_date) = CURDATE()',
        'SELECT COUNT(*) as admitted_today FROM patients WHERE DATE(admission_date) = CURDATE()',
        'SELECT status, COUNT(*) as count FROM patients GROUP BY status',
        'SELECT blood_type, COUNT(*) as count FROM patients WHERE blood_type IS NOT NULL GROUP BY blood_type'
      ];

      const [
        totalResult,
        admittedResult,
        dischargedTodayResult,
        admittedTodayResult,
        statusResult,
        bloodTypeResult
      ] = await Promise.all(queries.map(query => executeQuery(query)));

      const byStatus: Record<string, number> = {};
      (statusResult as any[]).forEach((row: any) => {
        byStatus[row.status] = row.count;
      });

      const byBloodType: Record<string, number> = {};
      (bloodTypeResult as any[]).forEach((row: any) => {
        byBloodType[row.blood_type] = row.count;
      });

      return {
        success: true,
        data: {
          total_patients: (totalResult as any)[0].total,
          admitted_patients: (admittedResult as any)[0].admitted,
          discharged_today: (dischargedTodayResult as any)[0].discharged_today,
          admitted_today: (admittedTodayResult as any)[0].admitted_today,
          by_status: byStatus,
          by_blood_type: byBloodType
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Search patients by multiple criteria
  static async search(searchTerm: string): Promise<DatabaseResult<Patient[]>> {
    try {
      const query = `
        SELECT * FROM patients 
        WHERE first_name LIKE ? 
           OR last_name LIKE ? 
           OR patient_number LIKE ? 
           OR email LIKE ?
           OR phone LIKE ?
        ORDER BY 
          CASE 
            WHEN patient_number = ? THEN 1
            WHEN CONCAT(first_name, ' ', last_name) LIKE ? THEN 2
            ELSE 3
          END,
          first_name, last_name
        LIMIT 20
      `;
      
      const likeTerm = `%${searchTerm}%`;
      const exactName = `%${searchTerm}%`;
      
      const patients = await executeQuery<Patient>(query, [
        likeTerm, likeTerm, likeTerm, likeTerm, likeTerm,
        searchTerm, exactName
      ]);

      return {
        success: true,
        data: patients
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}