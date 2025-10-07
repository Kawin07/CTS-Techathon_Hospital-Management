// Configuration for What-If Analysis AI Integration
// This file manages API keys and AI service settings

interface AIConfig {
  gemini: {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    safetyThreshold: string;
  };
  hospitalContext: {
    totalBeds: number;
    totalStaff: number;
    departments: string[];
    currentStatus: {
      oxygenLevel: number;
      availableBeds: number;
      staffWorkload: number;
      emergencyCases: number;
    };
  };
  features: {
    enableWhatIfAnalysis: boolean;
    enableScenarioLibrary: boolean;
    enableChatExport: boolean;
    enableRealTimeContext: boolean;
  };
}

export const aiConfig: AIConfig = {
  gemini: {
    apiKey: "AIzaSyCKNmPJGWZazDaCNF3iwhN4XeCXZIuTfcA", // Provided by user; in production, prefer environment variables
    model: "gemini-2.0-flash", // Fixed: use valid model name
    temperature: 0.7,
    maxTokens: 2048,
    safetyThreshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  hospitalContext: {
    totalBeds: 200,
    totalStaff: 120,
    departments: ["ICU", "Emergency", "General Ward", "Surgery", "Maternity"],
    currentStatus: {
      oxygenLevel: 29, // Current critical level
      availableBeds: 66,
      staffWorkload: 27,
      emergencyCases: 7,
    },
  },
  features: {
    enableWhatIfAnalysis: true,
    enableScenarioLibrary: true,
    enableChatExport: true,
    enableRealTimeContext: true,
  },
};

// Scenario templates for quick access
export const scenarioTemplates = [
  {
    category: "Resource Crisis",
    scenarios: [
      "Oxygen supply drops to {level}% during peak hours",
      "Main water supply system fails for {duration} hours",
      "Power outage affects {percentage}% of hospital systems",
      "Medical supply shortage lasts {duration} days",
    ],
  },
  {
    category: "Staffing Issues",
    scenarios: [
      "{percentage}% of nursing staff unavailable due to outbreak",
      "Key specialists are quarantined for {duration} days",
      "Emergency department is understaffed by {number} personnel",
      "ICU requires additional {number} trained nurses immediately",
    ],
  },
  {
    category: "Capacity Overload",
    scenarios: [
      "Emergency admissions increase by {percentage}% suddenly",
      "ICU reaches {percentage}% capacity with {number} pending cases",
      "Surgery schedule extends by {hours} hours due to emergencies",
      "Maternity ward receives {number} emergency deliveries",
    ],
  },
  {
    category: "Emergency Events",
    scenarios: [
      "Mass casualty event with {number} trauma patients",
      "Building evacuation requires relocating {number} patients",
      "Natural disaster impacts hospital operations for {duration}",
      "Infectious disease outbreak requires isolation protocols",
    ],
  },
];

// Response quality metrics
export const responseMetrics = {
  requiredSections: [
    "Impact Summary",
    "Risk Assessment",
    "Immediate Actions",
    "Short-term Strategy",
    "Long-term Adjustments",
    "Optimization Impact",
    "Prevention Recommendations",
  ],
  expectedTimeframes: ["0-15 minutes", "15 minutes - 4 hours", "4+ hours"],
  riskLevels: ["Low", "Medium", "High", "Critical"],
};

// Utility functions
export const formatScenario = (
  template: string,
  params: Record<string, any>
): string => {
  return template.replace(/\{(\w+)\}/g, (match, key) => params[key] || match);
};

export const validateResponse = (response: string): boolean => {
  const hasRequiredSections = responseMetrics.requiredSections.some((section) =>
    response.includes(section)
  );
  const hasTimeframes = responseMetrics.expectedTimeframes.some((timeframe) =>
    response.includes(timeframe)
  );
  return hasRequiredSections && hasTimeframes;
};

export default aiConfig;
