// Predictive Analytics Engine for Hospital Resource Optimization
// This module provides core algorithms for predicting hospital resource needs

export interface PredictionData {
  timestamp: number;
  value: number;
  confidence: number;
}

export interface ResourcePrediction {
  resourceType: "oxygen" | "beds" | "staff" | "emergency";
  currentValue: number;
  predictions: PredictionData[];
  trend: "increasing" | "decreasing" | "stable";
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendations: string[];
  optimizationScore: number; // 0-100
  regressionForecasts?: Record<number, PredictionData>;
  regressionSlope?: number;
}

export interface HistoricalData {
  timestamp: number;
  oxygenDemand: number;
  bedOccupancy: number;
  staffWorkload: number;
  emergencyCases: number;
  dayOfWeek: number;
  hour: number;
  seasonality: number;
}

// Simulated Machine Learning Models
class PredictiveModel {
  private weights: number[];
  private features: string[];

  constructor(features: string[], weights: number[]) {
    this.features = features;
    this.weights = weights;
  }

  predict(data: any): number {
    let prediction = 0;
    this.features.forEach((feature, index) => {
      prediction += (data[feature] || 0) * this.weights[index];
    });
    return Math.max(0, Math.min(100, prediction));
  }

  getConfidence(data: any): number {
    // Simulate confidence based on data quality and model certainty
    const dataQuality = Object.keys(data).length / this.features.length;
    const baseConfidence = 0.7 + Math.random() * 0.25;
    return Math.min(0.95, baseConfidence * dataQuality);
  }
}

// Pre-trained models for different resources
const oxygenModel = new PredictiveModel(
  ["currentDemand", "timeOfDay", "dayOfWeek", "emergencyCases", "seasonality"],
  [0.4, 0.2, 0.15, 0.3, 0.1]
);

const bedModel = new PredictiveModel(
  [
    "currentOccupancy",
    "timeOfDay",
    "dayOfWeek",
    "admissionRate",
    "dischargeRate",
  ],
  [0.5, 0.15, 0.1, 0.3, -0.2]
);

const staffModel = new PredictiveModel(
  [
    "currentWorkload",
    "timeOfDay",
    "patientCount",
    "emergencyCases",
    "seasonality",
  ],
  [0.4, 0.25, 0.2, 0.25, 0.05]
);

// Generate historical data for training/simulation
export function generateHistoricalData(days: number = 30): HistoricalData[] {
  const data: HistoricalData[] = [];
  const now = Date.now();

  for (let i = days * 24; i >= 0; i--) {
    const timestamp = now - i * 60 * 60 * 1000; // Hours ago
    const date = new Date(timestamp);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    // Simulate realistic hospital patterns
    const seasonality = Math.sin((dayOfWeek / 7) * Math.PI * 2) * 0.2 + 0.8;
    const timeMultiplier =
      hour < 6 ? 0.6 : hour < 12 ? 1.0 : hour < 18 ? 0.8 : 0.7;

    const baseOxygenDemand = 70 + Math.sin((hour / 24) * Math.PI * 2) * 15;
    const baseBedOccupancy =
      65 + Math.sin(((dayOfWeek + hour / 24) / 7) * Math.PI * 2) * 20;
    const baseStaffWorkload = 50 + Math.sin((hour / 12) * Math.PI) * 25;
    const baseEmergencies = Math.max(
      0,
      3 + Math.sin((hour / 24) * Math.PI * 2) * 2
    );

    data.push({
      timestamp,
      oxygenDemand: Math.max(
        0,
        Math.min(
          100,
          baseOxygenDemand * seasonality * timeMultiplier +
            (Math.random() - 0.5) * 10
        )
      ),
      bedOccupancy: Math.max(
        0,
        Math.min(
          100,
          baseBedOccupancy * seasonality + (Math.random() - 0.5) * 15
        )
      ),
      staffWorkload: Math.max(
        0,
        Math.min(
          100,
          baseStaffWorkload * timeMultiplier + (Math.random() - 0.5) * 20
        )
      ),
      emergencyCases: Math.max(
        0,
        Math.floor(baseEmergencies + (Math.random() - 0.5) * 3)
      ),
      dayOfWeek,
      hour,
      seasonality,
    });
  }

  return data;
}

// Advanced prediction algorithms
export class PredictiveAnalytics {
  private historicalData: HistoricalData[];

  constructor() {
    this.historicalData = generateHistoricalData(30);
  }

  // Predict oxygen demand for next 24 hours
  predictOxygenDemand(): ResourcePrediction {
    const now = new Date();
    const currentHour = now.getHours();
    const predictions: PredictionData[] = [];

    // Get current oxygen demand from recent data
    const recentData = this.historicalData.slice(-6); // Last 6 hours
    const regressionData = this.historicalData.slice(-48); // Last 48 hours for regression stability
    const currentValue = recentData[recentData.length - 1]?.oxygenDemand || 75;

    // Predict next 24 hours
    for (let i = 1; i <= 24; i++) {
      const futureHour = (currentHour + i) % 24;
      const dayOffset = Math.floor((currentHour + i) / 24);
      const dayOfWeek = (now.getDay() + dayOffset) % 7;

      const predictionInput = {
        currentDemand: currentValue,
        timeOfDay: futureHour / 24,
        dayOfWeek: dayOfWeek / 7,
        emergencyCases: this.getAverageEmergencyCases(),
        seasonality: Math.sin((dayOfWeek / 7) * Math.PI * 2) * 0.2 + 0.8,
      };

      const predictedValue = oxygenModel.predict(predictionInput);
      const confidence = oxygenModel.getConfidence(predictionInput);

      predictions.push({
        timestamp: now.getTime() + i * 60 * 60 * 1000,
        value: predictedValue,
        confidence,
      });
    }

    const trend = this.calculateTrend(predictions.slice(0, 12));
    const riskLevel = this.assessOxygenRisk(predictions);
    const recommendations = this.generateOxygenRecommendations(
      currentValue,
      predictions,
      riskLevel
    );
    const optimizationScore = this.calculateOptimizationScore(
      "oxygen",
      currentValue,
      predictions
    );
    const { forecasts: regressionForecasts, slope: regressionSlope } =
      this.calculateLinearRegressionForecasts(regressionData, [1, 6, 24]);

    return {
      resourceType: "oxygen",
      currentValue,
      predictions,
      trend,
      riskLevel,
      recommendations,
      optimizationScore,
      regressionForecasts,
      regressionSlope,
    };
  }

  // Predict bed availability for next 48 hours
  predictBedAvailability(): ResourcePrediction {
    const now = new Date();
    const predictions: PredictionData[] = [];

    const recentData = this.historicalData.slice(-12);
    const currentValue =
      100 - (recentData[recentData.length - 1]?.bedOccupancy || 70);

    for (let i = 1; i <= 48; i++) {
      const futureHour = (now.getHours() + i) % 24;
      const dayOffset = Math.floor((now.getHours() + i) / 24);
      const dayOfWeek = (now.getDay() + dayOffset) % 7;

      const predictionInput = {
        currentOccupancy: 100 - currentValue,
        timeOfDay: futureHour / 24,
        dayOfWeek: dayOfWeek / 7,
        admissionRate: this.getAverageAdmissionRate(futureHour),
        dischargeRate: this.getAverageDischargeRate(futureHour),
      };

      const occupancyPrediction = bedModel.predict(predictionInput);
      const availabilityPrediction = 100 - occupancyPrediction;
      const confidence = bedModel.getConfidence(predictionInput);

      predictions.push({
        timestamp: now.getTime() + i * 60 * 60 * 1000,
        value: Math.max(0, availabilityPrediction),
        confidence,
      });
    }

    const trend = this.calculateTrend(predictions.slice(0, 24));
    const riskLevel = this.assessBedRisk(predictions);
    const recommendations = this.generateBedRecommendations(
      currentValue,
      predictions,
      riskLevel
    );
    const optimizationScore = this.calculateOptimizationScore(
      "beds",
      currentValue,
      predictions
    );

    return {
      resourceType: "beds",
      currentValue,
      predictions,
      trend,
      riskLevel,
      recommendations,
      optimizationScore,
    };
  }

  // Predict staff workload for next 24 hours
  predictStaffWorkload(): ResourcePrediction {
    const now = new Date();
    const predictions: PredictionData[] = [];

    const recentData = this.historicalData.slice(-8);
    const currentValue = recentData[recentData.length - 1]?.staffWorkload || 65;

    for (let i = 1; i <= 24; i++) {
      const futureHour = (now.getHours() + i) % 24;
      const dayOffset = Math.floor((now.getHours() + i) / 24);

      const predictionInput = {
        currentWorkload: currentValue,
        timeOfDay: futureHour / 24,
        patientCount: this.getExpectedPatientCount(futureHour),
        emergencyCases: this.getExpectedEmergencyCases(futureHour),
        seasonality:
          Math.sin(((now.getDay() + dayOffset) / 7) * Math.PI * 2) * 0.2 + 0.8,
      };

      const predictedValue = staffModel.predict(predictionInput);
      const confidence = staffModel.getConfidence(predictionInput);

      predictions.push({
        timestamp: now.getTime() + i * 60 * 60 * 1000,
        value: predictedValue,
        confidence,
      });
    }

    const trend = this.calculateTrend(predictions.slice(0, 12));
    const riskLevel = this.assessStaffRisk(predictions);
    const recommendations = this.generateStaffRecommendations(
      currentValue,
      predictions,
      riskLevel
    );
    const optimizationScore = this.calculateOptimizationScore(
      "staff",
      currentValue,
      predictions
    );

    return {
      resourceType: "staff",
      currentValue,
      predictions,
      trend,
      riskLevel,
      recommendations,
      optimizationScore,
    };
  }

  // Predict emergency cases likelihood
  predictEmergencyDemand(): ResourcePrediction {
    const now = new Date();
    const predictions: PredictionData[] = [];

    const recentData = this.historicalData.slice(-6);
    const currentValue = recentData[recentData.length - 1]?.emergencyCases || 3;

    for (let i = 1; i <= 24; i++) {
      const futureHour = (now.getHours() + i) % 24;

      // Emergency cases tend to peak during evening and late night hours
      const hourlyMultiplier =
        futureHour < 6
          ? 1.2
          : futureHour < 12
          ? 0.7
          : futureHour < 18
          ? 0.9
          : 1.3;
      const baseEmergencies = 2 + Math.sin((futureHour / 12) * Math.PI) * 2;
      const predicted = Math.max(
        0,
        baseEmergencies * hourlyMultiplier + (Math.random() - 0.5) * 2
      );

      predictions.push({
        timestamp: now.getTime() + i * 60 * 60 * 1000,
        value: predicted,
        confidence: 0.75 + Math.random() * 0.2,
      });
    }

    const trend = this.calculateTrend(predictions.slice(0, 12));
    const riskLevel = this.assessEmergencyRisk(predictions);
    const recommendations = this.generateEmergencyRecommendations(
      currentValue,
      predictions,
      riskLevel
    );
    const optimizationScore = this.calculateOptimizationScore(
      "emergency",
      currentValue,
      predictions
    );

    return {
      resourceType: "emergency",
      currentValue,
      predictions,
      trend,
      riskLevel,
      recommendations,
      optimizationScore,
    };
  }

  // Helper methods for calculations
  private calculateTrend(
    predictions: PredictionData[]
  ): "increasing" | "decreasing" | "stable" {
    if (predictions.length < 2) return "stable";

    const first = predictions[0].value;
    const last = predictions[predictions.length - 1].value;
    const change = (last - first) / first;

    if (change > 0.05) return "increasing";
    if (change < -0.05) return "decreasing";
    return "stable";
  }

  private assessOxygenRisk(
    predictions: PredictionData[]
  ): "low" | "medium" | "high" | "critical" {
    const minPrediction = Math.min(...predictions.map((p) => p.value));
    const avgPrediction =
      predictions.reduce((sum, p) => sum + p.value, 0) / predictions.length;

    if (minPrediction < 60 || avgPrediction < 70) return "critical";
    if (minPrediction < 70 || avgPrediction < 75) return "high";
    if (minPrediction < 80 || avgPrediction < 85) return "medium";
    return "low";
  }

  private assessBedRisk(
    predictions: PredictionData[]
  ): "low" | "medium" | "high" | "critical" {
    const minAvailability = Math.min(...predictions.map((p) => p.value));
    const avgAvailability =
      predictions.reduce((sum, p) => sum + p.value, 0) / predictions.length;

    if (minAvailability < 5 || avgAvailability < 10) return "critical";
    if (minAvailability < 10 || avgAvailability < 15) return "high";
    if (minAvailability < 20 || avgAvailability < 25) return "medium";
    return "low";
  }

  private assessStaffRisk(
    predictions: PredictionData[]
  ): "low" | "medium" | "high" | "critical" {
    const maxWorkload = Math.max(...predictions.map((p) => p.value));
    const avgWorkload =
      predictions.reduce((sum, p) => sum + p.value, 0) / predictions.length;

    if (maxWorkload > 90 || avgWorkload > 85) return "critical";
    if (maxWorkload > 85 || avgWorkload > 80) return "high";
    if (maxWorkload > 75 || avgWorkload > 70) return "medium";
    return "low";
  }

  private assessEmergencyRisk(
    predictions: PredictionData[]
  ): "low" | "medium" | "high" | "critical" {
    const maxEmergencies = Math.max(...predictions.map((p) => p.value));
    const avgEmergencies =
      predictions.reduce((sum, p) => sum + p.value, 0) / predictions.length;

    if (maxEmergencies > 8 || avgEmergencies > 6) return "critical";
    if (maxEmergencies > 6 || avgEmergencies > 4.5) return "high";
    if (maxEmergencies > 4 || avgEmergencies > 3) return "medium";
    return "low";
  }

  private generateOxygenRecommendations(
    _current: number,
    _predictions: PredictionData[],
    risk: string
  ): string[] {
    const recommendations: string[] = [];

    if (risk === "critical") {
      recommendations.push(
        "URGENT: Increase oxygen supply capacity immediately"
      );
      recommendations.push("Activate emergency oxygen reserves");
      recommendations.push("Contact oxygen supplier for priority delivery");
    } else if (risk === "high") {
      recommendations.push("Schedule maintenance check on oxygen systems");
      recommendations.push("Increase monitoring frequency to every 30 minutes");
      recommendations.push("Prepare backup oxygen concentrators");
    } else if (risk === "medium") {
      recommendations.push("Monitor oxygen levels closely during peak hours");
      recommendations.push("Schedule routine oxygen system inspection");
    } else {
      recommendations.push("Continue regular monitoring schedule");
      recommendations.push("Oxygen levels are stable and within normal range");
    }

    return recommendations;
  }

  private generateBedRecommendations(
    _current: number,
    _predictions: PredictionData[],
    risk: string
  ): string[] {
    const recommendations: string[] = [];

    if (risk === "critical") {
      recommendations.push("URGENT: Implement bed shortage protocol");
      recommendations.push("Consider early discharge for stable patients");
      recommendations.push("Coordinate with nearby hospitals for transfers");
      recommendations.push("Activate overflow capacity areas");
    } else if (risk === "high") {
      recommendations.push("Review discharge schedules for optimization");
      recommendations.push("Prepare additional bed spaces if available");
      recommendations.push(
        "Increase communication with discharge planning team"
      );
    } else if (risk === "medium") {
      recommendations.push("Monitor admission rates closely");
      recommendations.push("Optimize bed turnover procedures");
    } else {
      recommendations.push("Bed availability is adequate");
      recommendations.push("Continue standard admission procedures");
    }

    return recommendations;
  }

  private generateStaffRecommendations(
    _current: number,
    _predictions: PredictionData[],
    risk: string
  ): string[] {
    const recommendations: string[] = [];

    if (risk === "critical") {
      recommendations.push("URGENT: Call in additional staff immediately");
      recommendations.push("Activate on-call staff roster");
      recommendations.push("Consider temporary agency staff");
      recommendations.push("Redistribute non-critical tasks");
    } else if (risk === "high") {
      recommendations.push(
        "Schedule additional staff for predicted peak hours"
      );
      recommendations.push("Review and optimize staff assignments");
      recommendations.push("Prepare on-call staff for potential activation");
    } else if (risk === "medium") {
      recommendations.push("Monitor staff workload during peak periods");
      recommendations.push("Ensure adequate break coverage");
    } else {
      recommendations.push("Staff levels are adequate for current demand");
      recommendations.push("Continue regular staffing schedule");
    }

    return recommendations;
  }

  private generateEmergencyRecommendations(
    _current: number,
    _predictions: PredictionData[],
    risk: string
  ): string[] {
    const recommendations: string[] = [];

    if (risk === "critical") {
      recommendations.push("ALERT: High emergency volume expected");
      recommendations.push("Ensure full emergency staff coverage");
      recommendations.push("Prepare additional emergency equipment");
      recommendations.push("Coordinate with EMS services");
    } else if (risk === "high") {
      recommendations.push("Increase emergency department staffing");
      recommendations.push("Ensure trauma team availability");
      recommendations.push("Review emergency supply levels");
    } else if (risk === "medium") {
      recommendations.push("Standard emergency preparedness protocols");
      recommendations.push("Monitor emergency department capacity");
    } else {
      recommendations.push("Emergency volume within normal range");
      recommendations.push("Continue standard emergency operations");
    }

    return recommendations;
  }

  private calculateOptimizationScore(
    resourceType: string,
    _current: number,
    predictions: PredictionData[]
  ): number {
    const avgPrediction =
      predictions.reduce((sum, p) => sum + p.value, 0) / predictions.length;
    const variance =
      predictions.reduce(
        (sum, p) => sum + Math.pow(p.value - avgPrediction, 2),
        0
      ) / predictions.length;
    const stability = Math.max(0, 100 - variance);

    let adequacy = 50;
    if (resourceType === "oxygen") {
      adequacy = Math.min(100, (avgPrediction / 85) * 100);
    } else if (resourceType === "beds") {
      adequacy = Math.min(100, (avgPrediction / 30) * 100);
    } else if (resourceType === "staff") {
      adequacy = Math.max(0, 100 - (avgPrediction - 50) * 2);
    } else if (resourceType === "emergency") {
      adequacy = Math.max(0, 100 - (avgPrediction - 3) * 10);
    }

    return Math.round(stability * 0.4 + adequacy * 0.6);
  }

  // Helper methods for realistic data generation
  private getAverageEmergencyCases(): number {
    const recentData = this.historicalData.slice(-24);
    return (
      recentData.reduce((sum, d) => sum + d.emergencyCases, 0) /
      recentData.length
    );
  }

  private getAverageAdmissionRate(hour: number): number {
    // Admission rates typically higher during morning hours
    return hour < 12 ? 0.8 : hour < 18 ? 0.5 : 0.3;
  }

  private getAverageDischargeRate(hour: number): number {
    // Discharge rates typically higher during afternoon hours
    return hour < 6 ? 0.1 : hour < 12 ? 0.9 : hour < 18 ? 0.7 : 0.2;
  }

  private getExpectedPatientCount(hour: number): number {
    // Patient count varies by time of day
    const baseCount = 150;
    const timeMultiplier =
      hour < 6 ? 0.9 : hour < 12 ? 1.0 : hour < 18 ? 1.1 : 0.95;
    return baseCount * timeMultiplier;
  }

  private getExpectedEmergencyCases(hour: number): number {
    // Emergency cases peak in evening and late night
    const baseEmergencies = 3;
    const hourlyMultiplier =
      hour < 6 ? 1.2 : hour < 12 ? 0.7 : hour < 18 ? 0.9 : 1.3;
    return baseEmergencies * hourlyMultiplier;
  }

  // Method to update historical data (for real-time updates)
  updateHistoricalData(newData: HistoricalData): void {
    this.historicalData.push(newData);
    // Keep only last 30 days of data
    if (this.historicalData.length > 30 * 24) {
      this.historicalData = this.historicalData.slice(-30 * 24);
    }
  }

  // Get comprehensive resource optimization insights
  getAllPredictions(): {
    oxygen: ResourcePrediction;
    beds: ResourcePrediction;
    staff: ResourcePrediction;
    emergency: ResourcePrediction;
    overallOptimization: number;
    criticalAlerts: string[];
  } {
    const oxygen = this.predictOxygenDemand();
    const beds = this.predictBedAvailability();
    const staff = this.predictStaffWorkload();
    const emergency = this.predictEmergencyDemand();

    const overallOptimization = Math.round(
      (oxygen.optimizationScore +
        beds.optimizationScore +
        staff.optimizationScore +
        emergency.optimizationScore) /
        4
    );

    const criticalAlerts: string[] = [];
    if (oxygen.riskLevel === "critical")
      criticalAlerts.push("Critical oxygen supply shortage predicted");
    if (beds.riskLevel === "critical")
      criticalAlerts.push("Critical bed shortage expected");
    if (staff.riskLevel === "critical")
      criticalAlerts.push("Critical staff overload predicted");
    if (emergency.riskLevel === "critical")
      criticalAlerts.push("High emergency volume expected");

    return {
      oxygen,
      beds,
      staff,
      emergency,
      overallOptimization,
      criticalAlerts,
    };
  }

  private calculateLinearRegressionForecasts(
    data: HistoricalData[],
    horizons: number[]
  ): { forecasts: Record<number, PredictionData>; slope: number } {
    const values = data.map((entry) => entry.oxygenDemand);
    const n = values.length;
    const now = Date.now();

    if (n < 2) {
      const lastValue = values[values.length - 1] || 75;
      const fallbackForecasts: Record<number, PredictionData> = {};
      horizons.forEach((hours) => {
        const fallbackConfidence = Math.min(
          0.9,
          Math.max(0.65, 0.85 - hours * 0.015)
        );
        fallbackForecasts[hours] = {
          timestamp: now + hours * 60 * 60 * 1000,
          value: lastValue,
          confidence: fallbackConfidence,
        };
      });

      return { forecasts: fallbackForecasts, slope: 0 };
    }

    // Prepare sums for linear regression (x is hour index)
    const sumX = ((n - 1) * n) / 2;
    const sumX2 = ((n - 1) * n * (2 * n - 1)) / 6;
    const sumY = values.reduce((acc, value) => acc + value, 0);
    const sumXY = values.reduce((acc, value, index) => acc + index * value, 0);

    const denominator = n * sumX2 - sumX * sumX || 1;
    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // Calculate RMSE for confidence estimation
    const mse =
      values.reduce((acc, value, index) => {
        const predicted = intercept + slope * index;
        return acc + Math.pow(value - predicted, 2);
      }, 0) / n;

    const rmse = Math.sqrt(Math.max(mse, 0));
    const normalizedRmse = Math.min(rmse / 20, 1); // Lower RMSE -> lower ratio
    const baseConfidence = 0.85 + 0.1 * (1 - normalizedRmse);
    const slopePenalty = Math.min(Math.abs(slope) / 50, 0.08);
    const baselineConfidence = Math.min(
      0.98,
      Math.max(0.7, baseConfidence - slopePenalty)
    );

    const forecasts: Record<number, PredictionData> = {};
    const lastIndex = n - 1;

    const confidenceForHours = (hours: number) => {
      const horizonPenalty = Math.min(hours * 0.012, 0.15);
      const shortTermBoost = hours <= 2 ? 0.02 : 0;
      return Math.min(
        0.98,
        Math.max(0.65, baselineConfidence - horizonPenalty + shortTermBoost)
      );
    };

    horizons.forEach((hours) => {
      const futureIndex = lastIndex + hours;
      const projectedValue = Math.max(
        0,
        Math.min(100, intercept + slope * futureIndex)
      );
      forecasts[hours] = {
        timestamp: now + hours * 60 * 60 * 1000,
        value: projectedValue,
        confidence: confidenceForHours(hours),
      };
    });

    return { forecasts, slope };
  }
}

// Singleton instance for use across the application
export const predictiveAnalytics = new PredictiveAnalytics();
