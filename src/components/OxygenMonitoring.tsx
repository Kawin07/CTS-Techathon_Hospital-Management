import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Wind,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Target,
} from "lucide-react";
import {
  predictiveAnalytics,
  ResourcePrediction,
} from "../utils/predictiveAnalytics";

interface OxygenData {
  id: string;
  location: string;
  patientName?: string;
  patientId?: string;
  currentLevel: number;
  targetLevel: number;
  flowRate: number;
  pressure: number;
  status: "normal" | "warning" | "critical" | "offline";
  lastUpdate: string;
  trend: "up" | "down" | "stable";
  alerts: string[];
  cylinderCapacity?: number; // Total cylinder capacity in liters
  remainingOxygen?: number; // Remaining oxygen in liters
}

interface VendorApprovalRequest {
  id: string;
  station: OxygenData;
  level: number;
  timestamp: number;
}

const VENDOR_FORM_ENDPOINT = "https://formspree.io/f/xrbybjqq";
const HOSPITAL_ALERT_EMAIL = "alerts@smartcarehospital.example";
const VENDOR_NOTIFICATION_RESET_THRESHOLD = 55;

const OxygenMonitoring: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [predictiveInsights, setPredictiveInsights] =
    useState<ResourcePrediction | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);
  const [alertPopups, setAlertPopups] = useState<
    Array<{
      id: string;
      message: string;
      type: "critical" | "warning";
      timestamp: number;
    }>
  >([]);
  const [vendorApprovals, setVendorApprovals] = useState<
    VendorApprovalRequest[]
  >([]);

  const [oxygenStations, setOxygenStations] = useState<OxygenData[]>([
    {
      id: "OXY001",
      location: "ICU Room 1",
      patientName: "John Anderson",
      patientId: "P001",
      currentLevel: 95,
      targetLevel: 95,
      flowRate: 2.5,
      pressure: 50,
      status: "normal",
      lastUpdate: "2024-01-15 10:30",
      trend: "stable",
      alerts: [],
      cylinderCapacity: 500,
      remainingOxygen: 475,
    },
    {
      id: "OXY002",
      location: "ICU Room 2",
      patientName: "Maria Garcia",
      patientId: "P002",
      currentLevel: 48,
      targetLevel: 55,
      flowRate: 3.0,
      pressure: 45,
      status: "warning",
      lastUpdate: "2024-01-15 10:29",
      trend: "down",
      alerts: ["Below target level", "Flow rate adjusted"],
      cylinderCapacity: 400,
      remainingOxygen: 320,
    },
    {
      id: "OXY003",
      location: "Emergency Room 1",
      currentLevel: 96,
      targetLevel: 95,
      flowRate: 1.0,
      pressure: 52,
      status: "normal",
      lastUpdate: "2024-01-15 10:25",
      trend: "stable",
      alerts: [],
      cylinderCapacity: 600,
      remainingOxygen: 580,
    },
    {
      id: "OXY004",
      location: "General Ward 204",
      patientName: "Robert Johnson",
      patientId: "P003",
      currentLevel: 97,
      targetLevel: 94,
      flowRate: 1.5,
      pressure: 55,
      status: "normal",
      lastUpdate: "2024-01-15 10:31",
      trend: "up",
      alerts: [],
      cylinderCapacity: 350,
      remainingOxygen: 340,
    },
  ]);

  const vendorNotificationRef = useRef<Record<string, number>>({});
  const pendingApprovalRef = useRef<Record<string, string | undefined>>({});

  const sendVendorNotification = useCallback(
    async (station: OxygenData, level: number) => {
      try {
        const response = await fetch(VENDOR_FORM_ENDPOINT, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: HOSPITAL_ALERT_EMAIL,
            subject: `Oxygen cylinder below 40% - ${station.location}`,
            message: `Station ${station.id} at ${
              station.location
            } has an oxygen level of ${Math.round(
              level
            )}% (below 40%). Immediate cylinder refill or replacement is required.`,
            stationId: station.id,
            location: station.location,
            currentLevel: `${Math.round(level)}%`,
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Form submission failed with status ${response.status}`
          );
        }

        vendorNotificationRef.current[station.id] = Date.now();

        setAlertPopups((prev) => [
          ...prev,
          {
            id: `${station.id}-vendor-${Date.now()}`,
            message: `Vendor notified for ${
              station.location
            } (level ${Math.round(level)}%).`,
            type: "warning",
            timestamp: Date.now(),
          },
        ]);
      } catch (error) {
        console.error("Failed to send vendor notification", error);
        delete vendorNotificationRef.current[station.id];
        setAlertPopups((prev) => [
          ...prev,
          {
            id: `${station.id}-vendor-error-${Date.now()}`,
            message: `Error notifying vendor for ${station.location}. Please check network settings.`,
            type: "warning",
            timestamp: Date.now(),
          },
        ]);
      }
    },
    []
  );

  useEffect(() => {
    const loadPredictions = async () => {
      const predictions = predictiveAnalytics.predictOxygenDemand();
      setPredictiveInsights(predictions);
    };

    loadPredictions();
    const predictionInterval = setInterval(loadPredictions, 60000);

    return () => clearInterval(predictionInterval);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const approvalsToQueue: VendorApprovalRequest[] = [];
      const approvalsToUpdate: VendorApprovalRequest[] = [];
      const approvalsToRemove: string[] = [];

      setOxygenStations((prev) =>
        prev.map((station) => {
          const hasPatient = !!station.patientName;

          const lowerBound =
            station.id === "OXY002" ? 20 : hasPatient ? 85 : 75;
          const upperBound = station.id === "OXY002" ? 95 : 100;

          let newCurrentLevel: number;
          let newFlowRate: number;

          if (hasPatient) {
            const levelChange = (Math.random() - 0.6) * 3;
            newCurrentLevel = Math.round(
              Math.max(
                lowerBound,
                Math.min(upperBound, station.currentLevel + levelChange)
              )
            );

            const flowChange = (Math.random() - 0.5) * 0.4;
            newFlowRate =
              Math.round(
                Math.max(1.5, Math.min(5, station.flowRate + flowChange)) * 10
              ) / 10;
          } else {
            const levelChange = (Math.random() - 0.3) * 1.5;
            newCurrentLevel = Math.round(
              Math.max(
                lowerBound,
                Math.min(upperBound, station.currentLevel + levelChange)
              )
            );

            const flowChange = (Math.random() - 0.5) * 0.2;
            newFlowRate =
              Math.round(
                Math.max(0.5, Math.min(2.5, station.flowRate + flowChange)) * 10
              ) / 10;
          }

          if (station.id === "OXY002") {
            const fineTune = (Math.random() - 0.5) * 4;
            newCurrentLevel = Math.round(
              Math.max(20, Math.min(60, newCurrentLevel + fineTune))
            );
          }

          const newPressure =
            Math.round(
              Math.max(
                30,
                Math.min(70, station.pressure + (Math.random() - 0.5) * 2)
              ) * 10
            ) / 10;

          const cylinderPercentage = Math.max(
            0,
            Math.min(100, newCurrentLevel + (Math.random() - 0.5) * 5)
          );
          const newRemainingOxygen = Math.round(
            (station.cylinderCapacity || 500) * (cylinderPercentage / 100)
          );

          let newStatus = station.status;
          if (newCurrentLevel < 20) newStatus = "critical";
          else if (newCurrentLevel < 60) newStatus = "warning";
          else newStatus = "normal";

          let newAlerts: string[] = [];
          if (newCurrentLevel < 20) {
            newAlerts = [
              "CRITICAL: Oxygen level dangerously low",
              "Immediate intervention required",
            ];
            if (
              station.currentLevel >= 20 ||
              !alertPopups.find((popup) =>
                popup.id.includes(`${station.id}-critical`)
              )
            ) {
              setAlertPopups((prev) => [
                ...prev,
                {
                  id: `${station.id}-critical-${Date.now()}`,
                  message: `🚨 CRITICAL: ${station.location} oxygen at ${newCurrentLevel}%`,
                  type: "critical",
                  timestamp: Date.now(),
                },
              ]);
            }
          } else if (newCurrentLevel < 60) {
            newAlerts = ["WARNING: Low oxygen level", "Monitor closely"];
            if (
              station.currentLevel >= 60 &&
              !alertPopups.find((popup) =>
                popup.id.includes(`${station.id}-warning`)
              )
            ) {
              setAlertPopups((prev) => [
                ...prev,
                {
                  id: `${station.id}-warning-${Date.now()}`,
                  message: `⚠️ WARNING: ${station.location} oxygen at ${newCurrentLevel}%`,
                  type: "warning",
                  timestamp: Date.now(),
                },
              ]);
            }
          } else {
            newAlerts = [];
          }

          let newTrend: "up" | "down" | "stable" = "stable";
          if (newCurrentLevel > station.currentLevel + 1) newTrend = "up";
          else if (newCurrentLevel < station.currentLevel - 1)
            newTrend = "down";

          const updatedStation: OxygenData = {
            ...station,
            currentLevel: newCurrentLevel,
            flowRate: newFlowRate,
            pressure: newPressure,
            remainingOxygen: newRemainingOxygen,
            status: newStatus,
            trend: newTrend,
            alerts: newAlerts,
            lastUpdate: new Date().toLocaleString(),
          };

          if (newCurrentLevel < 40) {
            const existingApprovalId = pendingApprovalRef.current[station.id];
            if (
              !existingApprovalId &&
              !vendorNotificationRef.current[station.id]
            ) {
              const approvalId = `${station.id}-approval-${Date.now()}`;
              pendingApprovalRef.current[station.id] = approvalId;
              approvalsToQueue.push({
                id: approvalId,
                station: updatedStation,
                level: newCurrentLevel,
                timestamp: Date.now(),
              });
            } else if (existingApprovalId) {
              approvalsToUpdate.push({
                id: existingApprovalId,
                station: updatedStation,
                level: newCurrentLevel,
                timestamp: Date.now(),
              });
            }
          } else if (newCurrentLevel >= VENDOR_NOTIFICATION_RESET_THRESHOLD) {
            const approvalId = pendingApprovalRef.current[station.id];
            if (approvalId) {
              approvalsToRemove.push(approvalId);
              delete pendingApprovalRef.current[station.id];
            }
            if (vendorNotificationRef.current[station.id]) {
              delete vendorNotificationRef.current[station.id];
            }
          }

          return updatedStation;
        })
      );

      if (
        approvalsToQueue.length > 0 ||
        approvalsToUpdate.length > 0 ||
        approvalsToRemove.length > 0
      ) {
        setVendorApprovals((prev) => {
          let next = prev;

          if (approvalsToQueue.length > 0) {
            next = [...next, ...approvalsToQueue];
          }

          if (approvalsToUpdate.length > 0) {
            const updateMap = new Map(
              approvalsToUpdate.map((req) => [req.id, req])
            );
            next = next.map((req) => {
              const update = updateMap.get(req.id);
              return update
                ? {
                    ...req,
                    station: update.station,
                    level: update.level,
                    timestamp: update.timestamp,
                  }
                : req;
            });
          }

          if (approvalsToRemove.length > 0) {
            const removeSet = new Set(approvalsToRemove);
            next = next.filter((req) => !removeSet.has(req.id));
          }

          return next;
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleApproveVendor = useCallback(
    async (request: VendorApprovalRequest) => {
      await sendVendorNotification(request.station, request.level);
      delete pendingApprovalRef.current[request.station.id];
      setVendorApprovals((prev) =>
        prev.filter((approval) => approval.id !== request.id)
      );
    },
    [sendVendorNotification]
  );

  const handleDismissVendor = useCallback((request: VendorApprovalRequest) => {
    delete pendingApprovalRef.current[request.station.id];
    setVendorApprovals((prev) =>
      prev.filter((approval) => approval.id !== request.id)
    );
  }, []);

  const handleManualVendorNotify = useCallback(
    (station: OxygenData) => {
      sendVendorNotification(station, station.currentLevel);
      const pendingId = pendingApprovalRef.current[station.id];
      if (pendingId) {
        delete pendingApprovalRef.current[station.id];
        setVendorApprovals((prev) =>
          prev.filter((approval) => approval.id !== pendingId)
        );
      }
    },
    [sendVendorNotification]
  );

  // Auto-remove alert popups after 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAlertPopups((prev) =>
        prev.filter((alert) => Date.now() - alert.timestamp < 10000)
      ); // Keep for 10 seconds
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "offline":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const criticalAlerts = oxygenStations.filter(
    (station) => station.status === "critical" || station.status === "warning"
  );

  // Oxygen Cylinder Component
  const OxygenCylinder: React.FC<{
    currentLevel: number; // Use the actual oxygen level percentage
    size?: "small" | "medium" | "large";
  }> = ({ currentLevel, size = "medium" }) => {
    // Use currentLevel (oxygen saturation) as the fill percentage, not remaining oxygen
    const fillPercentage = Math.max(0, Math.min(100, currentLevel));

    const sizeClasses = {
      small: { container: "w-8 h-16", cylinder: "w-6 h-12" },
      medium: { container: "w-12 h-24", cylinder: "w-10 h-20" },
      large: { container: "w-16 h-32", cylinder: "w-14 h-28" },
    };

    const getStatusColor = () => {
      if (fillPercentage < 20) return "from-red-500 to-red-600";
      if (fillPercentage < 60) return "from-yellow-500 to-yellow-600";
      return "from-green-500 to-green-600";
    };

    const getGlowColor = () => {
      if (fillPercentage < 20) return "shadow-red-500/50";
      if (fillPercentage < 60) return "shadow-yellow-500/50";
      return "shadow-green-500/50";
    };

    return (
      <div
        className={`relative flex flex-col items-center ${sizeClasses[size].container}`}
      >
        {/* Cylinder Body */}
        <div
          className={`relative ${
            sizeClasses[size].cylinder
          } border-2 border-gray-400 rounded-t-lg rounded-b-md bg-gradient-to-b from-gray-100 to-gray-200 overflow-hidden shadow-lg ${getGlowColor()}`}
          style={{
            boxShadow:
              fillPercentage > 0
                ? "0 0 20px rgba(0,0,0,0.1), 0 0 10px currentColor"
                : "0 0 20px rgba(0,0,0,0.1)",
          }}
        >
          {/* Oxygen Fill */}
          <div
            className={`absolute bottom-0 w-full bg-gradient-to-t ${getStatusColor()} transition-all duration-1000 ease-in-out`}
            style={{
              height: `${fillPercentage}%`,
              boxShadow:
                fillPercentage > 0
                  ? "inset 0 0 10px rgba(255,255,255,0.3)"
                  : "none",
            }}
          >
            {/* Bubbling Effect */}
            {fillPercentage > 10 && (
              <div className="absolute top-0 left-0 w-full h-full opacity-30">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${10 + i * 20}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: "2s",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pressure Lines */}
          <div className="absolute inset-0 pointer-events-none">
            {[25, 50, 75].map((line) => (
              <div
                key={line}
                className="absolute w-full h-px bg-gray-400 opacity-30"
                style={{ bottom: `${line}%` }}
              />
            ))}
          </div>
        </div>

        {/* Cylinder Top/Cap */}
        <div className="w-8 h-2 bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-full border border-gray-400 -mt-1 shadow-sm" />

        {/* Valve */}
        <div className="w-2 h-1 bg-gray-500 rounded-sm -mt-px" />

        {/* Percentage Label */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <span
            className={`text-xs font-bold px-2 py-1 rounded ${
              fillPercentage < 20
                ? "bg-red-100 text-red-800"
                : fillPercentage < 60
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {Math.round(fillPercentage)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Oxygen Monitoring
          </h1>
          <p className="text-gray-600">
            Real-time oxygen level monitoring and management
          </p>
        </div>
        <div className="flex space-x-3">
          {criticalAlerts.length > 0 && (
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{criticalAlerts.length} Alerts</span>
            </button>
          )}
          <button
            onClick={() => setShowPredictions(!showPredictions)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Brain className="w-4 h-4" />
            <span>AI Predictions</span>
          </button>
          {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button> */}
        </div>
      </div>

      {/* Alert Panel */}
      {showAlerts && criticalAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Critical Alerts</span>
          </h3>
          <div className="space-y-2">
            {criticalAlerts.map((station) => (
              <div
                key={station.id}
                className="bg-white p-3 rounded border border-red-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-900">
                      {station.location}
                    </p>
                    <p className="text-sm text-red-700">
                      Oxygen Level: {Math.round(station.currentLevel)}% (Target:{" "}
                      {Math.round(station.targetLevel)}%)
                    </p>
                  </div>
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                    Respond
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Predictions Panel */}
      {showPredictions && predictiveInsights && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>AI Oxygen Demand Predictions</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Next 4 Hours
                </span>
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {Math.round(
                  predictiveInsights.predictions
                    ?.slice(0, 4)
                    .reduce((sum: number, p: any) => sum + p.value, 0) / 4
                )}
                %
              </p>
              <p className="text-sm text-gray-500">Average demand</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Risk Level
                </span>
                <AlertTriangle
                  className={`w-4 h-4 ${
                    predictiveInsights.riskLevel === "critical"
                      ? "text-red-600"
                      : predictiveInsights.riskLevel === "high"
                      ? "text-orange-600"
                      : predictiveInsights.riskLevel === "medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                />
              </div>
              <p
                className={`text-lg font-bold ${
                  predictiveInsights.riskLevel === "critical"
                    ? "text-red-900"
                    : predictiveInsights.riskLevel === "high"
                    ? "text-orange-900"
                    : predictiveInsights.riskLevel === "medium"
                    ? "text-yellow-900"
                    : "text-green-900"
                }`}
              >
                {predictiveInsights.riskLevel?.toUpperCase()}
              </p>
              <p className="text-sm text-gray-500">Next 24 hours</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Optimization
                </span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">
                {predictiveInsights.optimizationScore}%
              </p>
              <p className="text-sm text-gray-500">Efficiency score</p>
            </div>
          </div>

          {predictiveInsights.regressionForecasts && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span>Linear Regression Forecasts</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 6, 24].map((hours) => {
                  const forecast =
                    predictiveInsights.regressionForecasts?.[hours];
                  if (!forecast) return null;

                  const delta =
                    forecast.value - predictiveInsights.currentValue;
                  const deltaLabel = `${delta >= 0 ? "+" : ""}${Math.round(
                    delta
                  )}%`;
                  const deltaColor =
                    delta > 2
                      ? "text-red-600"
                      : delta < -2
                      ? "text-green-600"
                      : "text-gray-600";

                  return (
                    <div
                      key={hours}
                      className="bg-white p-4 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Next {hours} {hours === 1 ? "Hour" : "Hours"}
                        </span>
                        {forecast.value >= predictiveInsights.currentValue ? (
                          <TrendingUp className="w-4 h-4 text-red-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-2xl font-bold text-purple-900">
                        {Math.round(forecast.value)}%
                      </p>
                      <p className={`text-sm font-semibold ${deltaColor}`}>
                        {deltaLabel} vs current
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Confidence: {Math.round(forecast.confidence * 100)}%
                      </p>
                    </div>
                  );
                })}
              </div>
              {typeof predictiveInsights.regressionSlope === "number" && (
                <p className="text-xs text-gray-500 mt-3">
                  Regression trend slope:{" "}
                  {predictiveInsights.regressionSlope >= 0
                    ? "rising"
                    : "falling"}{" "}
                  ({predictiveInsights.regressionSlope.toFixed(2)} %/hr)
                </p>
              )}
            </div>
          )}

          <div className="bg-white p-4 rounded-lg border border-purple-200">
            <h4 className="font-medium text-gray-900 mb-2">
              AI Recommendations
            </h4>
            <div className="space-y-2">
              {predictiveInsights.recommendations
                ?.slice(0, 3)
                .map((rec: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700">{rec}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Cylinder Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Wind className="w-5 h-5 text-blue-600" />
            <span>Oxygen Level Monitor</span>
          </h3>
          <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-lg">
            <span className="font-medium">Live Status:</span> Cylinder height
            shows oxygen saturation % | Levels adjust based on patient presence
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {oxygenStations.map((station) => (
            <div key={station.id} className="text-center">
              <OxygenCylinder
                currentLevel={station.currentLevel}
                size="large"
              />
              <div className="mt-4">
                <p className="font-medium text-gray-900 text-sm">
                  {station.location}
                </p>
                <p className="text-xs text-gray-600">{station.id}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {station.patientName
                    ? `${station.patientName}`
                    : "No Patient"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <Wind className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {oxygenStations.length}
              </p>
              <p className="text-sm text-gray-600">Active Stations</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {oxygenStations.filter((s) => s.status === "normal").length}
              </p>
              <p className="text-sm text-gray-600">Normal</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {oxygenStations.filter((s) => s.status === "warning").length}
              </p>
              <p className="text-sm text-gray-600">Warnings</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-600">
                {oxygenStations.filter((s) => s.status === "critical").length}
              </p>
              <p className="text-sm text-gray-600">Critical</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {oxygenStations.map((station) => (
          <div
            key={station.id}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-all duration-200 ${
              selectedStation === station.id
                ? "border-blue-500 bg-blue-50"
                : `border-gray-200 hover:border-gray-300 ${getStatusColor(
                    station.status
                  )
                    .replace("text-", "border-")
                    .replace("bg-", "border-")}`
            }`}
            onClick={() => setSelectedStation(station.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Wind className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {station.location}
                  </h3>
                  <p className="text-sm text-gray-600">Station {station.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(station.trend)}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    station.status
                  )}`}
                >
                  {station.status.charAt(0).toUpperCase() +
                    station.status.slice(1)}
                </span>
              </div>
            </div>

            {station.patientName && (
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="font-medium text-gray-900">
                  {station.patientName}
                </p>
                <p className="text-sm text-gray-600">ID: {station.patientId}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Oxygen Level
                    </p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {Math.round(station.currentLevel)}%
                      </span>
                      <span className="text-sm text-gray-500">
                        / {Math.round(station.targetLevel)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          station.currentLevel < 20
                            ? "bg-red-600"
                            : station.currentLevel < 60
                            ? "bg-yellow-500"
                            : "bg-green-600"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, Math.round(station.currentLevel))
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Flow Rate
                    </p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {Math.round(station.flowRate * 10) / 10}
                      </span>
                      <span className="text-sm text-gray-500">L/min</span>
                    </div>
                  </div>
                </div>

                {/* Cylinder Status */}
                <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Oxygen Level:</span>
                    <span className="font-medium">
                      {Math.round(station.currentLevel)}% O₂
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                    <span>
                      {station.patientName ? "Patient Present" : "No Patient"}
                    </span>
                    <span>
                      {Math.round(station.remainingOxygen || 0)}L tank
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Cylinder
                </p>
                <OxygenCylinder
                  currentLevel={station.currentLevel}
                  size="medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Pressure</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-lg font-semibold text-gray-900">
                    {Math.round(station.pressure * 10) / 10}
                  </span>
                  <span className="text-sm text-gray-500">PSI</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Last Update</p>
                <p className="text-sm text-gray-600">{station.lastUpdate}</p>
              </div>
            </div>

            {station.alerts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-2 mb-4">
                <p className="text-sm font-medium text-red-900 mb-1">Alerts:</p>
                <ul className="text-xs text-red-700 space-y-1">
                  {station.alerts.map((alert, index) => (
                    <li key={index}>• {alert}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors">
                Adjust Settings
              </button>
              <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors">
                View History
              </button>
              <button
                className="flex-1 bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700 transition-colors"
                onClick={() => handleManualVendorNotify(station)}
              >
                Notify Vendor
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Vendor Approval Popups */}
      {vendorApprovals.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm">
          {vendorApprovals.map((request) => (
            <div
              key={request.id}
              className="p-4 rounded-lg shadow-lg border-l-4 border-yellow-500 bg-yellow-50"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-yellow-900">
                    Vendor Approval Needed
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {request.station.location} oxygen at{" "}
                    {Math.round(request.level)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last update: {request.station.lastUpdate}
                  </p>
                  <div className="flex space-x-2 mt-3">
                    <button
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-semibold py-2 px-3 rounded"
                      onClick={() => handleApproveVendor(request)}
                    >
                      Approve &amp; Send
                    </button>
                    <button
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold py-2 px-3 rounded"
                      onClick={() => handleDismissVendor(request)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert Popups */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {alertPopups.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg shadow-lg border-l-4 max-w-sm animate-slide-in ${
              alert.type === "critical"
                ? "bg-red-50 border-red-500 text-red-800"
                : "bg-yellow-50 border-yellow-500 text-yellow-800"
            }`}
            style={{
              animation: "slideIn 0.3s ease-out",
            }}
          >
            <div className="flex items-start">
              <AlertTriangle
                className={`w-5 h-5 mr-3 mt-0.5 ${
                  alert.type === "critical" ? "text-red-600" : "text-yellow-600"
                }`}
              />
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {alert.type === "critical"
                    ? "Critical Alert"
                    : "Warning Alert"}
                </p>
                <p className="text-sm mt-1">{alert.message}</p>
                <p className="text-xs mt-2 opacity-75">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() =>
                  setAlertPopups((prev) =>
                    prev.filter((a) => a.id !== alert.id)
                  )
                }
                className="text-gray-400 hover:text-gray-600 ml-2"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OxygenMonitoring;
