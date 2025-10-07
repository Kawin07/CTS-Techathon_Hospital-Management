// WORKING GEMINI SERVICE - SIMPLIFIED VERSION
// This is a clean, working implementation

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
    console.log("✅ GeminiService initialized successfully");
  }

  // Validate API key format
  isValidApiKey(apiKey: string): boolean {
    return /^AIza[0-9A-Za-z-_]{35}$/.test(apiKey);
  }

  // Test API key with simple request
  async testApiKey(): Promise<{ valid: boolean; error?: string }> {
    try {
      const result = await this.callGeminiAPI("Test", "Respond with 'Working'");
      return { valid: true };
    } catch (error: any) {
      return { valid: false, error: error.message || "Unknown error" };
    }
  }

  // Core Gemini API call method
  private async callGeminiAPI(
    prompt: string,
    systemPrompt: string
  ): Promise<string> {
    const requestBody = {
      contents: [
        { parts: [{ text: `${systemPrompt}\n\nUser Query: ${prompt}` }] },
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

    // Try header authentication first
    let response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    // Fallback to query parameter if header fails
    if (!response.ok) {
      console.log("Header auth failed, trying query param...");
      response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.error?.message || response.statusText;
      throw new Error(`HTTP ${response.status}: ${errorMsg}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No valid response received from Gemini API");
    }

    return text;
  }

  // Build hospital system prompt
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

  // Generate response with API fallback to mock
  async generateResponse(
    prompt: string,
    systemPrompt: string
  ): Promise<string> {
    try {
      console.log("🔄 Attempting Gemini API call...");
      const result = await this.callGeminiAPI(prompt, systemPrompt);
      console.log("✅ Gemini API call successful");
      return result;
    } catch (error: any) {
      console.warn("⚠️ Gemini API failed, using mock response:", error.message);
      return this.getMockResponse(prompt);
    }
  }

  // Mock response when API fails
  private getMockResponse(prompt: string): string {
    console.log("🎭 Generating mock response for demo purposes");

    const lowercasePrompt = prompt.toLowerCase();
    const hasEmergency =
      lowercasePrompt.includes("emergency") ||
      lowercasePrompt.includes("trauma");
    const patientMatch = prompt.match(/(\d+)\s+patients?/i);
    const patientCount = patientMatch ? parseInt(patientMatch[1]) : 10;

    const beds = Math.max(5, patientCount);
    const doctors = Math.max(2, Math.ceil(beds / 6));
    const nurses = doctors * 3;
    const techs = Math.ceil(doctors * 1.5);

    return `**🚨 IMMEDIATE ACTIONS (0-15 min)**
- Activate Emergency Response Protocol Level ${
      hasEmergency ? "2 (Mass Casualty)" : "1 (Standard Surge)"
    }
- Nursing Supervisor: Clear trauma bays and prep emergency supplies
- Contact on-call medical staff for immediate response
- Security: Set up ambulance routing and visitor restrictions

**⚡ SHORT-TERM STRATEGY (15 min - 4 hours)**
- Convert recovery areas to temporary patient overflow space
- Postpone non-urgent elective procedures for next 8 hours
- Coordinate with nearby facilities for potential transfers
- Activate emergency supply chain protocols

**📈 IMPACT & RECOVERY**
- Risk level: ${hasEmergency ? "8/10" : "6/10"}
- Cost estimate: $${hasEmergency ? "125,000" : "75,000"} - $150,000
- Timeline: 24-48 hours to return to normal operations

*🎭 This is a demonstration response. Live API integration would provide more specific guidance based on real-time data.*

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
    }, "unit": "kits", "priority": "critical" },
    { "item": "Ventilators", "quantity": ${
      hasEmergency ? 8 : 3
    }, "unit": "machines", "priority": "critical" }
  ],
  "assumptions": [
    "Staff recall successful at 80% rate",
    "Regional hospitals available for transfers if needed",
    "Emergency supply vendors responsive within 4 hours"
  ],
  "time_window_minutes": 240
}`;
  }

  // Required interface methods
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
      const testResult = await this.testApiKey();
      return testResult.valid;
    } catch {
      return false;
    }
  }
}

export default GeminiService;
