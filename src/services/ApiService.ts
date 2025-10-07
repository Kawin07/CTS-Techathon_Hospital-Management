// Comprehensive API service for Healthcare Management System
// Connects React frontend to FastAPI backend with FHIR-compliant data

const API_BASE_URL = 'http://localhost:8000';

// Types for our API responses
export interface Patient {
  patient_id: number;
  identifier: string;
  given_name: string;
  family_name: string;
  full_name: string;
  birth_date: string;
  age: number;
  gender: string;
  phone?: string;
  email?: string;
  blood_type?: string;
  insurance_provider?: string;
  marital_status?: string;
}

export interface PatientCondition {
  condition_id: number;
  patient_id: number;
  condition_code: string;
  condition_name: string;
  condition_category: string;
  severity: string;
  onset_date: string;
  resolved_date?: string;
  status: string;
  diagnosed_by?: string;
}

export interface OxygenStation {
  station_id: number;
  station_code: string;
  station_name: string;
  location: string;
  current_level_percentage: number;
  pressure_psi?: number;
  flow_rate_lpm?: number;
  status: string;
  patient_name?: string;
  patient_identifier?: string;
  assigned_staff?: string;
  ward_name?: string;
  bed_number?: string;
  capacity_liters: number;
  current_level_liters: number;
  last_maintenance?: string;
  next_maintenance_due?: string;
}

export interface Staff {
  staff_id: string;
  given_name: string;
  family_name: string;
  full_name: string;
  role: string;
  department: string;
  status: string;
  shift: string;
  email?: string;
  phone?: string;
  years_experience: number;
  specialization: string[];
  workload: number;
}

export interface HealthcareStats {
  year_period: number;
  population_total?: number;
  life_expectancy_male?: number;
  life_expectancy_female?: number;
  obesity_rate?: number;
  diabetes_prevalence?: number;
  hypertension_prevalence?: number;
  healthcare_spending_per_capita?: number;
}

export interface DiseasePattern {
  pattern_id: number;
  year_period: number;
  month_period: number;
  disease_category: string;
  disease_name: string;
  icd10_code?: string;
  cases_per_100k: number;
  mortality_rate?: number;
}

export interface DashboardSummary {
  total_patients: number;
  total_staff: number;
  active_conditions: number;
  oxygen_stations: number;
  critical_oxygen: number;
  staff_on_duty: number;
  available_beds: number;
  occupied_beds: number;
  recent_conditions: Array<{
    condition_category: string;
    count: number;
  }>;
  oxygen_status: Array<{
    status: string;
    count: number;
    avg_level: number;
  }>;
}

// API response wrapper - for future use
// interface ApiResponse<T> {
//   data: T;
//   status: number;
//   message?: string;
// }

// Error handling
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base fetch function with error handling
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Health check service
export const healthService = {
  async checkHealth() {
    return apiFetch<{ status: string; database: string; timestamp: string }>('/health');
  },

  async getRoot() {
    return apiFetch<{ message: string; version: string; status: string; timestamp: string }>('/');
  }
};

// Patient services
export const patientService = {
  async getPatients(params: {
    limit?: number;
    offset?: number;
    gender?: string;
    age_min?: number;
    age_max?: number;
    blood_type?: string;
    search?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/patients${queryString ? `?${queryString}` : ''}`;
    
    return apiFetch<Patient[]>(endpoint);
  },

  async getPatient(patientId: number) {
    return apiFetch<Patient>(`/patients/${patientId}`);
  },

  async getPatientConditions(patientId: number) {
    return apiFetch<PatientCondition[]>(`/patients/${patientId}/conditions`);
  }
};

// Oxygen monitoring services
export const oxygenService = {
  async getOxygenStations(params: {
    status?: string;
    ward_id?: number;
    low_level_only?: boolean;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/oxygen-stations${queryString ? `?${queryString}` : ''}`;
    
    return apiFetch<OxygenStation[]>(endpoint);
  },

  async updateOxygenLevel(stationId: number, newLevelLiters: number) {
    return apiFetch<{ message: string; new_level_liters: number }>(
      `/oxygen-stations/${stationId}/level`,
      {
        method: 'PUT',
        body: JSON.stringify({ new_level_liters: newLevelLiters }),
      }
    );
  }
};

// Staff services
export const staffService = {
  async getStaff(params: {
    department?: string;
    role?: string;
    status?: string;
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/staff${queryString ? `?${queryString}` : ''}`;
    
    return apiFetch<Staff[]>(endpoint);
  }
};

// Analytics services
export const analyticsService = {
  async getHealthcareStats(yearStart: number = 2010, yearEnd: number = 2025) {
    return apiFetch<HealthcareStats[]>(`/analytics/healthcare-stats?year_start=${yearStart}&year_end=${yearEnd}`);
  },

  async getDiseasePatterns(params: {
    year?: number;
    disease_category?: string;
    disease_name?: string;
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/analytics/disease-patterns${queryString ? `?${queryString}` : ''}`;
    
    return apiFetch<DiseasePattern[]>(endpoint);
  },

  async getDiseaseTrend(diseaseName: string) {
    return apiFetch<{
      disease_name: string;
      trend_data: Array<{
        year_period: number;
        total_cases: number;
        avg_mortality_rate: number;
        data_points: number;
      }>;
      total_years: number;
      year_range: number[];
    }>(`/analytics/disease-trends/${encodeURIComponent(diseaseName)}`);
  }
};

// Dashboard services
export const dashboardService = {
  async getSummary() {
    return apiFetch<DashboardSummary>('/dashboard/summary');
  }
};

// Real-time oxygen monitoring service (simulated WebSocket-like behavior)
export class OxygenMonitoringService {
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: ((stations: OxygenStation[]) => void)[] = [];

  async startMonitoring(intervalMs: number = 5000) {
    if (this.intervalId) {
      this.stopMonitoring();
    }

    // Initial fetch
    await this.fetchAndNotify();

    // Set up periodic updates
    this.intervalId = setInterval(async () => {
      await this.fetchAndNotify();
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(listener: (stations: OxygenStation[]) => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private async fetchAndNotify() {
    try {
      const stations = await oxygenService.getOxygenStations();
      this.listeners.forEach(listener => listener(stations));
    } catch (error) {
      console.error('Error fetching oxygen stations:', error);
    }
  }
}

// Export singleton instance for oxygen monitoring
export const oxygenMonitoring = new OxygenMonitoringService();

// Utility functions for data processing
export const dataUtils = {
  // Convert API oxygen station to legacy format for existing components
  convertOxygenStationToLegacy(station: OxygenStation) {
    return {
      id: station.station_code,
      location: station.location,
      patientName: station.patient_name,
      patientId: station.patient_identifier,
      currentLevel: station.current_level_percentage,
      targetLevel: 95, // Default target
      flowRate: station.flow_rate_lpm || 2.5,
      pressure: station.pressure_psi || 50,
      status: station.status as 'normal' | 'warning' | 'critical' | 'offline',
      lastUpdate: new Date().toLocaleString(),
      trend: 'stable' as 'up' | 'down' | 'stable',
      alerts: station.status === 'critical' ? ['Critical oxygen level'] : 
              station.status === 'low' ? ['Low oxygen level'] : [],
      cylinderCapacity: station.capacity_liters || 500,
      remainingOxygen: station.current_level_liters || 0
    };
  },

  // Calculate age from birth date
  calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  },

  // Format percentage
  formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  },

  // Get status color for UI
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'normal': return 'green';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      case 'offline': return 'gray';
      default: return 'gray';
    }
  },

  // Group data by category
  groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = item[key] as string;
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }
};

// Export all services as default
const apiService = {
  health: healthService,
  patients: patientService,
  oxygen: oxygenService,
  staff: staffService,
  analytics: analyticsService,
  dashboard: dashboardService,
  monitoring: oxygenMonitoring,
  utils: dataUtils
};

export default apiService;