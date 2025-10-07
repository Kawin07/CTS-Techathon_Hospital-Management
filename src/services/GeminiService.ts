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
      await this.callGeminiAPI("Test", "Respond with 'Working'");
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

    const q = prompt.toLowerCase();

    // Helper to build a standard sectioned response
    const build = (
      actions: string[],
      shortTerm: string[],
      impact: { risk: string; cost: string; timeline: string },
      json: any
    ) => {
      const actionsMd = actions.map((a) => `- ${a}`).join("\n");
      const shortMd = shortTerm.map((a) => `- ${a}`).join("\n");
      return `**🚨 IMMEDIATE ACTIONS (0-15 min)**\n${actionsMd}\n\n**⚡ SHORT-TERM STRATEGY (15 min - 4 hours)**\n${shortMd}\n\n**📈 IMPACT & RECOVERY**\n- Risk level: ${
        impact.risk
      }\n- Cost estimate: ₹${impact.cost}\n- Timeline: ${
        impact.timeline
      }\n\nJSON:\n${JSON.stringify(json, null, 2)}`;
    };

    // Try to infer numbers from the prompt
    const num = (re: RegExp, def: number) => {
      const m = prompt.match(re);
      return m ? Math.max(def, parseInt(m[1])) : def;
    };

    // Baseline assumptions for an Indian tertiary hospital
    const assumeBeds = num(/(\d+)\s*(beds|patients)/i, 20);
    const assumeCrit = Math.round(assumeBeds * 0.25);

    // Oxygen Supply Crisis
    if (
      q.includes("oxygen") &&
      (q.includes("shortage") ||
        q.includes("drop") ||
        q.includes("crisis") ||
        q.includes("30%"))
    ) {
      const bedsNeeded = Math.max(assumeBeds, 25);
      const oxygenLiters = bedsNeeded * 50; // immediate stabilization window
      const doctors = Math.ceil(bedsNeeded / 10);
      const nurses = Math.ceil(bedsNeeded / 4);
      const techs = Math.ceil(bedsNeeded / 8);

      return build(
        [
          "Activate O2 conservation protocol; shift stable cases to nasal cannula at lowest effective flow",
          "Move non-ventilated patients to wards with centralized manifold; reserve ICU lines for critical",
          "Divert elective OTs; keep only emergency surgeries with anesthesia O2 audit",
          "Call rate-contract vendor for 40 jumbo cylinders (47L @ 150 bar) within 2 hours; alert PSA technician if onsite",
          "Biomedical: audit leaks and shut unused outlets in step-down wards",
        ],
        [
          "Set triage board: ICU/HDU/Ward with current flow & SpO₂; re-balance every 30 min",
          "Pool concentrators to casualty/HDU; ensure generator readiness",
          "Coordinate with nearby government medical college for 10 oxygen beds if levels <25%",
          "Educate attendants on proning to reduce flow by ~1–2 L/min",
        ],
        {
          risk: "8/10",
          cost: "6–8 lakh",
          timeline: "6–12 hours to stabilize; 24 hours to normal",
        },
        {
          beds_needed: bedsNeeded,
          oxygen_needed_liters: oxygenLiters,
          staff_needed: {
            doctors,
            nurses,
            technicians: techs,
            total: doctors + nurses + techs,
          },
          other_resources: [
            {
              item: "Jumbo oxygen cylinders",
              quantity: 40,
              unit: "units",
              priority: "critical",
            },
            {
              item: "Oxygen flowmeters",
              quantity: Math.max(20, Math.round(bedsNeeded * 0.6)),
              unit: "units",
              priority: "high",
            },
            {
              item: "Nasal cannula & masks",
              quantity: bedsNeeded * 2,
              unit: "sets",
              priority: "high",
            },
          ],
          assumptions: [
            "Average flow 3–5 L/min in wards",
            "Vendor supply in 2–4 hours",
            "Power backup for concentrators",
          ],
          time_window_minutes: 240,
        }
      );
    }

    // Staff Shortage
    if (
      (q.includes("staff") || q.includes("nurse") || q.includes("doctor")) &&
      (q.includes("shortage") ||
        q.includes("40%") ||
        q.includes("absent") ||
        q.includes("sick"))
    ) {
      const bedsCovered = Math.max(assumeBeds, 30);
      const nursesNeeded = Math.ceil(bedsCovered / 6);
      const doctorsNeeded = Math.ceil(bedsCovered / 15);
      const techsNeeded = Math.ceil(bedsCovered / 12);
      return build(
        [
          "Activate emergency roster; merge low-acuity wards; adopt team nursing (1 senior + 2 juniors per 18–20 beds)",
          "Pull float pool and OT recovery nurses to wards; pause elective clinics post-lunch",
          "HR to call empanelled locums for 12-hour shifts; offer meal & travel allowance",
          "Cap non-urgent admissions; discharge stable cases with home-care instructions",
        ],
        [
          "Nurse-driven protocols for vitals, O₂ titration, and early warning scores",
          "Telemedicine for specialist rounds; twice-daily consolidated rounds",
          "Cross-train ward attendants for logistics to free clinical time",
        ],
        {
          risk: "6/10",
          cost: "2–3 lakh",
          timeline: "24–48 hours under constrained ops",
        },
        {
          beds_needed: bedsCovered,
          oxygen_needed_liters: Math.round(bedsCovered * 10),
          staff_needed: {
            doctors: doctorsNeeded,
            nurses: nursesNeeded,
            technicians: techsNeeded,
            total: doctorsNeeded + nursesNeeded + techsNeeded,
          },
          other_resources: [
            {
              item: "Locum nurse shifts",
              quantity: nursesNeeded * 2,
              unit: "shifts",
              priority: "high",
            },
            {
              item: "Meal kits for staff",
              quantity: bedsCovered,
              unit: "meals",
              priority: "medium",
            },
          ],
          assumptions: [
            "Ratios relaxed <48 hours",
            "Non-urgent services deferred",
            "Tele-rounds available for one specialty",
          ],
          time_window_minutes: 720,
        }
      );
    }

    // Bed Overflow / Mass Casualty
    if (
      q.includes("overflow") ||
      q.includes("200%") ||
      q.includes("mass casualty") ||
      q.includes("surge") ||
      /\b(\d+)\s*trauma/.test(q)
    ) {
      const incoming = num(/(\d+)\s*(trauma|patient)s?/i, 50);
      const bedsNeeded = Math.max(assumeBeds, incoming);
      const icu = Math.max(6, Math.round(incoming * 0.15));
      const hdu = Math.max(10, Math.round(incoming * 0.25));
      const ward = Math.max(20, bedsNeeded - (icu + hdu));
      const doctors = Math.ceil(incoming / 8);
      const nurses = Math.ceil(incoming / 3);
      const techs = Math.ceil(incoming / 6);
      return build(
        [
          "Set up triage at ambulance bay (red/yellow/green/black) with senior EMO; 3 triage tables",
          "Open step-down/day-care as surge wards; place 20 camp beds with O₂ near HDU",
          "Notify district control room; request 2 ambulances; blood bank standby (10 O-, 10 A+)",
          "Suspend non-emergency admissions for 24 hours; convert recovery to 8 beds",
        ],
        [
          `Bed map: ICU ${icu}, HDU ${hdu}, Ward ${ward}; dedicate turn-around team for diagnostics/pharmacy`,
          "Mobilize ortho/general surgery/anesthesia residents into trauma teams; 2-hour rotations",
          "Transfer stabilized yellow-tag patients to partner hospitals per protocol",
        ],
        {
          risk: "9/10",
          cost: "10–15 lakh",
          timeline: "12–24 hours for decongestion",
        },
        {
          beds_needed: bedsNeeded,
          oxygen_needed_liters: Math.round(bedsNeeded * 60),
          staff_needed: {
            doctors,
            nurses,
            technicians: techs,
            total: doctors + nurses + techs,
          },
          other_resources: [
            {
              item: "Camp beds",
              quantity: 20,
              unit: "units",
              priority: "high",
            },
            {
              item: "Blood units (O-, A+)",
              quantity: 20,
              unit: "units",
              priority: "critical",
            },
            {
              item: "C-collars & splints",
              quantity: 30,
              unit: "sets",
              priority: "high",
            },
          ],
          assumptions: [
            "District disaster plan active",
            "Partner hospitals accept transfers in 4 hours",
            "OTs free for life/limb-saving",
          ],
          time_window_minutes: 720,
        }
      );
    }

    // Equipment Failure (ICU ventilators)
    if (q.includes("ventilator") || (q.includes("icu") && q.includes("fail"))) {
      const ventilatorsDown = num(/(\d+)\s*(ventilator)s?/i, 5);
      const bedsAffected = Math.max(
        assumeCrit,
        Math.round(ventilatorsDown * 1.2)
      );
      const doctors = Math.ceil(bedsAffected / 10);
      const nurses = Math.ceil(bedsAffected / 2);
      const techs = Math.max(2, Math.ceil(bedsAffected / 6));
      return build(
        [
          "Shift affected ICU patients to transport ventilators/AMBU with PEEP valves; 1 nurse per 2 patients",
          "Biomed to isolate fault (power/gas/humidifier); check manifold pressure & UPS",
          "Call AMC vendor for urgent replacement; request 4 rental ventilators (24–48 hours)",
          "Move stable ventilated patients to HDU with close monitoring; keep crash cart ready",
        ],
        [
          "Prioritize weaning trials to free vents",
          "Pool OT anesthesia machines for temporary support in recovery",
          "Ensure ETT securement & sedation protocols during transfers",
        ],
        {
          risk: "8/10",
          cost: "4–6 lakh",
          timeline: "12–24 hours to restore capacity",
        },
        {
          beds_needed: bedsAffected,
          oxygen_needed_liters: Math.round(bedsAffected * 80),
          staff_needed: {
            doctors,
            nurses,
            technicians: techs,
            total: doctors + nurses + techs,
          },
          other_resources: [
            {
              item: "Rental ventilators",
              quantity: 4,
              unit: "units",
              priority: "critical",
            },
            {
              item: "Transport ventilators",
              quantity: 2,
              unit: "units",
              priority: "high",
            },
            {
              item: "PEEP valves & AMBU bags",
              quantity: bedsAffected,
              unit: "sets",
              priority: "high",
            },
          ],
          assumptions: [
            "AMC response within 4 hours",
            "OT machines available",
            "HDU can accept stepped-down patients",
          ],
          time_window_minutes: 360,
        }
      );
    }

    // Seasonal Disease Outbreak (respiratory)
    if (
      q.includes("covid") ||
      q.includes("respiratory") ||
      q.includes("outbreak")
    ) {
      const addedCases = num(/(\d+)\s*(case|patient)s?/i, 30);
      const bedsNeeded = Math.max(assumeBeds, addedCases);
      const doctors = Math.ceil(bedsNeeded / 12);
      const nurses = Math.ceil(bedsNeeded / 5);
      const techs = Math.ceil(bedsNeeded / 10);
      return build(
        [
          "Reopen isolation ward; define green/yellow/red zones; enforce N95 & hand hygiene checkpoints",
          "Start fever triage OPD outside main building; enable e-prescriptions",
          "Stock antivirals per ID protocol; initiate high-risk staff vaccination drive",
        ],
        [
          "Scale RT-PCR/rapid testing with pooled sampling; SMS reporting to reduce crowding",
          "Expand oxygen-supported beds by converting step-down unit; add 10 concentrators",
          "Stagger visiting hours; limit attendants to one per patient",
        ],
        {
          risk: "7/10",
          cost: "5–7 lakh",
          timeline: "1–2 weeks heightened load",
        },
        {
          beds_needed: bedsNeeded,
          oxygen_needed_liters: Math.round(bedsNeeded * 40),
          staff_needed: {
            doctors,
            nurses,
            technicians: techs,
            total: doctors + nurses + techs,
          },
          other_resources: [
            {
              item: "N95 masks",
              quantity: bedsNeeded * 4,
              unit: "units",
              priority: "critical",
            },
            {
              item: "Rapid antigen kits",
              quantity: bedsNeeded * 2,
              unit: "units",
              priority: "high",
            },
            {
              item: "Oxygen concentrators",
              quantity: 10,
              unit: "units",
              priority: "high",
            },
          ],
          assumptions: [
            "Isolation capacity available",
            "Lab throughput +50% possible",
            "Moderate community transmission",
          ],
          time_window_minutes: 10080,
        }
      );
    }

    // Generic India-oriented fallback
    const fallbackBeds = Math.max(20, assumeBeds);
    const fallbackDoctors = Math.ceil(fallbackBeds / 12);
    const fallbackNurses = Math.ceil(fallbackBeds / 5);
    const fallbackTechs = Math.ceil(fallbackBeds / 10);
    return build(
      [
        "Convene control room with MS, nursing head, and biomed within 10 minutes",
        "Freeze elective load; publish bed & oxygen status; enable rapid discharge of stable cases",
        "Activate vendor calls per rate contract for oxygen, disposables, rental equipment",
      ],
      [
        "Re-balance staff across units; team nursing; assign runner per ward for logistics",
        "Establish transfer corridor with partner hospitals; use government ambulance network",
        "Maintain hourly dashboard: beds, oxygen, staff on duty; escalate proactively",
      ],
      {
        risk: "6/10",
        cost: "3–5 lakh",
        timeline: "24–48 hours to steady state",
      },
      {
        beds_needed: fallbackBeds,
        oxygen_needed_liters: Math.round(fallbackBeds * 40),
        staff_needed: {
          doctors: fallbackDoctors,
          nurses: fallbackNurses,
          technicians: fallbackTechs,
          total: fallbackDoctors + fallbackNurses + fallbackTechs,
        },
        other_resources: [
          {
            item: "Disposable kits",
            quantity: fallbackBeds * 3,
            unit: "sets",
            priority: "high",
          },
          {
            item: "Oxygen flowmeters",
            quantity: Math.max(15, Math.round(fallbackBeds * 0.5)),
            unit: "units",
            priority: "high",
          },
        ],
        assumptions: [
          "Tertiary setup with nearby referrals",
          "Power backup available",
          "Rate-contract vendors responsive",
        ],
        time_window_minutes: 1440,
      }
    );
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
