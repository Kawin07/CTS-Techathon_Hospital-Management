/**
 * Fallback Data Provider
 * Provides realistic fallback data when APIs are unavailable
 */

import {
  Patient,
  OxygenStation,
  Staff,
  DashboardSummary,
  HealthcareStats,
} from "./ApiService";

interface FallbackConfig {
  enableRandomization: boolean;
  cacheTimeout: number; // milliseconds
  updateInterval: number; // milliseconds for simulated live data
}

class FallbackDataProvider {
  private static instance: FallbackDataProvider;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private config: FallbackConfig = {
    enableRandomization: true,
    cacheTimeout: 300000, // 5 minutes
    updateInterval: 5000, // 5 seconds for live data
  };

  static getInstance(): FallbackDataProvider {
    if (!FallbackDataProvider.instance) {
      FallbackDataProvider.instance = new FallbackDataProvider();
    }
    return FallbackDataProvider.instance;
  }

  /**
   * Get fallback dashboard summary
   */
  getDashboardSummary(): DashboardSummary {
    return this.getCachedOrGenerate("dashboard_summary", () => {
      const variation = this.getRandomVariation();

      return {
        total_patients: 145 + variation(-10, 25),
        total_staff: 120 + variation(-5, 8),
        active_conditions: 67 + variation(-15, 20),
        oxygen_stations: 11,
        critical_oxygen: Math.max(0, 2 + variation(-2, 3)),
        staff_on_duty: 89 + variation(-12, 15),
        available_beds: 66 + variation(-20, 30),
        occupied_beds: 134 + variation(-30, 20),
        recent_conditions: [
          { condition_category: "Respiratory", count: 23 + variation(-5, 8) },
          {
            condition_category: "Cardiovascular",
            count: 18 + variation(-4, 6),
          },
          { condition_category: "Neurological", count: 12 + variation(-3, 5) },
          { condition_category: "Infectious", count: 8 + variation(-2, 4) },
          { condition_category: "Orthopedic", count: 6 + variation(-2, 3) },
        ],
        oxygen_status: [
          {
            status: "normal",
            count: 6 + variation(-2, 2),
            avg_level: 92 + variation(-8, 5),
          },
          {
            status: "warning",
            count: 3 + variation(-1, 2),
            avg_level: 78 + variation(-10, 8),
          },
          {
            status: "critical",
            count: Math.max(0, 2 + variation(-2, 3)),
            avg_level: 29 + variation(-10, 5),
          },
        ],
      };
    });
  }

  /**
   * Get fallback patient list
   */
  getPatients(limit: number = 50): Patient[] {
    return this.getCachedOrGenerate(`patients_${limit}`, () => {
      const patients: Patient[] = [];
      const firstNames = [
        "John",
        "Jane",
        "Michael",
        "Emily",
        "David",
        "Sarah",
        "Robert",
        "Linda",
        "James",
        "Karen",
      ];
      const lastNames = [
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Garcia",
        "Miller",
        "Davis",
        "Rodriguez",
        "Martinez",
      ];
      const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
      const insurance = [
        "Blue Cross",
        "Aetna",
        "Cigna",
        "UnitedHealth",
        "Medicare",
      ];
      const marital = ["Single", "Married", "Divorced", "Widowed"];

      for (let i = 1; i <= limit; i++) {
        const first = this.randomChoice(firstNames);
        const last = this.randomChoice(lastNames);
        const age = Math.floor(Math.random() * 82) + 1; // 1..82
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - age;
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(
          2,
          "0"
        );
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");

        patients.push({
          patient_id: i,
          identifier: `P${String(i).padStart(4, "0")}`,
          given_name: first,
          family_name: last,
          full_name: `${first} ${last}`,
          birth_date: `${birthYear}-${month}-${day}`,
          age,
          gender: Math.random() > 0.5 ? "Male" : "Female",
          phone: `+1-555-${String(
            Math.floor(Math.random() * 900) + 100
          )}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
          blood_type: this.randomChoice(bloodTypes),
          insurance_provider: this.randomChoice(insurance),
          marital_status: this.randomChoice(marital),
        });
      }

      return patients;
    });
  }

  /**
   * Get fallback oxygen station data with simulated real-time updates
   */
  getOxygenStations(): OxygenStation[] {
    const baseKey = "oxygen_stations";
    const cached = this.cache.get(baseKey);

    // Update oxygen levels every 5 seconds with small variations
    if (cached && Date.now() - cached.timestamp < this.config.updateInterval) {
      return cached.data;
    }

    const stations: OxygenStation[] = [
      {
        station_id: 1,
        station_code: "OXY001",
        station_name: "ICU Oxygen Station 1",
        location: "ICU Room 101",
        current_level_percentage: this.simulateOxygenLevel(95, "normal"),
        pressure_psi: 45 + Math.random() * 10,
        flow_rate_lpm: 2.5 + Math.random() * 2,
        status: "normal",
        patient_name: "John Anderson",
        patient_identifier: "P0001",
        assigned_staff: "Dr. Smith",
        ward_name: "ICU",
        bed_number: "101A",
        capacity_liters: 500,
        current_level_liters: 475 + Math.floor(Math.random() * 20),
        last_maintenance: "2024-09-20",
        next_maintenance_due: "2024-10-20",
      },
      {
        station_id: 2,
        station_code: "OXY002",
        station_name: "Emergency Oxygen Station",
        location: "Emergency Room 1",
        current_level_percentage: this.simulateOxygenLevel(29, "critical"), // Match the critical level from dashboard
        pressure_psi: 25 + Math.random() * 15,
        flow_rate_lpm: 3.0 + Math.random() * 2,
        status: "critical",
        patient_name: "Maria Garcia",
        patient_identifier: "P0002",
        assigned_staff: "Dr. Johnson",
        ward_name: "Emergency",
        bed_number: "ER-01",
        capacity_liters: 500,
        current_level_liters: 145 + Math.floor(Math.random() * 10),
        last_maintenance: "2024-09-18",
        next_maintenance_due: "2024-10-18",
      },
      // Add more stations as needed...
    ];

    // Add 9 more stations to match the dashboard total of 11
    for (let i = 3; i <= 11; i++) {
      const levelCategory =
        Math.random() < 0.6
          ? "normal"
          : Math.random() < 0.8
          ? "warning"
          : "critical";
      let baseLevel: number;
      let status: string;

      switch (levelCategory) {
        case "normal":
          baseLevel = 85;
          status = "normal";
          break;
        case "warning":
          baseLevel = 65;
          status = "warning";
          break;
        default:
          baseLevel = 35;
          status = "critical";
          break;
      }

      stations.push({
        station_id: i,
        station_code: `OXY${String(i).padStart(3, "0")}`,
        station_name: `Oxygen Station ${i}`,
        location: i <= 5 ? `ICU Room ${100 + i}` : `Ward ${i - 5} Room ${i}`,
        current_level_percentage: this.simulateOxygenLevel(
          baseLevel,
          levelCategory
        ),
        pressure_psi: 35 + Math.random() * 20,
        flow_rate_lpm: 1.5 + Math.random() * 3,
        status,
        ward_name: i <= 5 ? "ICU" : "General Ward",
        bed_number:
          i <= 5 ? `${100 + i}A` : `W${i - 5}-${String(i).padStart(2, "0")}`,
        capacity_liters: 500,
        current_level_liters:
          Math.floor((baseLevel / 100) * 500) + Math.floor(Math.random() * 50),
        last_maintenance: "2024-09-15",
        next_maintenance_due: "2024-10-15",
      });
    }

    this.cache.set(baseKey, { data: stations, timestamp: Date.now() });
    return stations;
  }

  /**
   * Get fallback staff data
   */
  getStaff(): Staff[] {
    return this.getCachedOrGenerate("staff", () => {
      const staff: Staff[] = [];
      const roles = ["Doctor", "Nurse", "Technician", "Administrator"];
      const departments = [
        "ICU",
        "Emergency",
        "General Medicine",
        "Surgery",
        "Radiology",
      ];
      const shifts = ["Day", "Night", "Evening"];
      const specializations = [
        "Cardiology",
        "Respiratory",
        "Emergency Medicine",
        "General Practice",
        "Surgery",
      ];

      for (let i = 1; i <= 120; i++) {
        const role = this.randomChoice(roles);
        staff.push({
          staff_id: `S${String(i).padStart(4, "0")}`,
          given_name: `Staff${i}`,
          family_name: `Member${i}`,
          full_name: `Staff${i} Member${i}`,
          role,
          department: this.randomChoice(departments),
          status: Math.random() > 0.1 ? "active" : "off_duty",
          shift: this.randomChoice(shifts),
          email: `staff${i}@hospital.com`,
          phone: `555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          years_experience: Math.floor(Math.random() * 25) + 1,
          specialization: [this.randomChoice(specializations)],
          workload: Math.floor(Math.random() * 100),
        });
      }

      return staff;
    });
  }

  /**
   * Get fallback healthcare statistics
   */
  getHealthcareStats(): HealthcareStats[] {
    return this.getCachedOrGenerate("healthcare_stats", () => {
      const stats: HealthcareStats[] = [];

      for (let year = 2010; year <= 2024; year++) {
        stats.push({
          year_period: year,
          population_total: 328000000 + (year - 2010) * 2500000,
          life_expectancy_male: 76.1 + (year - 2010) * 0.1,
          life_expectancy_female: 81.1 + (year - 2010) * 0.1,
          obesity_rate: 36.2 + Math.random() * 2 - 1,
          diabetes_prevalence: 10.5 + Math.random() * 1.5,
          hypertension_prevalence: 45.4 + Math.random() * 3,
          healthcare_spending_per_capita: 8000 + (year - 2010) * 500,
        });
      }

      return stats;
    });
  }

  /**
   * Get fallback AI response for What-If Analysis
   */
  // Note: What-If AI fallback removed as the What-If feature has been decommissioned.

  /**
   * Simulate oxygen level with realistic variations
   */
  private simulateOxygenLevel(baseLevel: number, category: string): number {
    let variation: number;

    switch (category) {
      case "critical":
        // Critical levels fluctuate more dramatically
        variation = (Math.random() - 0.5) * 10;
        break;
      case "warning":
        // Warning levels have moderate fluctuation
        variation = (Math.random() - 0.5) * 6;
        break;
      default:
        // Normal levels have small fluctuation
        variation = (Math.random() - 0.5) * 3;
    }

    return Math.max(5, Math.min(100, baseLevel + variation));
  }

  /**
   * Get or generate cached data
   */
  private getCachedOrGenerate<T>(key: string, generator: () => T): T {
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
      return cached.data;
    }

    const data = generator();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Get random variation for realistic data
   */
  private getRandomVariation(): (min: number, max: number) => number {
    if (!this.config.enableRandomization) {
      return () => 0;
    }

    return (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
  }

  /**
   * Choose random item from array
   */
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<FallbackConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export default FallbackDataProvider.getInstance();
