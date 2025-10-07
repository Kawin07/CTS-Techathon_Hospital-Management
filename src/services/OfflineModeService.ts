/**
 * Offline Mode Detection Service
 * Monitors network connectivity and manages offline/online state
 */

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  effectiveType: string;
  lastOnlineTime?: Date;
  lastOfflineTime?: Date;
}

interface OfflineModeConfig {
  enableOfflineMode: boolean;
  enableSlowConnectionDetection: boolean;
  slowConnectionThreshold: number; // seconds for request timeout
  retryOnlineInterval: number; // milliseconds
  offlineDataTTL: number; // milliseconds
}

type NetworkListener = (status: NetworkStatus) => void;

class OfflineModeService {
  private static instance: OfflineModeService;
  private listeners: NetworkListener[] = [];
  private networkStatus: NetworkStatus;
  private config: OfflineModeConfig;
  private retryInterval?: NodeJS.Timeout;
  private offlineStorage: Map<
    string,
    { data: any; timestamp: number; ttl: number }
  > = new Map();

  constructor() {
    this.config = {
      enableOfflineMode: true,
      enableSlowConnectionDetection: true,
      slowConnectionThreshold: 10000, // 10 seconds
      retryOnlineInterval: 5000, // 5 seconds
      offlineDataTTL: 300000, // 5 minutes
    };

    this.networkStatus = {
      isOnline: navigator.onLine,
      isSlowConnection: false,
      connectionType: this.getConnectionType(),
      effectiveType: this.getEffectiveType(),
    };

    this.initialize();
  }

  static getInstance(): OfflineModeService {
    if (!OfflineModeService.instance) {
      OfflineModeService.instance = new OfflineModeService();
    }
    return OfflineModeService.instance;
  }

  private initialize(): void {
    // Listen for online/offline events
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);

    // Listen for connection changes
    if ("connection" in navigator) {
      (navigator as any).connection?.addEventListener(
        "change",
        this.handleConnectionChange
      );
    }

    // Start monitoring if offline mode is enabled
    if (this.config.enableOfflineMode) {
      this.startMonitoring();
    }
  }

  private handleOnline = (): void => {
    console.log("🟢 Network: Online");
    this.updateStatus({
      isOnline: true,
      lastOnlineTime: new Date(),
    });
    this.startConnectivityTest();
  };

  private handleOffline = (): void => {
    console.log("🔴 Network: Offline");
    this.updateStatus({
      isOnline: false,
      lastOfflineTime: new Date(),
    });
    this.startRetryMechanism();
  };

  private handleConnectionChange = (): void => {
    console.log("🔄 Network: Connection changed");
    this.updateStatus({
      connectionType: this.getConnectionType(),
      effectiveType: this.getEffectiveType(),
    });

    if (this.config.enableSlowConnectionDetection) {
      this.testConnectionSpeed();
    }
  };

  private updateStatus(updates: Partial<NetworkStatus>): void {
    this.networkStatus = { ...this.networkStatus, ...updates };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.networkStatus);
      } catch (error) {
        console.error("Error in network status listener:", error);
      }
    });
  }

  private startMonitoring(): void {
    // Initial connectivity test
    if (this.networkStatus.isOnline) {
      this.startConnectivityTest();
    }
  }

  private async startConnectivityTest(): Promise<void> {
    try {
      const startTime = Date.now();

      // Test actual connectivity by pinging a reliable endpoint
      const response = await fetch("/health", {
        method: "HEAD",
        cache: "no-cache",
        signal: AbortSignal.timeout(this.config.slowConnectionThreshold),
      });

      const responseTime = Date.now() - startTime;
      const isSlowConnection =
        responseTime > this.config.slowConnectionThreshold / 2;

      this.updateStatus({
        isOnline: response.ok,
        isSlowConnection:
          isSlowConnection && this.config.enableSlowConnectionDetection,
      });

      if (isSlowConnection) {
        console.warn(
          `⚠️ Slow connection detected: ${responseTime}ms response time`
        );
      }
    } catch (error) {
      console.warn("🔴 Connectivity test failed:", error);
      this.updateStatus({
        isOnline: false,
        isSlowConnection: false,
      });
      this.startRetryMechanism();
    }
  }

  private async testConnectionSpeed(): Promise<void> {
    if (!this.networkStatus.isOnline) return;

    try {
      const startTime = Date.now();
      await fetch("/health", {
        method: "HEAD",
        cache: "no-cache",
        signal: AbortSignal.timeout(5000),
      });
      const responseTime = Date.now() - startTime;

      const isSlowConnection =
        responseTime > this.config.slowConnectionThreshold / 2;

      if (isSlowConnection !== this.networkStatus.isSlowConnection) {
        this.updateStatus({ isSlowConnection });
      }
    } catch (error) {
      this.updateStatus({ isSlowConnection: true });
    }
  }

  private startRetryMechanism(): void {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }

    this.retryInterval = setInterval(async () => {
      if (!navigator.onLine) return;

      try {
        const response = await fetch("/health", {
          method: "HEAD",
          cache: "no-cache",
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          console.log("🟢 Connection restored");
          this.updateStatus({
            isOnline: true,
            lastOnlineTime: new Date(),
          });

          if (this.retryInterval) {
            clearInterval(this.retryInterval);
            this.retryInterval = undefined;
          }
        }
      } catch (error) {
        console.log("🔴 Still offline, will retry...");
      }
    }, this.config.retryOnlineInterval);
  }

  private getConnectionType(): string {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      return connection?.type || connection?.effectiveType || "unknown";
    }
    return "unknown";
  }

  private getEffectiveType(): string {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      return connection?.effectiveType || "unknown";
    }
    return "unknown";
  }

  /**
   * Public API
   */

  /**
   * Subscribe to network status changes
   */
  subscribe(listener: NetworkListener): () => void {
    this.listeners.push(listener);

    // Immediately call with current status
    listener(this.networkStatus);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current network status
   */
  getStatus(): NetworkStatus {
    return { ...this.networkStatus };
  }

  /**
   * Check if system should operate in offline mode
   */
  isOfflineMode(): boolean {
    return (
      !this.networkStatus.isOnline ||
      (this.config.enableSlowConnectionDetection &&
        this.networkStatus.isSlowConnection)
    );
  }

  /**
   * Store data for offline access
   */
  storeOfflineData(key: string, data: any, ttl?: number): void {
    const actualTTL = ttl || this.config.offlineDataTTL;
    this.offlineStorage.set(key, {
      data,
      timestamp: Date.now(),
      ttl: actualTTL,
    });
  }

  /**
   * Retrieve offline data
   */
  getOfflineData(key: string): any | null {
    const stored = this.offlineStorage.get(key);

    if (!stored) return null;

    // Check if data has expired
    if (Date.now() - stored.timestamp > stored.ttl) {
      this.offlineStorage.delete(key);
      return null;
    }

    return stored.data;
  }

  /**
   * Clear expired offline data
   */
  cleanupOfflineData(): void {
    const now = Date.now();
    for (const [key, stored] of this.offlineStorage.entries()) {
      if (now - stored.timestamp > stored.ttl) {
        this.offlineStorage.delete(key);
      }
    }
  }

  /**
   * Force connectivity check
   */
  async checkConnectivity(): Promise<boolean> {
    await this.startConnectivityTest();
    return this.networkStatus.isOnline;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OfflineModeConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get offline storage stats
   */
  getOfflineStats(): {
    storedItems: number;
    totalSize: string;
    oldestItem: Date | null;
    newestItem: Date | null;
  } {
    const items = Array.from(this.offlineStorage.values());

    let totalSize = 0;
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;

    items.forEach((item) => {
      const size = new Blob([JSON.stringify(item.data)]).size;
      totalSize += size;

      if (item.timestamp < oldestTimestamp) oldestTimestamp = item.timestamp;
      if (item.timestamp > newestTimestamp) newestTimestamp = item.timestamp;
    });

    return {
      storedItems: items.length,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      oldestItem: items.length > 0 ? new Date(oldestTimestamp) : null,
      newestItem: items.length > 0 ? new Date(newestTimestamp) : null,
    };
  }

  /**
   * Network quality indicator
   */
  getNetworkQuality(): "excellent" | "good" | "poor" | "offline" {
    if (!this.networkStatus.isOnline) return "offline";
    if (this.networkStatus.isSlowConnection) return "poor";

    const effectiveType = this.networkStatus.effectiveType;
    if (effectiveType === "4g" || effectiveType === "5g") return "excellent";
    if (effectiveType === "3g") return "good";

    return "poor";
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);

    if ("connection" in navigator) {
      (navigator as any).connection?.removeEventListener(
        "change",
        this.handleConnectionChange
      );
    }

    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }

    this.listeners = [];
    this.offlineStorage.clear();
  }
}

// Export singleton instance
export default OfflineModeService.getInstance();

// Export types for external use
export type { NetworkStatus, OfflineModeConfig, NetworkListener };
