/**
 * Enhanced API Service Integration
 * Combines ErrorHandlingService, FallbackDataProvider, and OfflineModeService
 */

import ErrorHandlingService from "./ErrorHandlingService";
import FallbackDataProvider from "./FallbackDataProvider";
import OfflineModeService from "./OfflineModeService";
import { Patient, OxygenStation, Staff, DashboardSummary } from "./ApiService";

class EnhancedApiService {
  private static instance: EnhancedApiService;
  private errorHandler = ErrorHandlingService;
  private fallbackProvider = FallbackDataProvider;
  private offlineService = OfflineModeService;

  static getInstance(): EnhancedApiService {
    if (!EnhancedApiService.instance) {
      EnhancedApiService.instance = new EnhancedApiService();
    }
    return EnhancedApiService.instance;
  }

  /**
   * Enhanced dashboard data with automatic fallback
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    const cacheKey = "dashboard_summary";

    // Check if offline mode
    if (this.offlineService.isOfflineMode()) {
      console.log("📱 Offline mode: Using cached dashboard data");
      const cachedData = this.offlineService.getOfflineData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      // Fall back to generated data if no cache
      return this.fallbackProvider.getDashboardSummary();
    }

    const result = await this.errorHandler.executeWithFallback(
      // Primary API call
      async () => {
        const response = await fetch("/dashboard/summary");
        if (!response.ok) {
          throw new Error(`Dashboard API failed: ${response.status}`);
        }
        return await response.json();
      },
      // Fallback function
      () => this.fallbackProvider.getDashboardSummary(),
      // Context
      "dashboard_summary"
    );

    // Store successful data for offline use
    if (result.success && !result.isFromFallback) {
      this.offlineService.storeOfflineData(cacheKey, result.data);
    }

    return result.data || this.fallbackProvider.getDashboardSummary();
  }

  // Utility to compute live hospital metrics for AI context
  async getLiveHospitalStatus(): Promise<{
    totalBeds: number;
    availableBeds: number;
    occupiedBeds: number;
    oxygenLevelPercent: number;
    totalStaff: number;
    staffOnDuty: number;
    staffLoadPercent: number;
    emergencyCases: number;
    criticalOxygenStations: number;
  }> {
    const summary = await this.getDashboardSummary();
    const totalBeds =
      (summary as any).available_beds + (summary as any).occupied_beds;
    const availableBeds = (summary as any).available_beds;
    const occupiedBeds = (summary as any).occupied_beds;
    const staffOnDuty = (summary as any).staff_on_duty ?? 0;
    const totalStaff = 120; // fallback default; could be computed from staff list
    const staffLoadPercent = totalStaff
      ? Math.round((staffOnDuty / totalStaff) * 100)
      : 0;
    const oxygenStatus = (summary as any).oxygen_status as
      | Array<{ status: string; count: number; avg_level: number }>
      | undefined;
    let oxygenLevelPercent = 0;
    let criticalOxygenStations = 0;
    if (oxygenStatus && oxygenStatus.length) {
      const totals = oxygenStatus.reduce(
        (acc, s) => {
          acc.weighted += (s.avg_level || 0) * (s.count || 0);
          acc.count += s.count || 0;
          return acc;
        },
        { weighted: 0, count: 0 }
      );
      if (totals.count > 0) {
        oxygenLevelPercent =
          Math.round((totals.weighted / totals.count) * 10) / 10;
      }
      const criticalBucket = oxygenStatus.find(
        (s) => (s.status || "").toLowerCase() === "critical"
      );
      if (criticalBucket) criticalOxygenStations = criticalBucket.count || 0;
    }
    return {
      totalBeds,
      availableBeds,
      occupiedBeds,
      oxygenLevelPercent,
      totalStaff,
      staffOnDuty,
      staffLoadPercent,
      emergencyCases:
        (summary as any).recent_conditions?.find(
          (c: any) => (c.condition_category || "").toLowerCase() === "emergency"
        )?.count ?? 0,
      criticalOxygenStations,
    };
  }

  /**
   * Enhanced patient data with automatic fallback
   */
  async getPatients(limit: number = 50): Promise<Patient[]> {
    const cacheKey = `patients_${limit}`;

    // Check offline mode
    if (this.offlineService.isOfflineMode()) {
      console.log("📱 Offline mode: Using cached patient data");
      const cachedData = this.offlineService.getOfflineData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      return this.fallbackProvider.getPatients(limit);
    }

    const result = await this.errorHandler.executeWithFallback(
      async () => {
        const response = await fetch(`/patients?limit=${limit}`);
        if (!response.ok) {
          throw new Error(`Patients API failed: ${response.status}`);
        }
        return await response.json();
      },
      () => this.fallbackProvider.getPatients(limit),
      "patients_list"
    );

    // Store for offline use
    if (result.success && !result.isFromFallback) {
      this.offlineService.storeOfflineData(cacheKey, result.data);
    }

    return result.data || this.fallbackProvider.getPatients(limit);
  }

  /**
   * Enhanced oxygen monitoring with real-time fallback
   */
  async getOxygenStations(): Promise<OxygenStation[]> {
    const cacheKey = "oxygen_stations";

    // Check offline mode
    if (this.offlineService.isOfflineMode()) {
      console.log("📱 Offline mode: Using cached oxygen data with simulation");
      const cachedData = this.offlineService.getOfflineData(cacheKey);
      if (cachedData) {
        // Add simulated updates to cached data to show "live" changes
        return this.simulateOxygenUpdates(cachedData);
      }
      return this.fallbackProvider.getOxygenStations();
    }

    const result = await this.errorHandler.executeWithFallback(
      async () => {
        const response = await fetch("/oxygen-stations");
        if (!response.ok) {
          throw new Error(`Oxygen API failed: ${response.status}`);
        }
        return await response.json();
      },
      () => this.fallbackProvider.getOxygenStations(),
      "oxygen_monitoring"
    );

    // Store for offline use
    if (result.success && !result.isFromFallback) {
      this.offlineService.storeOfflineData(cacheKey, result.data, 30000); // 30 seconds TTL for real-time data
    }

    return result.data || this.fallbackProvider.getOxygenStations();
  }

  /**
   * Enhanced staff data with fallback
   */
  async getStaff(): Promise<Staff[]> {
    const cacheKey = "staff_list";

    if (this.offlineService.isOfflineMode()) {
      console.log("📱 Offline mode: Using cached staff data");
      const cachedData = this.offlineService.getOfflineData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      return this.fallbackProvider.getStaff();
    }

    const result = await this.errorHandler.executeWithFallback(
      async () => {
        const response = await fetch("/staff");
        if (!response.ok) {
          throw new Error(`Staff API failed: ${response.status}`);
        }
        return await response.json();
      },
      () => this.fallbackProvider.getStaff(),
      "staff_management"
    );

    if (result.success && !result.isFromFallback) {
      this.offlineService.storeOfflineData(cacheKey, result.data);
    }

    return result.data || this.fallbackProvider.getStaff();
  }

  /**
   * Simulate oxygen level updates for offline mode
   */
  private simulateOxygenUpdates(stations: OxygenStation[]): OxygenStation[] {
    return stations.map((station) => {
      // Add small random variations to simulate real-time updates
      const variation = (Math.random() - 0.5) * 2; // ±1%
      const newLevel = Math.max(
        0,
        Math.min(100, station.current_level_percentage + variation)
      );

      return {
        ...station,
        current_level_percentage: Math.round(newLevel * 100) / 100,
        current_level_liters: Math.round(
          (newLevel / 100) * station.capacity_liters
        ),
      };
    });
  }

  /**
   * Get system health status
   */
  getSystemHealth(): {
    networkStatus: "online" | "offline" | "slow";
    errorRate: number;
    fallbackMode: boolean;
    offlineDataAvailable: number;
    lastSuccessfulSync?: Date;
  } {
    const networkStatus = this.offlineService.getStatus();
    const errorStats = this.errorHandler.getErrorStats();
    const offlineStats = this.offlineService.getOfflineStats();

    let status: "online" | "offline" | "slow" = "online";
    if (!networkStatus.isOnline) status = "offline";
    else if (networkStatus.isSlowConnection) status = "slow";

    return {
      networkStatus: status,
      errorRate: errorStats.totalErrors,
      fallbackMode: this.offlineService.isOfflineMode(),
      offlineDataAvailable: offlineStats.storedItems,
      lastSuccessfulSync: networkStatus.lastOnlineTime,
    };
  }

  /**
   * Force refresh all cached data when coming back online
   */
  async refreshAllData(): Promise<void> {
    if (this.offlineService.isOfflineMode()) {
      console.log("Cannot refresh data while offline");
      return;
    }

    console.log("🔄 Refreshing all cached data...");

    try {
      // Clear offline cache
      this.offlineService.cleanupOfflineData();

      // Fetch fresh data
      await Promise.allSettled([
        this.getDashboardSummary(),
        this.getPatients(),
        this.getOxygenStations(),
        this.getStaff(),
      ]);

      console.log("✅ Data refresh completed");
    } catch (error) {
      console.error("❌ Data refresh failed:", error);
    }
  }

  /**
   * Test all API endpoints
   */
  async healthCheck(): Promise<{
    dashboard: boolean;
    patients: boolean;
    oxygen: boolean;
    staff: boolean;
    network: boolean;
  }> {
    const results = {
      dashboard: false,
      patients: false,
      oxygen: false,
      staff: false,
      network: false,
    };

    // Check network connectivity
    results.network = await this.offlineService.checkConnectivity();

    if (!results.network) {
      return results;
    }

    // Test each endpoint
    try {
      await this.getDashboardSummary();
      results.dashboard = true;
    } catch (error) {
      console.warn("Dashboard health check failed:", error);
    }

    try {
      await this.getPatients(5);
      results.patients = true;
    } catch (error) {
      console.warn("Patients health check failed:", error);
    }

    try {
      await this.getOxygenStations();
      results.oxygen = true;
    } catch (error) {
      console.warn("Oxygen health check failed:", error);
    }

    try {
      await this.getStaff();
      results.staff = true;
    } catch (error) {
      console.warn("Staff health check failed:", error);
    }

    return results;
  }
}

export default EnhancedApiService.getInstance();
