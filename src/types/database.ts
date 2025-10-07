// TypeScript interfaces for Hospital Management System Database Models
// These interfaces match the MySQL schema structure

// ============================================================================
// CORE ENTITY INTERFACES
// ============================================================================

export interface Patient {
  patient_id?: number;
  patient_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  gender: 'M' | 'F' | 'Other';
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string;
  medical_history?: string;
  admission_date?: Date;
  discharge_date?: Date;
  status: 'admitted' | 'discharged' | 'transferred' | 'outpatient';
  created_at?: Date;
  updated_at?: Date;
}

export interface Staff {
  staff_id?: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department: 'Emergency' | 'ICU' | 'Surgery' | 'Cardiology' | 'Orthopedics' | 'Pediatrics' | 'Nursing' | 'Administration' | 'Maintenance' | 'Security';
  position: string;
  shift_type: 'day' | 'night' | 'rotating';
  status: 'active' | 'on_leave' | 'inactive';
  hire_date: Date;
  salary?: number;
  qualifications?: string;
  specializations?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Ward {
  ward_id?: number;
  ward_name: string;
  ward_type: 'General' | 'ICU' | 'Emergency' | 'Surgery' | 'Maternity' | 'Pediatrics' | 'Isolation';
  total_beds: number;
  available_beds: number;
  floor_number?: number;
  department?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Bed {
  bed_id?: number;
  bed_number: string;
  ward_id: number;
  bed_type: 'Standard' | 'ICU' | 'Emergency' | 'Isolation' | 'Maternity';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  patient_id?: number;
  assigned_staff_id?: number;
  last_cleaned?: Date;
  equipment_status?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  // Relations
  ward?: Ward;
  patient?: Patient;
  assigned_staff?: Staff;
}

export interface OxygenStation {
  station_id?: number;
  station_name: string;
  location: string;
  capacity_liters: number;
  current_level: number; // Percentage
  pressure_psi?: number;
  flow_rate?: number; // L/min
  status: 'normal' | 'low' | 'critical' | 'maintenance';
  last_refill?: Date;
  next_maintenance?: Date;
  supplier?: string;
  alerts_enabled: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface OxygenReading {
  reading_id?: number;
  station_id: number;
  oxygen_level: number;
  pressure_psi?: number;
  flow_rate?: number;
  temperature?: number;
  reading_timestamp?: Date;
  recorded_by_staff_id?: number;
  notes?: string;
  // Relations
  station?: OxygenStation;
  recorded_by_staff?: Staff;
}

export interface Alert {
  alert_id?: number;
  alert_type: 'critical' | 'warning' | 'info' | 'success';
  category: 'oxygen' | 'beds' | 'staff' | 'emergency' | 'system' | 'patient';
  title: string;
  message: string;
  priority: number; // 1-10, 10 being highest
  status: 'active' | 'acknowledged' | 'resolved';
  affected_resources?: string[];
  estimated_impact?: string;
  auto_resolve: boolean;
  created_by_system: boolean;
  created_by_staff_id?: number;
  acknowledged_by_staff_id?: number;
  resolved_by_staff_id?: number;
  created_at?: Date;
  acknowledged_at?: Date;
  resolved_at?: Date;
  // Relations
  created_by_staff?: Staff;
  acknowledged_by_staff?: Staff;
  resolved_by_staff?: Staff;
  recommendations?: AlertRecommendation[];
}

export interface AlertRecommendation {
  recommendation_id?: number;
  alert_id: number;
  action_description: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  estimated_time?: string;
  impact_description?: string;
  cost_level: 'none' | 'low' | 'medium' | 'high';
  departments?: string[];
  automation_available: boolean;
  success_rate: number; // 0-100%
  executed_at?: Date;
  executed_by_staff_id?: number;
  execution_result?: 'success' | 'failed' | 'partial';
  notes?: string;
  created_at?: Date;
  // Relations
  alert?: Alert;
  executed_by_staff?: Staff;
}

export interface Appointment {
  appointment_id?: number;
  patient_id: number;
  staff_id: number;
  appointment_type: 'consultation' | 'surgery' | 'follow_up' | 'emergency' | 'diagnostic';
  scheduled_datetime: Date;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  department?: string;
  room_number?: string;
  reason?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  // Relations
  patient?: Patient;
  staff?: Staff;
}

export interface MedicalRecord {
  record_id?: number;
  patient_id: number;
  staff_id: number;
  record_type: 'diagnosis' | 'treatment' | 'surgery' | 'lab_result' | 'prescription' | 'note';
  title: string;
  description?: string;
  diagnosis_codes?: string; // ICD-10 codes
  treatment_plan?: string;
  medications?: any; // JSON
  lab_results?: any; // JSON
  vital_signs?: any; // JSON
  attachments?: any; // JSON - File paths/URLs
  created_at?: Date;
  updated_at?: Date;
  // Relations
  patient?: Patient;
  staff?: Staff;
}

export interface Equipment {
  equipment_id?: number;
  equipment_name: string;
  equipment_type: 'medical' | 'diagnostic' | 'surgical' | 'monitoring' | 'support';
  model?: string;
  serial_number?: string;
  manufacturer?: string;
  purchase_date?: Date;
  warranty_expiry?: Date;
  location?: string;
  status: 'active' | 'maintenance' | 'repair' | 'retired';
  last_maintenance?: Date;
  next_maintenance?: Date;
  maintenance_notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

// ============================================================================
// PREDICTIVE ANALYTICS INTERFACES
// ============================================================================

export interface PredictionModel {
  model_id?: number;
  model_name: string;
  model_type: 'bed_occupancy' | 'staff_workload' | 'oxygen_consumption' | 'emergency_load' | 'resource_optimization';
  model_version: string;
  accuracy_score?: number;
  training_data_period?: string;
  last_trained?: Date;
  parameters?: any; // JSON
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Prediction {
  prediction_id?: number;
  model_id: number;
  prediction_type: string;
  target_resource: string;
  predicted_value: number;
  confidence_score?: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  prediction_horizon?: string; // e.g., '4 hours', '1 day'
  input_data?: any; // JSON
  recommendations?: any; // JSON
  created_at?: Date;
  valid_until?: Date;
  // Relations
  model?: PredictionModel;
}

export interface PerformanceMetric {
  metric_id?: number;
  metric_name: string;
  metric_category: 'bed_utilization' | 'staff_efficiency' | 'oxygen_usage' | 'patient_flow' | 'emergency_response' | 'system_performance';
  metric_value: number;
  unit?: string;
  target_value?: number;
  measurement_period?: string;
  department?: string;
  recorded_at?: Date;
  notes?: string;
}

export interface SystemLog {
  log_id?: number;
  log_level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  module: string;
  action: string;
  user_id?: number;
  ip_address?: string;
  user_agent?: string;
  request_data?: any; // JSON
  response_data?: any; // JSON
  execution_time_ms?: number;
  created_at?: Date;
  // Relations
  user?: Staff;
}

// ============================================================================
// VIEW INTERFACES (for database views)
// ============================================================================

export interface DashboardSummary {
  total_admitted_patients: number;
  available_beds: number;
  occupied_beds: number;
  active_staff: number;
  active_alerts: number;
  critical_alerts: number;
}

export interface OxygenStatusSummary {
  station_id: number;
  station_name: string;
  location: string;
  current_level: number;
  status: string;
  alert_level: 'critical' | 'warning' | 'normal';
  last_reading_time?: Date;
}

export interface StaffWorkload {
  staff_id: number;
  first_name: string;
  last_name: string;
  department: string;
  position: string;
  assigned_beds: number;
  scheduled_appointments: number;
  workload_level: 'high' | 'medium' | 'low';
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// For create operations (excluding auto-generated fields)
export type CreatePatient = Omit<Patient, 'patient_id' | 'created_at' | 'updated_at'>;
export type CreateStaff = Omit<Staff, 'staff_id' | 'created_at' | 'updated_at'>;
export type CreateWard = Omit<Ward, 'ward_id' | 'created_at' | 'updated_at'>;
export type CreateBed = Omit<Bed, 'bed_id' | 'created_at' | 'updated_at' | 'ward' | 'patient' | 'assigned_staff'>;
export type CreateOxygenStation = Omit<OxygenStation, 'station_id' | 'created_at' | 'updated_at'>;
export type CreateOxygenReading = Omit<OxygenReading, 'reading_id' | 'reading_timestamp' | 'station' | 'recorded_by_staff'>;
export type CreateAlert = Omit<Alert, 'alert_id' | 'created_at' | 'acknowledged_at' | 'resolved_at' | 'created_by_staff' | 'acknowledged_by_staff' | 'resolved_by_staff' | 'recommendations'>;
export type CreateAlertRecommendation = Omit<AlertRecommendation, 'recommendation_id' | 'executed_at' | 'created_at' | 'alert' | 'executed_by_staff'>;

// For update operations (excluding non-updatable fields)
export type UpdatePatient = Partial<Omit<Patient, 'patient_id' | 'patient_number' | 'created_at' | 'updated_at'>>;
export type UpdateStaff = Partial<Omit<Staff, 'staff_id' | 'employee_id' | 'created_at' | 'updated_at'>>;
export type UpdateWard = Partial<Omit<Ward, 'ward_id' | 'created_at' | 'updated_at'>>;
export type UpdateBed = Partial<Omit<Bed, 'bed_id' | 'created_at' | 'updated_at' | 'ward' | 'patient' | 'assigned_staff'>>;
export type UpdateOxygenStation = Partial<Omit<OxygenStation, 'station_id' | 'created_at' | 'updated_at'>>;
export type UpdateAlert = Partial<Omit<Alert, 'alert_id' | 'created_at' | 'acknowledged_at' | 'resolved_at' | 'created_by_staff' | 'acknowledged_by_staff' | 'resolved_by_staff' | 'recommendations'>>;

// For query filters
export interface PatientFilter {
  status?: Patient['status'];
  blood_type?: Patient['blood_type'];
  admission_date_from?: Date;
  admission_date_to?: Date;
  search?: string; // For name or patient number search
}

export interface StaffFilter {
  department?: Staff['department'];
  status?: Staff['status'];
  shift_type?: Staff['shift_type'];
  search?: string; // For name or employee ID search
}

export interface BedFilter {
  ward_id?: number;
  status?: Bed['status'];
  bed_type?: Bed['bed_type'];
}

export interface AlertFilter {
  alert_type?: Alert['alert_type'];
  category?: Alert['category'];
  status?: Alert['status'];
  priority_min?: number;
  priority_max?: number;
  date_from?: Date;
  date_to?: Date;
}

export interface OxygenStationFilter {
  status?: OxygenStation['status'];
  location?: string;
  level_below?: number; // Filter stations below this percentage
}

// Pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

// Query result with pagination
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Database operation result
export interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  affected_rows?: number;
  insert_id?: number;
}

// Real-time update interfaces (for WebSocket/SSE)
export interface RealTimeUpdate {
  type: 'insert' | 'update' | 'delete';
  table: string;
  record_id: number;
  data?: any;
  timestamp: Date;
}

export interface SystemStatus {
  database_connected: boolean;
  total_patients: number;
  active_alerts: number;
  system_uptime: number;
  last_updated: Date;
}