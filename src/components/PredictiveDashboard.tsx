import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Brain,
  Target,
  Zap,
  Eye,
  Settings,
  RefreshCw,
  BarChart3,
  LineChart,
  PieChart,
  Users,
  Bed,
  Heart,
  Calendar,
  Clock,
  Award,
  ArrowUp,
  ArrowDown,
  Loader2,
  Wand2,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  predictiveAnalytics,
  ResourcePrediction,
  PredictionData,
} from "../utils/predictiveAnalytics";
import GeminiService, { LiveHospitalStatus } from "../services/GeminiService";
import aiConfig from "../config/aiConfig";
import PredictiveCharts from "./PredictiveCharts";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PredictiveInsights {
  oxygen: ResourcePrediction;
  beds: ResourcePrediction;
  staff: ResourcePrediction;
  emergency: ResourcePrediction;
  overallOptimization: number;
  criticalAlerts: string[];
}

interface StructuredForecastData {
  beds_needed?: number;
  oxygen_needed_liters?: number;
  staff_needed?: {
    doctors?: number;
    nurses?: number;
    technicians?: number;
    total?: number;
  };
  other_resources?: Array<{
    item: string;
    quantity: number;
    unit: string;
    priority?: "low" | "medium" | "high" | "critical" | string;
  }>;
  assumptions?: string[];
  time_window_minutes?: number;
}

interface AIForecastResult {
  immediateActions: string[];
  shortTermStrategy: string[];
  impact: {
    riskLevel?: string;
    costEstimate?: string;
    timeline?: string;
  };
  structured?: StructuredForecastData;
  assumptions: string[];
  generatedAt: Date;
  rawText: string;
}

const IMMEDIATE_SECTION = "**🚨 IMMEDIATE ACTIONS (0-15 min)**";
const SHORT_TERM_SECTION = "**⚡ SHORT-TERM STRATEGY (15 min - 4 hours)**";
const IMPACT_SECTION = "**📈 IMPACT & RECOVERY**";

const parseBulletList = (section: string): string[] => {
  if (!section) {
    return [];
  }

  return section
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);
};

const extractSectionText = (
  source: string,
  startMarker: string,
  endMarker?: string
): string => {
  const startIndex = source.indexOf(startMarker);
  if (startIndex === -1) {
    return "";
  }

  const start = startIndex + startMarker.length;
  const endIndex = endMarker ? source.indexOf(endMarker, start) : -1;
  const content =
    endIndex === -1 ? source.slice(start) : source.slice(start, endIndex);
  return content.trim();
};

const parseImpactSection = (section: string) => {
  const lines = parseBulletList(section);
  const impact: {
    riskLevel?: string;
    costEstimate?: string;
    timeline?: string;
  } = {};

  lines.forEach((line) => {
    const lower = line.toLowerCase();
    if (lower.startsWith("risk level")) {
      impact.riskLevel = line.split(":")[1]?.trim() || line;
    } else if (lower.startsWith("cost estimate")) {
      impact.costEstimate = line.split(":")[1]?.trim() || line;
    } else if (lower.startsWith("timeline")) {
      impact.timeline = line.split(":")[1]?.trim() || line;
    } else if (!impact.riskLevel && lower.includes("risk")) {
      impact.riskLevel = line;
    } else if (
      !impact.timeline &&
      (lower.includes("timeline") || lower.includes("recovery"))
    ) {
      impact.timeline = line;
    }
  });

  return impact;
};

const sanitizeJsonBlock = (raw: string): string => {
  const trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
  }
  return trimmed;
};

const parseAiForecastResponse = (response: string): AIForecastResult => {
  const jsonIndex = response.lastIndexOf("JSON:");
  if (jsonIndex === -1) {
    throw new Error("AI response missing structured JSON block");
  }

  const jsonRaw = sanitizeJsonBlock(response.slice(jsonIndex + 5));
  let structured: StructuredForecastData | undefined;

  if (jsonRaw) {
    try {
      structured = JSON.parse(jsonRaw);
    } catch (error) {
      throw new Error("Unable to parse AI JSON payload");
    }
  }

  const bodyText = response.slice(0, jsonIndex).trim();
  const immediateText = extractSectionText(
    bodyText,
    IMMEDIATE_SECTION,
    SHORT_TERM_SECTION
  );
  const shortTermText = extractSectionText(
    bodyText,
    SHORT_TERM_SECTION,
    IMPACT_SECTION
  );
  const impactText = extractSectionText(bodyText, IMPACT_SECTION);

  return {
    immediateActions: parseBulletList(immediateText),
    shortTermStrategy: parseBulletList(shortTermText),
    impact: parseImpactSection(impactText),
    structured,
    assumptions: structured?.assumptions ?? [],
    generatedAt: new Date(),
    rawText: response,
  };
};

const roundNumber = (value: number | null | undefined): number => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 0;
  }
  return Math.round(value);
};

const getMinValue = (predictions: PredictionData[]): number | null => {
  if (!predictions.length) {
    return null;
  }
  return Math.min(...predictions.map((p) => p.value));
};

const getMaxValue = (predictions: PredictionData[]): number | null => {
  if (!predictions.length) {
    return null;
  }
  return Math.max(...predictions.map((p) => p.value));
};

const buildAiForecastPrompt = (insights: PredictiveInsights): string => {
  const oxygenNext6 = insights.oxygen.predictions.slice(0, 6);
  const oxygenNext24 = insights.oxygen.predictions.slice(0, 24);
  const bedsNext24 = insights.beds.predictions.slice(0, 24);
  const staffNext24 = insights.staff.predictions.slice(0, 24);
  const emergencyNext12 = insights.emergency.predictions.slice(0, 12);

  const oxygenMin6 = roundNumber(getMinValue(oxygenNext6));
  const oxygenMin24 = roundNumber(getMinValue(oxygenNext24));
  const bedMin24 = roundNumber(getMinValue(bedsNext24));
  const staffMax24 = roundNumber(getMaxValue(staffNext24));
  const emergencyMax12 = roundNumber(getMaxValue(emergencyNext12));

  const totalBeds = aiConfig.hospitalContext.totalBeds;
  const totalStaff = aiConfig.hospitalContext.totalStaff;

  return `Provide a live operational forecast for a ${totalBeds}-bed Indian tertiary hospital. Focus on oxygen supply stabilization, bed management, staff deployment, and emergency throughput.

Current analytics snapshot (units noted):
- Oxygen supply: current ${roundNumber(insights.oxygen.currentValue)}%, risk ${
    insights.oxygen.riskLevel
  }, 6-hour projected low ${oxygenMin6}%, 24-hour projected low ${oxygenMin24}%.
- Bed availability: current ${roundNumber(
    insights.beds.currentValue
  )} beds free, risk ${
    insights.beds.riskLevel
  }, 24-hour projected low ${bedMin24} beds.
- Staff workload: current ${roundNumber(
    insights.staff.currentValue
  )}% utilization, risk ${
    insights.staff.riskLevel
  }, 24-hour projected peak ${staffMax24}%.
- Emergency demand: current ${roundNumber(
    insights.emergency.currentValue
  )} active cases, 12-hour projected peak ${emergencyMax12} cases.
- Overall optimization index: ${
    insights.overallOptimization
  }. Critical alerts: ${insights.criticalAlerts.join("; ") || "none"}.

Assume current oxygen reserve at ${roundNumber(
    insights.oxygen.currentValue
  )}% with target ≥85%. Staff pool totals ${totalStaff} members.

Deliver:
1. Immediate actions for the next 0-15 minutes and 15 minutes-4 hours covering oxygen vendors, patient triage, and staff moves.
2. Quantified resource requirements in liters, beds, and staff counts for the next ${
    insights.oxygen.predictions.length
  } hours.
3. A concise recovery outlook including risk level (1-10), cost estimate in INR, and stabilization timeline.

Use the exact section headings already provided. End the response with the strict JSON block defined in the system prompt.`;
};

const PredictiveDashboard: React.FC = () => {
  const [insights, setInsights] = useState<PredictiveInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedResource, setSelectedResource] = useState<string>("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [geminiService] = useState(
    () => new GeminiService(aiConfig.gemini.apiKey)
  );
  const [aiForecast, setAiForecast] = useState<AIForecastResult | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  // Load predictive insights
  const loadInsights = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const predictions = predictiveAnalytics.getAllPredictions();
      setInsights(predictions);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to load predictive insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh insights every 30 seconds
  useEffect(() => {
    loadInsights();

    if (autoRefresh) {
      const interval = setInterval(loadInsights, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "text-green-600 bg-green-100 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "high":
        return "text-orange-600 bg-orange-100 border-orange-200";
      case "critical":
        return "text-red-600 bg-red-100 border-red-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case "decreasing":
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getOptimizationColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityBadgeClass = (priority?: string) => {
    if (!priority) {
      return "bg-gray-100 text-gray-700 border border-gray-200";
    }

    switch (priority.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-blue-100 text-blue-800 border border-blue-200";
    }
  };

  const formatMinutes = (minutes?: number) => {
    if (minutes === undefined || minutes === null) {
      return "—";
    }
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = minutes / 60;
    if (hours >= 24) {
      return `${(hours / 24).toFixed(1)} days`;
    }
    return `${hours.toFixed(1)} hrs`;
  };

  const handleLiveForecast = async () => {
    setForecastError(null);
    setIsForecastLoading(true);
    setAiForecast(null);

    try {
      const latestInsights =
        insights ?? predictiveAnalytics.getAllPredictions();
      if (!insights) {
        setInsights(latestInsights);
      }

      const availableBeds = roundNumber(latestInsights.beds.currentValue);
      const liveContext: LiveHospitalStatus = {
        totalBeds: aiConfig.hospitalContext.totalBeds,
        availableBeds,
        occupiedBeds: Math.max(
          aiConfig.hospitalContext.totalBeds - availableBeds,
          0
        ),
        oxygenLevelPercent: roundNumber(latestInsights.oxygen.currentValue),
        totalStaff: aiConfig.hospitalContext.totalStaff,
        staffOnDuty: Math.round(
          (aiConfig.hospitalContext.totalStaff *
            roundNumber(latestInsights.staff.currentValue)) /
            100
        ),
        staffLoadPercent: roundNumber(latestInsights.staff.currentValue),
        emergencyCases: Math.round(latestInsights.emergency.currentValue),
      };

      const prompt = buildAiForecastPrompt(latestInsights);
      const response = await geminiService.generateInsights(
        prompt,
        liveContext
      );
      const parsed = parseAiForecastResponse(response);
      setAiForecast(parsed);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to generate AI live forecast:", error);
      setForecastError(
        error instanceof Error
          ? error.message
          : "Unknown error occurred while generating AI forecast."
      );
    } finally {
      setIsForecastLoading(false);
    }
  };

  if (isLoading && !insights) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900">
            Loading Predictive Insights...
          </p>
          <p className="text-gray-600">Analyzing hospital data patterns</p>
        </div>
      </div>
    );
  }

  // Generate mock chart data
  const generateChartData = () => ({
    oxygenTrend: [
      { time: "00:00", value: 85, predicted: 82 },
      { time: "04:00", value: 78, predicted: 75 },
      { time: "08:00", value: 65, predicted: 62 },
      { time: "12:00", value: 45, predicted: 42 },
      { time: "16:00", value: 38, predicted: 35 },
      { time: "20:00", value: 55, predicted: 52 },
      { time: "24:00", value: 72, predicted: 69 },
    ],
    bedUtilization: [
      { department: "Emergency", utilized: 45, total: 50, percentage: 90 },
      { department: "ICU", utilized: 28, total: 30, percentage: 93 },
      { department: "General", utilized: 85, total: 100, percentage: 85 },
      { department: "Surgery", utilized: 12, total: 15, percentage: 80 },
      { department: "Maternity", utilized: 18, total: 25, percentage: 72 },
    ],
    staffWorkload: [
      { shift: "Morning", consultants: 15, workers: 35, workload: 85 },
      { shift: "Afternoon", consultants: 12, workers: 28, workload: 92 },
      { shift: "Night", consultants: 8, workers: 20, workload: 78 },
    ],
    emergencyForecast: [
      { hour: "Now", cases: 2, predicted: 3 },
      { hour: "+1h", cases: null, predicted: 4 },
      { hour: "+2h", cases: null, predicted: 3 },
      { hour: "+3h", cases: null, predicted: 5 },
      { hour: "+4h", cases: null, predicted: 2 },
      { hour: "+5h", cases: null, predicted: 1 },
      { hour: "+6h", cases: null, predicted: 3 },
    ],
  });

  const chartData = generateChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Analytics Dashboard
              </span>
            </h1>
            <p className="text-gray-600 text-lg">
              Advanced AI-powered analytics and predictive insights for optimal
              healthcare management
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500 bg-white px-3 py-2 rounded-lg shadow-sm border">
              <Clock className="w-4 h-4 inline mr-1" />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <button
              onClick={handleLiveForecast}
              disabled={isForecastLoading}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isForecastLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              <span>
                {isForecastLoading ? "Predicting…" : "AI Live Forecast"}
              </span>
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
                autoRefresh
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-2">
                <RefreshCw
                  className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`}
                />
                <span>Auto-refresh</span>
              </div>
            </button>
            <button
              onClick={loadInsights}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2 disabled:opacity-50 shadow-lg"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {(isForecastLoading || forecastError || aiForecast) && (
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            {isForecastLoading && (
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Generating live AI forecast…
                  </h3>
                  <p className="text-sm text-gray-600">
                    Synthesizing predictive analytics with Gemini for actionable
                    recommendations
                  </p>
                </div>
              </div>
            )}

            {!isForecastLoading && forecastError && (
              <div className="flex items-start space-x-3 text-red-700">
                <AlertTriangle className="w-6 h-6 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">
                    Unable to generate AI forecast
                  </h3>
                  <p className="text-sm text-red-700 mb-2">{forecastError}</p>
                  <p className="text-xs text-red-500">
                    Please retry in a moment or verify the Gemini API key
                    configuration.
                  </p>
                </div>
              </div>
            )}

            {!isForecastLoading && !forecastError && aiForecast && (
              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl">
                      <Wand2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        AI Live Forecast Briefing
                      </h3>
                      <p className="text-sm text-gray-600">
                        Structured guidance from Gemini based on current
                        hospital analytics
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                    Generated at {aiForecast.generatedAt.toLocaleTimeString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <h4 className="text-sm font-semibold text-red-900 uppercase tracking-wide">
                        Immediate Actions (0-15 min)
                      </h4>
                    </div>
                    <ul className="space-y-2 text-sm text-red-800">
                      {aiForecast.immediateActions.length > 0 ? (
                        aiForecast.immediateActions.map((action, index) => (
                          <li
                            key={`immediate-${index}`}
                            className="flex items-start space-x-2"
                          >
                            <span className="mt-0.5">•</span>
                            <span className="flex-1">{action}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-red-700 opacity-70">
                          No immediate action items were provided.
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <h4 className="text-sm font-semibold text-yellow-900 uppercase tracking-wide">
                        Short-Term Strategy (15 min - 4 hrs)
                      </h4>
                    </div>
                    <ul className="space-y-2 text-sm text-yellow-800">
                      {aiForecast.shortTermStrategy.length > 0 ? (
                        aiForecast.shortTermStrategy.map((step, index) => (
                          <li
                            key={`short-${index}`}
                            className="flex items-start space-x-2"
                          >
                            <span className="mt-0.5">•</span>
                            <span className="flex-1">{step}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-yellow-700 opacity-70">
                          No short-term strategy steps were provided.
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 h-full">
                    <div className="flex items-center space-x-2 mb-3">
                      <Activity className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-sm font-semibold text-indigo-900 uppercase tracking-wide">
                        Impact & Recovery
                      </h4>
                    </div>
                    <div className="space-y-2 text-sm text-indigo-900">
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-700">Risk level</span>
                        <span className="font-semibold">
                          {aiForecast.impact.riskLevel ?? "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-700">Cost estimate</span>
                        <span className="font-semibold">
                          {aiForecast.impact.costEstimate ?? "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-700">
                          Stabilization timeline
                        </span>
                        <span className="font-semibold">
                          {aiForecast.impact.timeline ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {aiForecast.structured && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                        Quantified Resource Needs
                      </h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center justify-between">
                          <span>Beds required</span>
                          <span className="font-semibold text-gray-900">
                            {aiForecast.structured.beds_needed ?? "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Oxygen needed</span>
                          <span className="font-semibold text-gray-900">
                            {aiForecast.structured.oxygen_needed_liters !==
                            undefined
                              ? `${aiForecast.structured.oxygen_needed_liters} L`
                              : "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Total staff required</span>
                          <span className="font-semibold text-gray-900">
                            {aiForecast.structured.staff_needed?.total ?? "—"}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
                            <div className="text-gray-500">Doctors</div>
                            <div className="text-gray-900 font-semibold">
                              {aiForecast.structured.staff_needed?.doctors ??
                                "—"}
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
                            <div className="text-gray-500">Nurses</div>
                            <div className="text-gray-900 font-semibold">
                              {aiForecast.structured.staff_needed?.nurses ??
                                "—"}
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
                            <div className="text-gray-500">Technicians</div>
                            <div className="text-gray-900 font-semibold">
                              {aiForecast.structured.staff_needed
                                ?.technicians ?? "—"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Plan horizon</span>
                          <span className="font-semibold text-gray-900">
                            {formatMinutes(
                              aiForecast.structured.time_window_minutes
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                          Additional Resources
                        </h4>
                        <div className="space-y-2">
                          {aiForecast.structured.other_resources &&
                          aiForecast.structured.other_resources.length > 0 ? (
                            aiForecast.structured.other_resources.map(
                              (resource, index) => (
                                <div
                                  key={`resource-${index}`}
                                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2"
                                >
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {resource.item}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {resource.quantity} {resource.unit}
                                    </div>
                                  </div>
                                  <span
                                    className={`text-xs font-semibold px-2 py-1 rounded-full ${getPriorityBadgeClass(
                                      resource.priority
                                    )}`}
                                  >
                                    {(resource.priority || "")
                                      .toString()
                                      .toUpperCase() || "PRIORITY"}
                                  </span>
                                </div>
                              )
                            )
                          ) : (
                            <div className="text-xs text-gray-500">
                              No additional resource requests were specified.
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                          Operational Assumptions
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          {aiForecast.assumptions.length > 0 ? (
                            aiForecast.assumptions.map((assumption, index) => (
                              <li
                                key={`assumption-${index}`}
                                className="flex items-start space-x-2"
                              >
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                                <span className="flex-1">{assumption}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-xs text-gray-500">
                              No explicit assumptions were provided.
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* <details className="text-sm text-gray-500">
                  <summary className="cursor-pointer font-medium text-gray-600 hover:text-gray-900">
                    View raw AI response
                  </summary>
                  <pre className="mt-3 p-4 bg-gray-900 text-gray-100 rounded-xl overflow-x-auto text-xs whitespace-pre-wrap">{aiForecast.rawText}</pre>
                </details> */}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overall Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-emerald-600">
              <ArrowUp className="w-4 h-4" />
              <span className="text-sm font-medium">+5.2%</span>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">
            Overall Resource Optimization
          </h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">91%</p>
          <p className="text-gray-500 text-xs">
            Composite score based on oxygen supply, bed availability, staff
            allocation, and emergency preparedness
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-red-600">
              <ArrowDown className="w-4 h-4" />
              <span className="text-sm font-medium">-12%</span>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">
            Oxygen Supply
          </h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            29<span className="text-lg text-gray-500">%</span>
          </p>
          <div className="flex items-center space-x-2">
            <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
              CRITICAL RISK
            </div>
            <span className="text-gray-500 text-xs">Next 24h prediction</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Bed className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-emerald-600">
              <ArrowUp className="w-4 h-4" />
              <span className="text-sm font-medium">+3%</span>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">
            Bed Availability
          </h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            66<span className="text-lg text-gray-500"> beds</span>
          </p>
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
              LOW RISK
            </div>
            <span className="text-gray-500 text-xs">100% Optimization</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-emerald-600">
              <ArrowUp className="w-4 h-4" />
              <span className="text-sm font-medium">+8%</span>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">
            Staff Workload
          </h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            27<span className="text-lg text-gray-500">%</span>
          </p>
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
              LOW RISK
            </div>
            <span className="text-gray-500 text-xs">109% Optimization</span>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {insights?.criticalAlerts && insights.criticalAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-red-900">
              Critical Predictions
            </h3>
          </div>
          <div className="space-y-3">
            {insights.criticalAlerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-white bg-opacity-50 rounded-xl"
              >
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-red-800 font-medium">{alert}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Oxygen Supply Trend */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <LineChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Oxygen Supply Forecast
                </h3>
                <p className="text-sm text-gray-600">
                  24-hour prediction with trend analysis
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">29%</div>
              <div className="text-xs text-gray-500">Critical Level</div>
            </div>
          </div>
          <div className="h-64">
            <Line
              data={{
                labels: chartData.oxygenTrend.map((point) => point.time),
                datasets: [
                  {
                    label: "Actual Supply",
                    data: chartData.oxygenTrend.map((point) => point.value),
                    borderColor: "rgb(59, 130, 246)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    borderWidth: 3,
                    pointBackgroundColor: "rgb(59, 130, 246)",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    fill: true,
                    tension: 0.4,
                  },
                  {
                    label: "Predicted Supply",
                    data: chartData.oxygenTrend.map((point) => point.predicted),
                    borderColor: "rgb(245, 158, 11)",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    borderWidth: 3,
                    borderDash: [8, 4],
                    pointBackgroundColor: "rgb(245, 158, 11)",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    fill: false,
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom" as const,
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: {
                        size: 12,
                      },
                    },
                  },
                  tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                      label: function (context) {
                        return `${context.dataset.label}: ${context.parsed.y}%`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                      color: "#6b7280",
                      font: {
                        size: 11,
                      },
                    },
                  },
                  y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                      color: "#6b7280",
                      font: {
                        size: 11,
                      },
                      callback: function (value) {
                        return value + "%";
                      },
                    },
                  },
                },
                interaction: {
                  intersect: false,
                  mode: "index" as const,
                },
              }}
            />
          </div>
        </div>

        {/* Emergency Cases Forecast */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Emergency Cases
              </h3>
              <p className="text-sm text-gray-600">Next 6 hours forecast</p>
            </div>
          </div>
          <div className="h-64 mb-4">
            <Bar
              data={{
                labels: chartData.emergencyForecast.map(
                  (forecast) => forecast.hour
                ),
                datasets: [
                  {
                    label: "Current Cases",
                    data: chartData.emergencyForecast.map(
                      (forecast) => forecast.cases || 0
                    ),
                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                    borderColor: "rgb(59, 130, 246)",
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                  },
                  {
                    label: "Predicted Cases",
                    data: chartData.emergencyForecast.map(
                      (forecast) => forecast.predicted
                    ),
                    backgroundColor: chartData.emergencyForecast.map(
                      (forecast) =>
                        forecast.predicted <= 2
                          ? "rgba(34, 197, 94, 0.8)"
                          : forecast.predicted <= 4
                          ? "rgba(245, 158, 11, 0.8)"
                          : "rgba(239, 68, 68, 0.8)"
                    ),
                    borderColor: chartData.emergencyForecast.map((forecast) =>
                      forecast.predicted <= 2
                        ? "rgb(34, 197, 94)"
                        : forecast.predicted <= 4
                        ? "rgb(245, 158, 11)"
                        : "rgb(239, 68, 68)"
                    ),
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                    labels: {
                      usePointStyle: true,
                      padding: 15,
                      font: {
                        size: 11,
                      },
                    },
                  },
                  tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                      afterLabel: function (context) {
                        const forecast =
                          chartData.emergencyForecast[context.dataIndex];
                        if (context.datasetIndex === 1) {
                          const level =
                            forecast.predicted <= 2
                              ? "Low"
                              : forecast.predicted <= 4
                              ? "Medium"
                              : "High";
                          return `Risk Level: ${level}`;
                        }
                        return "";
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                      color: "#6b7280",
                      font: {
                        size: 11,
                      },
                    },
                  },
                  y: {
                    beginAtZero: true,
                    max: 6,
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                      color: "#6b7280",
                      font: {
                        size: 11,
                      },
                      stepSize: 1,
                      callback: function (value) {
                        return value + " cases";
                      },
                    },
                  },
                },
                interaction: {
                  intersect: false,
                  mode: "index" as const,
                },
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-green-600 font-medium">Low Risk</div>
              <div className="text-green-800">≤ 2 cases</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded-lg">
              <div className="text-yellow-600 font-medium">Medium Risk</div>
              <div className="text-yellow-800">3-4 cases</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <div className="text-red-600 font-medium">High Risk</div>
              <div className="text-red-800">≥ 5 cases</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bed Utilization and Staff Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Bed Utilization by Department */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Bed Utilization
              </h3>
              <p className="text-sm text-gray-600">
                Current occupancy by department
              </p>
            </div>
          </div>
          <div className="h-80">
            <Bar
              data={{
                labels: chartData.bedUtilization.map((dept) => dept.department),
                datasets: [
                  {
                    label: "Utilized Beds",
                    data: chartData.bedUtilization.map((dept) => dept.utilized),
                    backgroundColor: chartData.bedUtilization.map((dept) =>
                      dept.percentage >= 90
                        ? "rgba(239, 68, 68, 0.8)"
                        : dept.percentage >= 80
                        ? "rgba(245, 158, 11, 0.8)"
                        : "rgba(34, 197, 94, 0.8)"
                    ),
                    borderColor: chartData.bedUtilization.map((dept) =>
                      dept.percentage >= 90
                        ? "rgb(239, 68, 68)"
                        : dept.percentage >= 80
                        ? "rgb(245, 158, 11)"
                        : "rgb(34, 197, 94)"
                    ),
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                  },
                  {
                    label: "Available Beds",
                    data: chartData.bedUtilization.map(
                      (dept) => dept.total - dept.utilized
                    ),
                    backgroundColor: "rgba(229, 231, 235, 0.6)",
                    borderColor: "rgb(156, 163, 175)",
                    borderWidth: 1,
                    borderRadius: 8,
                    borderSkipped: false,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: {
                        size: 12,
                      },
                    },
                  },
                  tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                      afterLabel: function (context) {
                        const dept =
                          chartData.bedUtilization[context.dataIndex];
                        if (context.datasetIndex === 0) {
                          return `Utilization: ${dept.percentage}%`;
                        }
                        return `Total Capacity: ${dept.total} beds`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    stacked: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                      color: "#6b7280",
                      font: {
                        size: 11,
                      },
                    },
                  },
                  y: {
                    stacked: true,
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                      color: "#6b7280",
                      font: {
                        size: 11,
                      },
                      callback: function (value) {
                        return value + " beds";
                      },
                    },
                  },
                },
                interaction: {
                  intersect: false,
                  mode: "index" as const,
                },
              }}
            />
          </div>
        </div>

        {/* Staff Workload Distribution */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Staff Distribution
              </h3>
              <p className="text-sm text-gray-600">
                Consultants vs Workers by shift
              </p>
            </div>
          </div>
          <div className="h-80 mb-6">
            <Doughnut
              data={{
                labels: [
                  "Morning Consultants",
                  "Morning Workers",
                  "Afternoon Consultants",
                  "Afternoon Workers",
                  "Night Consultants",
                  "Night Workers",
                ],
                datasets: [
                  {
                    data: [
                      chartData.staffWorkload[0].consultants,
                      chartData.staffWorkload[0].workers,
                      chartData.staffWorkload[1].consultants,
                      chartData.staffWorkload[1].workers,
                      chartData.staffWorkload[2].consultants,
                      chartData.staffWorkload[2].workers,
                    ],
                    backgroundColor: [
                      "rgba(59, 130, 246, 0.8)",
                      "rgba(139, 92, 246, 0.8)",
                      "rgba(16, 185, 129, 0.8)",
                      "rgba(245, 158, 11, 0.8)",
                      "rgba(239, 68, 68, 0.8)",
                      "rgba(236, 72, 153, 0.8)",
                    ],
                    borderColor: [
                      "rgb(59, 130, 246)",
                      "rgb(139, 92, 246)",
                      "rgb(16, 185, 129)",
                      "rgb(245, 158, 11)",
                      "rgb(239, 68, 68)",
                      "rgb(236, 72, 153)",
                    ],
                    borderWidth: 2,
                    hoverOffset: 10,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "60%",
                plugins: {
                  legend: {
                    position: "bottom" as const,
                    labels: {
                      usePointStyle: true,
                      padding: 15,
                      font: {
                        size: 11,
                      },
                      generateLabels: function (chart) {
                        const data = chart.data;
                        return (
                          data.labels?.map((label, index) => ({
                            text: label as string,
                            fillStyle: Array.isArray(
                              data.datasets[0].backgroundColor
                            )
                              ? (data.datasets[0].backgroundColor[
                                  index
                                ] as string)
                              : (data.datasets[0].backgroundColor as string),
                            strokeStyle: Array.isArray(
                              data.datasets[0].borderColor
                            )
                              ? (data.datasets[0].borderColor[index] as string)
                              : (data.datasets[0].borderColor as string),
                            lineWidth: 2,
                            hidden: false,
                            index: index,
                            pointStyle: "circle",
                          })) || []
                        );
                      },
                    },
                  },
                  tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                      label: function (context) {
                        const total = context.dataset.data.reduce(
                          (a: number, b: number) => a + b,
                          0
                        );
                        const percentage = (
                          (context.parsed / total) *
                          100
                        ).toFixed(1);
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {chartData.staffWorkload.map((shift, index) => (
              <div
                key={index}
                className="text-center p-3 bg-gray-50 rounded-xl"
              >
                <div className="text-sm font-medium text-gray-600 mb-1">
                  {shift.shift}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {shift.consultants + shift.workers}
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                    shift.workload >= 90
                      ? "bg-red-100 text-red-800"
                      : shift.workload >= 80
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {shift.workload}% load
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* AI Recommendations */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg border border-indigo-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                AI Recommendations
              </h3>
              <p className="text-sm text-gray-600">
                Smart insights to optimize hospital operations
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white bg-opacity-60 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-red-100 rounded-lg mt-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Critical Oxygen Supply Alert
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Oxygen levels predicted to drop to 29% in the next 4 hours.
                    Immediate action required.
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      HIGH PRIORITY
                    </span>
                    <span className="text-xs text-gray-500">
                      Confidence: 94%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-60 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-amber-100 rounded-lg mt-1">
                  <Users className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Staff Reallocation Suggested
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Consider moving 2 consultants from General to Emergency
                    department for afternoon shift.
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                      MEDIUM PRIORITY
                    </span>
                    <span className="text-xs text-gray-500">
                      Efficiency gain: +15%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-60 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-green-100 rounded-lg mt-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Optimal Bed Management
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Current bed allocation is efficient. ICU at 93% utilization
                    - consider preparing overflow protocols.
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      MONITORING
                    </span>
                    <span className="text-xs text-gray-500">
                      System performance: Excellent
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Performance Insights
              </h3>
              <p className="text-sm text-gray-600">Key metrics overview</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg
                  className="w-32 h-32 transform -rotate-90"
                  viewBox="0 0 128 128"
                >
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${91 * 2.2} ${100 * 2.2}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">91%</div>
                    <div className="text-xs text-gray-500">Overall</div>
                  </div>
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                System Efficiency
              </h4>
              <p className="text-sm text-gray-600">
                Excellent performance across all metrics
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Prediction Accuracy
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  96.2%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-sm font-semibold text-gray-900">
                  0.8s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Freshness</span>
                <span className="text-sm font-semibold text-emerald-600">
                  Real-time
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Model Confidence</span>
                <span className="text-sm font-semibold text-gray-900">
                  94.7%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Navigation */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { id: "overview", name: "Overview", icon: Eye },
            { id: "oxygen", name: "Oxygen Supply", icon: Activity },
            { id: "beds", name: "Bed Availability", icon: Target },
            { id: "staff", name: "Staff Allocation", icon: Zap },
            { id: "emergency", name: "Emergency Demand", icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedResource(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedResource === tab.id
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource Predictions Overview */}
      {selectedResource === "overview" && insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { key: "oxygen", name: "Oxygen Supply", icon: Activity, unit: "%" },
            {
              key: "beds",
              name: "Bed Availability",
              icon: Target,
              unit: "beds",
            },
            { key: "staff", name: "Staff Workload", icon: Zap, unit: "%" },
            {
              key: "emergency",
              name: "Emergency Cases",
              icon: AlertTriangle,
              unit: "cases",
            },
          ].map((resource) => {
            const Icon = resource.icon;
            const prediction = insights[
              resource.key as keyof typeof insights
            ] as ResourcePrediction;

            return (
              <div
                key={resource.key}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {resource.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Next 24h prediction
                      </p>
                    </div>
                  </div>
                  {getTrendIcon(prediction.trend)}
                </div>

                <div className="flex items-baseline space-x-2 mb-3">
                  <span className="text-2xl font-bold text-gray-900">
                    {Math.round(prediction.currentValue)}
                  </span>
                  <span className="text-sm text-gray-500">{resource.unit}</span>
                </div>

                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium inline-block mb-3 ${getRiskColor(
                    prediction.riskLevel
                  )}`}
                >
                  {prediction.riskLevel.toUpperCase()} RISK
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Optimization</span>
                    <span
                      className={`font-medium ${getOptimizationColor(
                        prediction.optimizationScore
                      )}`}
                    >
                      {prediction.optimizationScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        prediction.optimizationScore >= 90
                          ? "bg-green-500"
                          : prediction.optimizationScore >= 75
                          ? "bg-yellow-500"
                          : prediction.optimizationScore >= 60
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${prediction.optimizationScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Resource View */}
      {selectedResource !== "overview" && insights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Predictions Chart */}
          <div className="lg:col-span-2">
            <PredictiveCharts
              resourceType={
                selectedResource as "oxygen" | "beds" | "staff" | "emergency"
              }
              prediction={
                insights[
                  selectedResource as keyof typeof insights
                ] as ResourcePrediction
              }
            />
          </div>

          {/* Recommendations */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>AI Recommendations</span>
            </h3>

            <div className="space-y-4">
              {(
                insights[
                  selectedResource as keyof typeof insights
                ] as ResourcePrediction
              ).recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`mt-1 ${
                      recommendation.includes("URGENT") ||
                      recommendation.includes("ALERT")
                        ? "text-red-600"
                        : recommendation.includes("Schedule") ||
                          recommendation.includes("Prepare")
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {recommendation.includes("URGENT") ||
                    recommendation.includes("ALERT") ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </div>
                  <p className="text-sm text-gray-800 flex-1">
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>

            {/* Risk Assessment */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Risk Level
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                    (
                      insights[
                        selectedResource as keyof typeof insights
                      ] as ResourcePrediction
                    ).riskLevel
                  )}`}
                >
                  {(
                    insights[
                      selectedResource as keyof typeof insights
                    ] as ResourcePrediction
                  ).riskLevel.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Optimization Score
                </span>
                <span
                  className={`text-lg font-bold ${getOptimizationColor(
                    (
                      insights[
                        selectedResource as keyof typeof insights
                      ] as ResourcePrediction
                    ).optimizationScore
                  )}`}
                >
                  {
                    (
                      insights[
                        selectedResource as keyof typeof insights
                      ] as ResourcePrediction
                    ).optimizationScore
                  }
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Timeline */}
      {selectedResource !== "overview" && insights && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            24-Hour Prediction Timeline
          </h3>
          <div className="overflow-x-auto">
            <div className="flex space-x-2 min-w-max">
              {(
                insights[
                  selectedResource as keyof typeof insights
                ] as ResourcePrediction
              ).predictions
                .slice(0, 24)
                .map((prediction, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center space-y-2 p-2 bg-gray-50 rounded"
                  >
                    <div className="text-xs text-gray-600 font-medium">
                      {formatTime(prediction.timestamp)}
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-900">
                        {Math.round(prediction.value)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(prediction.confidence * 100)}%
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveDashboard;
