// Simplified Gemini API Service for What-If Analysis
// Uses direct fetch calls for maximum compatibility

export interface LiveHospitalStatus {
  totalBeds?: number;
  availableBeds?: number;
  occupiedBeds?: number;
  oxygenLevelPercent?: number;
  staffOnDuty?: number;
  totalStaff?: number;
  staffLoadPercent?: number;
  emergencyCases?: number;
  criticalOxygenStations?: number;
  // Optional: extended planning context
  averagePatientStay?: number;
  seasonalTrends?: string;
  recentDischarges?: number;
  pendingAdmissions?: number;
}

class GeminiService {
  private apiKey: string;
  private baseUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    console.log("Gemini service initialized");
  }

  // Validate API key format
  isValidApiKey(apiKey: string): boolean {
    return /^AIza[0-9A-Za-z-_]{35}$/.test(apiKey);
  }

  // Test API key with a simple request
  async testApiKey(): Promise<{ valid: boolean; error?: string }> {
    try {
      const result = await this.callGeminiAPI("Test", "Respond with 'Working'");
      return { valid: true };
    } catch (error: any) {
      return { valid: false, error: error.message || "Unknown error" };
    }
  }

  // Core method to call Gemini API
  private async callGeminiAPI(
    prompt: string,
    systemPrompt: string
  ): Promise<string> {
    const requestBody = {
      contents: [
        {
          parts: [{ text: `${systemPrompt}\n\nUser Query: ${prompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    // Try header auth first
    let response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    // Fallback to query param if header fails
    if (!response.ok) {
      response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP ${response.status}: ${
          errorData?.error?.message || response.statusText
        }`
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No valid response received");
    return text;
  }

  // Build system prompt with hospital context
  getHospitalSystemPrompt(live?: LiveHospitalStatus): string {
    const totalBeds = live?.totalBeds ?? 200;
    const availableBeds = live?.availableBeds ?? 66;
    const occupiedBeds =
      live?.occupiedBeds ?? Math.max(totalBeds - availableBeds, 0);
    const oxygenLevel = live?.oxygenLevelPercent ?? 29;
    const totalStaff = live?.totalStaff ?? 120;
    const staffOnDuty = live?.staffOnDuty ?? Math.round(totalStaff * 0.27);
    const staffLoad = live?.staffLoadPercent ?? 27;
    const emergencies = live?.emergencyCases ?? 7;
    const criticalStations =
      live?.criticalOxygenStations !== undefined
        ? String(live.criticalOxygenStations)
        : "n/a";

    return `You are a Hospital Operations AI Assistant for a ${totalBeds}-bed facility.

HOSPITAL CONTEXT (Live Metrics):
- Beds: total ${totalBeds}, occupied ${occupiedBeds}, available ${availableBeds}
- Oxygen: ${oxygenLevel}%
- Staff: total ${totalStaff}, on duty ~${staffOnDuty} (${staffLoad}%)
- Emergency cases: ${emergencies}

RESPONSE FORMAT:

**🚨 IMMEDIATE ACTIONS (0-15 min)**
- Specific actions with roles

**⚡ SHORT-TERM STRATEGY (15 min - 4 hours)**
- Key adjustments

**📈 IMPACT & RECOVERY**
- Risk level (1-10)
- Cost estimate
- Timeline

STRICT JSON OUTPUT:
End with 'JSON:' followed by:
{
  "beds_needed": number,
  "oxygen_needed_liters": number,
  "staff_needed": {
    "doctors": number,
    "nurses": number,
    "technicians": number,
    "total": number
  },
  "other_resources": [
    { "item": string, "quantity": number, "unit": string, "priority": "low" | "medium" | "high" | "critical" }
  ],
  "assumptions": string[],
  "time_window_minutes": number
}`;
  }

  // Generate response with fallbacks
  async generateResponse(
    prompt: string,
    systemPrompt: string
  ): Promise<string> {
    try {
      return await this.callGeminiAPI(prompt, systemPrompt);
    } catch (error: any) {
      console.error("Gemini API failed:", error);

      // Return mock response for demo purposes
      return this.getMockResponse(prompt);
    }
  }

  // Mock response for when API fails
  private getMockResponse(prompt: string): string {
    const lowercasePrompt = prompt.toLowerCase();
    const hasEmergency =
      lowercasePrompt.includes("emergency") ||
      lowercasePrompt.includes("trauma");
    const patientCount = prompt.match(/(\d+)\s+patients?/i)?.[1] || "10";

    const beds = Number(patientCount) || 15;
    const doctors = Math.max(3, Math.ceil(beds / 5));
    const nurses = doctors * 3;
    const techs = Math.ceil(doctors * 1.5);

    return `**🚨 IMMEDIATE ACTIONS (0-15 min)**
- Activate Emergency Response Protocol Level ${hasEmergency ? "2" : "1"}
- Clear trauma bays and prepare emergency supplies
- Contact on-call staff for immediate response

**⚡ SHORT-TERM STRATEGY (15 min - 4 hours)**
- Convert recovery areas to temporary patient overflow
- Reschedule non-urgent procedures
- Coordinate with nearby facilities for transfers if needed

**📈 IMPACT & RECOVERY**
- Risk level: ${hasEmergency ? "8/10" : "6/10"}
- Cost estimate: $75,000 - $125,000
- Timeline: 24-48 hours to normal operations

*This is a demonstration response. Live API integration would provide more specific guidance.*

JSON:
{
  "beds_needed": ${beds},
  "oxygen_needed_liters": ${hasEmergency ? 1500 : 800},
  "staff_needed": {
    "doctors": ${doctors},
    "nurses": ${nurses},
    "technicians": ${techs},
    "total": ${doctors + nurses + techs}
  },
  "other_resources": [
    { "item": "IV fluid bags", "quantity": ${
      hasEmergency ? 100 : 50
    }, "unit": "units", "priority": "high" },
    { "item": "Trauma kits", "quantity": ${
      hasEmergency ? 20 : 10
    }, "unit": "kits", "priority": "critical" }
  ],
  "assumptions": [
    "Staff recall successful at 80% rate",
    "Regional hospitals available for transfers"
  ],
  "time_window_minutes": 240
}`;
  }

  // Other required methods
  getHospitalInsightsPrompt(live?: LiveHospitalStatus): string {
    return this.getHospitalSystemPrompt(live);
  }

  async generateInsights(
    query: string,
    liveData?: LiveHospitalStatus
  ): Promise<string> {
    return this.generateResponse(
      query,
      this.getHospitalInsightsPrompt(liveData)
    );
  }

  async getAvailableModels(): Promise<string[]> {
    return ["gemini-1.5-flash", "gemini-1.5-pro"];
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.testApiKey();
      return true;
    } catch {
      return false;
    }
  }
}

export default GeminiService;
