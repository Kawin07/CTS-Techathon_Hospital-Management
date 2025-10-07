// Real-time data simulation service for hospital operations
// This service generates realistic hospital data patterns with temporal variations

export interface RealTimeData {
  timestamp: number;
  oxygenStations: OxygenStationData[];
  bedOccupancy: BedOccupancyData;
  staffMetrics: StaffMetricsData;
  patientFlow: PatientFlowData;
  emergencyMetrics: EmergencyMetricsData;
  environmentalFactors: EnvironmentalData;
}

export interface OxygenStationData {
  stationId: string;
  location: string;
  currentLevel: number;
  flowRate: number;
  pressure: number;
  patientId?: string;
  alertStatus: 'normal' | 'warning' | 'critical';
  lastMaintenance: number;
  consumptionRate: number;
}

export interface BedOccupancyData {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  cleaningBeds: number;
  maintenanceBeds: number;
  admissionRate: number;
  dischargeRate: number;
  averageStayDuration: number;
  icuOccupancy: number;
  emergencyOccupancy: number;
  generalOccupancy: number;
}

export interface StaffMetricsData {
  totalStaff: number;
  onDutyStaff: number;
  averageWorkload: number;
  doctorsOnDuty: number;
  nursesOnDuty: number;
  technicianOnDuty: number;
  overtimeHours: number;
  shiftChangeTime: number;
  staffUtilization: number;
}

export interface PatientFlowData {
  totalPatients: number;
  newAdmissions: number;
  discharges: number;
  transfers: number;
  waitingTime: number;
  criticalPatients: number;
  stablePatients: number;
  recoveringPatients: number;
}

export interface EmergencyMetricsData {
  activeEmergencies: number;
  emergencyWaitTime: number;
  traumaCases: number;
  cardiacCases: number;
  ambulanceArrivals: number;
  severityDistribution: {
    critical: number;
    urgent: number;
    nonUrgent: number;
  };
}

export interface EnvironmentalData {
  temperature: number;
  humidity: number;
  airQuality: number;
  seasonalFactor: number;
  weatherImpact: number;
  dayOfWeek: number;
  timeOfDay: number;
  holidayFactor: number;
}

class RealTimeSimulator {
  private intervalId: number | null = null;
  private subscribers: ((data: RealTimeData) => void)[] = [];
  private currentData: RealTimeData;
  private simulationSpeed: number = 1000; // ms per update

  constructor() {
    this.currentData = this.generateInitialData();
  }

  // Subscribe to real-time updates
  subscribe(callback: (data: RealTimeData) => void): () => void {
    this.subscribers.push(callback);
    // Immediately send current data to new subscriber
    callback(this.currentData);
    
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Start real-time simulation
  start(): void {
    if (this.intervalId) return;
    
    this.intervalId = window.setInterval(() => {
      this.updateSimulation();
    }, this.simulationSpeed);
  }

  // Stop real-time simulation
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Set simulation speed (milliseconds between updates)
  setSpeed(speed: number): void {
    this.simulationSpeed = Math.max(100, speed);
    if (this.intervalId) {
      this.stop();
      this.start();
    }
  }

  // Generate initial realistic data
  private generateInitialData(): RealTimeData {
    const now = Date.now();
    const date = new Date(now);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    return {
      timestamp: now,
      oxygenStations: this.generateOxygenStations(),
      bedOccupancy: this.generateBedOccupancy(hour, dayOfWeek),
      staffMetrics: this.generateStaffMetrics(hour, dayOfWeek),
      patientFlow: this.generatePatientFlow(hour, dayOfWeek),
      emergencyMetrics: this.generateEmergencyMetrics(hour, dayOfWeek),
      environmentalFactors: this.generateEnvironmentalData(hour, dayOfWeek)
    };
  }

  // Update simulation with realistic variations
  private updateSimulation(): void {
    const now = Date.now();
    const date = new Date(now);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    // Apply temporal patterns and random variations
    this.currentData = {
      timestamp: now,
      oxygenStations: this.updateOxygenStations(this.currentData.oxygenStations),
      bedOccupancy: this.updateBedOccupancy(this.currentData.bedOccupancy, hour, dayOfWeek),
      staffMetrics: this.updateStaffMetrics(this.currentData.staffMetrics, hour, dayOfWeek),
      patientFlow: this.updatePatientFlow(this.currentData.patientFlow, hour, dayOfWeek),
      emergencyMetrics: this.updateEmergencyMetrics(this.currentData.emergencyMetrics, hour, dayOfWeek),
      environmentalFactors: this.generateEnvironmentalData(hour, dayOfWeek)
    };

    // Notify all subscribers
    this.subscribers.forEach(callback => callback(this.currentData));
  }

  private generateOxygenStations(): OxygenStationData[] {
    const stations = [
      'ICU-1', 'ICU-2', 'ICU-3', 'ICU-4',
      'ER-1', 'ER-2', 'ER-3',
      'Ward-204', 'Ward-205', 'Ward-301', 'Ward-302'
    ];

    return stations.map((location, index) => ({
      stationId: `OXY${String(index + 1).padStart(3, '0')}`,
      location,
      currentLevel: Math.max(70, Math.min(100, 85 + (Math.random() - 0.5) * 20)),
      flowRate: Math.max(0.5, Math.min(5, 2.5 + (Math.random() - 0.5) * 2)),
      pressure: Math.max(30, Math.min(70, 50 + (Math.random() - 0.5) * 20)),
      patientId: Math.random() > 0.3 ? `P${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}` : undefined,
      alertStatus: this.determineOxygenAlert(85 + (Math.random() - 0.5) * 20),
      lastMaintenance: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      consumptionRate: Math.max(0.1, Math.min(2, 0.8 + (Math.random() - 0.5) * 0.6))
    }));
  }

  private updateOxygenStations(current: OxygenStationData[]): OxygenStationData[] {
    return current.map(station => {
      // Simulate realistic oxygen level changes
      const levelChange = (Math.random() - 0.5) * 3;
      const newLevel = Math.max(60, Math.min(100, station.currentLevel + levelChange));
      
      // Flow rate adjustments based on level
      let flowRateChange = 0;
      if (newLevel < 75) flowRateChange = Math.random() * 0.5;
      else if (newLevel > 95) flowRateChange = -Math.random() * 0.3;
      
      const newFlowRate = Math.max(0.5, Math.min(5, station.flowRate + flowRateChange));
      
      // Pressure variations
      const pressureChange = (Math.random() - 0.5) * 5;
      const newPressure = Math.max(30, Math.min(70, station.pressure + pressureChange));

      return {
        ...station,
        currentLevel: newLevel,
        flowRate: newFlowRate,
        pressure: newPressure,
        alertStatus: this.determineOxygenAlert(newLevel),
        consumptionRate: Math.max(0.1, station.consumptionRate + (Math.random() - 0.5) * 0.1)
      };
    });
  }

  private determineOxygenAlert(level: number): 'normal' | 'warning' | 'critical' {
    if (level < 70) return 'critical';
    if (level < 80) return 'warning';
    return 'normal';
  }

  private generateBedOccupancy(hour: number, dayOfWeek: number): BedOccupancyData {
    // Occupancy patterns: higher on weekdays, lower on weekends
    const weekdayFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.85 : 1.0;
    
    // Time-based patterns: admissions higher in morning, discharges in afternoon
    const timeMultiplier = hour < 6 ? 0.9 : hour < 12 ? 1.1 : hour < 18 ? 1.0 : 0.95;
    
    const totalBeds = 200;
    const baseOccupancy = Math.floor(totalBeds * 0.75 * weekdayFactor * timeMultiplier);
    const occupied = Math.max(50, Math.min(totalBeds - 10, baseOccupancy + Math.floor((Math.random() - 0.5) * 20)));
    
    return {
      totalBeds,
      occupiedBeds: occupied,
      availableBeds: totalBeds - occupied - 5 - 2, // minus cleaning and maintenance
      cleaningBeds: 5,
      maintenanceBeds: 2,
      admissionRate: Math.max(0, (hour < 12 ? 0.8 : 0.4) + (Math.random() - 0.5) * 0.3),
      dischargeRate: Math.max(0, (hour > 10 && hour < 16 ? 0.9 : 0.2) + (Math.random() - 0.5) * 0.3),
      averageStayDuration: 4.5 + (Math.random() - 0.5) * 2,
      icuOccupancy: Math.floor(20 * (0.8 + (Math.random() - 0.5) * 0.3)),
      emergencyOccupancy: Math.floor(15 * (0.6 + (Math.random() - 0.5) * 0.4)),
      generalOccupancy: occupied - Math.floor(20 * (0.8 + (Math.random() - 0.5) * 0.3)) - Math.floor(15 * (0.6 + (Math.random() - 0.5) * 0.4))
    };
  }

  private updateBedOccupancy(current: BedOccupancyData, hour: number, _dayOfWeek: number): BedOccupancyData {
    // Gradual changes in occupancy
    const occupancyChange = Math.floor((Math.random() - 0.5) * 4);
    const newOccupied = Math.max(50, Math.min(current.totalBeds - 7, current.occupiedBeds + occupancyChange));
    
    return {
      ...current,
      occupiedBeds: newOccupied,
      availableBeds: current.totalBeds - newOccupied - current.cleaningBeds - current.maintenanceBeds,
      admissionRate: Math.max(0, (hour < 12 ? 0.8 : 0.4) + (Math.random() - 0.5) * 0.3),
      dischargeRate: Math.max(0, (hour > 10 && hour < 16 ? 0.9 : 0.2) + (Math.random() - 0.5) * 0.3),
      averageStayDuration: Math.max(2, current.averageStayDuration + (Math.random() - 0.5) * 0.5)
    };
  }

  private generateStaffMetrics(hour: number, dayOfWeek: number): StaffMetricsData {
    // Staff levels vary by shift
    const shiftMultiplier = hour < 7 ? 0.7 : hour < 15 ? 1.0 : hour < 23 ? 0.9 : 0.6;
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.85 : 1.0;
    
    const totalStaff = 120;
    const onDuty = Math.floor(totalStaff * 0.75 * shiftMultiplier * weekendMultiplier);
    
    return {
      totalStaff,
      onDutyStaff: onDuty,
      averageWorkload: Math.max(30, Math.min(95, 65 + (Math.random() - 0.5) * 30)),
      doctorsOnDuty: Math.floor(onDuty * 0.25),
      nursesOnDuty: Math.floor(onDuty * 0.55),
      technicianOnDuty: Math.floor(onDuty * 0.20),
      overtimeHours: Math.max(0, Math.floor((Math.random() - 0.7) * 20)),
      shiftChangeTime: hour === 7 || hour === 15 || hour === 23 ? 1 : 0,
      staffUtilization: Math.max(60, Math.min(100, 80 + (Math.random() - 0.5) * 20))
    };
  }

  private updateStaffMetrics(current: StaffMetricsData, hour: number, _dayOfWeek: number): StaffMetricsData {
    const workloadChange = (Math.random() - 0.5) * 10;
    const newWorkload = Math.max(30, Math.min(95, current.averageWorkload + workloadChange));
    
    return {
      ...current,
      averageWorkload: newWorkload,
      overtimeHours: Math.max(0, current.overtimeHours + Math.floor((Math.random() - 0.8) * 3)),
      shiftChangeTime: hour === 7 || hour === 15 || hour === 23 ? 1 : 0,
      staffUtilization: Math.max(60, Math.min(100, current.staffUtilization + (Math.random() - 0.5) * 5))
    };
  }

  private generatePatientFlow(hour: number, dayOfWeek: number): PatientFlowData {
    const timeMultiplier = hour < 6 ? 0.5 : hour < 12 ? 1.2 : hour < 18 ? 1.0 : 0.7;
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.8 : 1.0;
    
    return {
      totalPatients: Math.floor(180 * weekendMultiplier * timeMultiplier),
      newAdmissions: Math.floor((5 + Math.random() * 10) * timeMultiplier),
      discharges: Math.floor((3 + Math.random() * 8) * (hour > 10 && hour < 16 ? 1.5 : 0.5)),
      transfers: Math.floor(Math.random() * 3),
      waitingTime: Math.max(5, Math.floor(20 + (Math.random() - 0.5) * 30)),
      criticalPatients: Math.floor(15 + Math.random() * 10),
      stablePatients: Math.floor(120 + Math.random() * 40),
      recoveringPatients: Math.floor(45 + Math.random() * 20)
    };
  }

  private updatePatientFlow(current: PatientFlowData, _hour: number, _dayOfWeek: number): PatientFlowData {
    const admissionChange = Math.floor((Math.random() - 0.5) * 4);
    const dischargeChange = Math.floor((Math.random() - 0.5) * 3);
    
    return {
      ...current,
      newAdmissions: Math.max(0, current.newAdmissions + admissionChange),
      discharges: Math.max(0, current.discharges + dischargeChange),
      transfers: Math.max(0, Math.floor(Math.random() * 4)),
      waitingTime: Math.max(5, current.waitingTime + Math.floor((Math.random() - 0.5) * 10)),
      criticalPatients: Math.max(10, current.criticalPatients + Math.floor((Math.random() - 0.5) * 3)),
      stablePatients: Math.max(100, current.stablePatients + Math.floor((Math.random() - 0.5) * 8)),
      recoveringPatients: Math.max(30, current.recoveringPatients + Math.floor((Math.random() - 0.5) * 5))
    };
  }

  private generateEmergencyMetrics(hour: number, dayOfWeek: number): EmergencyMetricsData {
    // Emergency cases peak in evening and weekend nights
    const timeMultiplier = hour < 6 ? 1.3 : hour < 12 ? 0.7 : hour < 18 ? 0.9 : 1.4;
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.2 : 1.0;
    
    const activeEmergencies = Math.max(0, Math.floor((3 + Math.random() * 6) * timeMultiplier * weekendMultiplier));
    
    return {
      activeEmergencies,
      emergencyWaitTime: Math.max(2, Math.floor(8 + Math.random() * 15)),
      traumaCases: Math.floor(activeEmergencies * 0.3),
      cardiacCases: Math.floor(activeEmergencies * 0.25),
      ambulanceArrivals: Math.max(0, Math.floor((1 + Math.random() * 3) * timeMultiplier)),
      severityDistribution: {
        critical: Math.floor(activeEmergencies * 0.2),
        urgent: Math.floor(activeEmergencies * 0.5),
        nonUrgent: Math.floor(activeEmergencies * 0.3)
      }
    };
  }

  private updateEmergencyMetrics(current: EmergencyMetricsData, _hour: number, _dayOfWeek: number): EmergencyMetricsData {
    const emergencyChange = Math.floor((Math.random() - 0.5) * 3);
    const newActiveEmergencies = Math.max(0, current.activeEmergencies + emergencyChange);
    
    return {
      ...current,
      activeEmergencies: newActiveEmergencies,
      emergencyWaitTime: Math.max(2, current.emergencyWaitTime + Math.floor((Math.random() - 0.5) * 5)),
      traumaCases: Math.floor(newActiveEmergencies * 0.3),
      cardiacCases: Math.floor(newActiveEmergencies * 0.25),
      ambulanceArrivals: Math.max(0, Math.floor((Math.random() - 0.3) * 4)),
      severityDistribution: {
        critical: Math.floor(newActiveEmergencies * 0.2),
        urgent: Math.floor(newActiveEmergencies * 0.5),
        nonUrgent: Math.floor(newActiveEmergencies * 0.3)
      }
    };
  }

  private generateEnvironmentalData(hour: number, dayOfWeek: number): EnvironmentalData {
    const date = new Date();
    const month = date.getMonth();
    
    // Seasonal variations
    const seasonalTemp = 20 + Math.sin((month / 12) * Math.PI * 2) * 10;
    const seasonalHumidity = 50 + Math.sin(((month + 3) / 12) * Math.PI * 2) * 20;
    
    return {
      temperature: seasonalTemp + Math.sin((hour / 24) * Math.PI * 2) * 5 + (Math.random() - 0.5) * 3,
      humidity: Math.max(30, Math.min(80, seasonalHumidity + (Math.random() - 0.5) * 10)),
      airQuality: Math.max(50, Math.min(100, 85 + (Math.random() - 0.5) * 20)),
      seasonalFactor: Math.sin((month / 12) * Math.PI * 2) * 0.3 + 0.7,
      weatherImpact: Math.random() > 0.8 ? Math.random() * 0.5 : 0, // Occasional weather events
      dayOfWeek,
      timeOfDay: hour / 24,
      holidayFactor: Math.random() > 0.95 ? 0.7 : 1.0 // Occasional holidays
    };
  }

  // Get current data snapshot
  getCurrentData(): RealTimeData {
    return { ...this.currentData };
  }

  // Simulate specific scenarios for testing
  simulateScenario(scenario: 'mass_casualty' | 'system_failure' | 'staff_shortage' | 'equipment_failure'): void {
    switch (scenario) {
      case 'mass_casualty':
        this.currentData.emergencyMetrics.activeEmergencies = 15;
        this.currentData.emergencyMetrics.traumaCases = 8;
        this.currentData.emergencyMetrics.severityDistribution.critical = 6;
        break;
      case 'system_failure':
        this.currentData.oxygenStations.forEach(station => {
          if (Math.random() > 0.7) {
            station.alertStatus = 'critical';
            station.currentLevel = Math.random() * 40 + 40;
          }
        });
        break;
      case 'staff_shortage':
        this.currentData.staffMetrics.onDutyStaff = Math.floor(this.currentData.staffMetrics.onDutyStaff * 0.6);
        this.currentData.staffMetrics.averageWorkload = 95;
        break;
      case 'equipment_failure':
        this.currentData.bedOccupancy.maintenanceBeds = 15;
        this.currentData.bedOccupancy.availableBeds = Math.max(5, this.currentData.bedOccupancy.availableBeds - 10);
        break;
    }
    
    // Notify subscribers of scenario change
    this.subscribers.forEach(callback => callback(this.currentData));
  }
}

// Singleton instance for global use
export const realTimeSimulator = new RealTimeSimulator();