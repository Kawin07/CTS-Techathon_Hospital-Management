/**
 * Network Status Indicator Component
 * Shows current network status, offline mode, and system health
 */

import React, { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  RefreshCw,
  Activity,
  Clock,
  Database,
} from "lucide-react";
import OfflineModeService, {
  NetworkStatus,
} from "../services/OfflineModeService";
import EnhancedApiService from "../services/EnhancedApiService";

interface SystemStatus {
  network: NetworkStatus;
  health: {
    networkStatus: "online" | "offline" | "slow";
    errorRate: number;
    fallbackMode: boolean;
    offlineDataAvailable: number;
    lastSuccessfulSync?: Date;
  };
}

const NetworkStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>({
    network: OfflineModeService.getStatus(),
    health: EnhancedApiService.getSystemHealth(),
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Subscribe to network status changes
    const unsubscribe = OfflineModeService.subscribe((networkStatus) => {
      setStatus((prev) => ({
        ...prev,
        network: networkStatus,
        health: EnhancedApiService.getSystemHealth(),
      }));
    });

    // Update health status periodically
    const healthInterval = setInterval(() => {
      setStatus((prev) => ({
        ...prev,
        health: EnhancedApiService.getSystemHealth(),
      }));
    }, 30000); // Update every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(healthInterval);
    };
  }, []);

  const handleRefresh = async () => {
    if (status.network.isOnline && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await EnhancedApiService.refreshAllData();
        // Update status after refresh
        setStatus((prev) => ({
          ...prev,
          health: EnhancedApiService.getSystemHealth(),
        }));
      } catch (error) {
        console.error("Refresh failed:", error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const getStatusColor = () => {
    if (!status.network.isOnline) return "bg-red-500";
    if (status.network.isSlowConnection || status.health.fallbackMode)
      return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusText = () => {
    if (!status.network.isOnline) return "Offline";
    if (status.health.fallbackMode) return "Fallback Mode";
    if (status.network.isSlowConnection) return "Slow Connection";
    return "Online";
  };

  const getStatusIcon = () => {
    if (!status.network.isOnline) return <WifiOff className="w-4 h-4" />;
    if (status.network.isSlowConnection)
      return <AlertTriangle className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Compact Status Indicator */}
      <div
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
          isExpanded
            ? "bg-white shadow-lg border border-gray-200"
            : "bg-white/90 backdrop-blur-sm shadow-md"
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Click for detailed network status"
      >
        <div
          className={`w-2 h-2 rounded-full ${getStatusColor()} ${
            !status.network.isOnline ? "animate-pulse" : ""
          }`}
        />
        <div className="text-white">{getStatusIcon()}</div>
        <span className="text-sm font-medium text-gray-700">
          {getStatusText()}
        </span>
        {status.health.fallbackMode && (
          <div
            className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"
            title="Using fallback data"
          />
        )}
      </div>

      {/* Expanded Status Details */}
      {isExpanded && (
        <div className="mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-80 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>System Status</span>
            </h3>
            <button
              onClick={handleRefresh}
              disabled={!status.network.isOnline || isRefreshing}
              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh data"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Network Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Network</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span
                  className={`text-sm font-medium ${
                    status.network.isOnline ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {getStatusText()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Connection Type</span>
              <span className="text-sm font-medium text-gray-900">
                {status.network.connectionType || "Unknown"}
              </span>
            </div>

            {/* Offline Data Available */}
            {status.health.offlineDataAvailable > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center space-x-1">
                  <Database className="w-3 h-3" />
                  <span>Cached Data</span>
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {status.health.offlineDataAvailable} items
                </span>
              </div>
            )}

            {/* Last Sync Time */}
            {status.health.lastSuccessfulSync && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Last Sync</span>
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {status.health.lastSuccessfulSync.toLocaleTimeString()}
                </span>
              </div>
            )}

            {/* Error Rate */}
            {status.health.errorRate > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recent Errors</span>
                <span className="text-sm font-medium text-orange-600">
                  {status.health.errorRate}
                </span>
              </div>
            )}
          </div>

          {/* Status Messages */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            {!status.network.isOnline && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Offline Mode Active
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Using cached data. Some features may be limited.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status.network.isOnline && status.health.fallbackMode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Fallback Mode
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Some services unavailable. Using backup data.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status.network.isOnline && !status.health.fallbackMode && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-start space-x-2">
                  <Wifi className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      All Systems Online
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Real-time data and all features available.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {status.network.isOnline && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span>
                  {isRefreshing ? "Refreshing..." : "Refresh All Data"}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkStatusIndicator;
