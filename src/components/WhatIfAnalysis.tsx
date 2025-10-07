import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Copy,
  Download,
  Brain,
  Activity,
  Users,
  Bed,
  Heart,
} from "lucide-react";
import GeminiService from "../services/GeminiService";
import MarkdownRenderer from "./MarkdownRenderer";

import EnhancedApiService from "../services/EnhancedApiService";
import aiConfig from "../config/aiConfig";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface WhatIfScenario {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  prompt: string;
  category: "resource" | "emergency" | "capacity" | "staffing";
}

const WhatIfAnalysis: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [geminiService] = useState(
    () => new GeminiService(aiConfig.gemini.apiKey)
  );
  const [liveStatus, setLiveStatus] = useState({
    totalBeds: aiConfig.hospitalContext.totalBeds,
    availableBeds: aiConfig.hospitalContext.currentStatus.availableBeds,
    occupiedBeds:
      aiConfig.hospitalContext.totalBeds -
      aiConfig.hospitalContext.currentStatus.availableBeds,
    oxygenLevelPercent: aiConfig.hospitalContext.currentStatus.oxygenLevel,
    totalStaff: aiConfig.hospitalContext.totalStaff,
    staffOnDuty: Math.round(
      (aiConfig.hospitalContext.totalStaff *
        aiConfig.hospitalContext.currentStatus.staffWorkload) /
        100
    ),
    staffLoadPercent: aiConfig.hospitalContext.currentStatus.staffWorkload,
    emergencyCases: aiConfig.hospitalContext.currentStatus.emergencyCases,
    criticalOxygenStations: undefined as number | undefined,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [selectedScenario, setSelectedScenario] =
    useState<WhatIfScenario | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const whatIfScenarios: WhatIfScenario[] = [
    {
      title: "Oxygen Supply Crisis",
      description: "Analyze impact of oxygen shortage scenarios",
      icon: Activity,
      category: "resource",
      prompt:
        "What if our oxygen supply drops to 30% capacity during peak hours? Analyze the impact on patient care, recommend immediate actions, and suggest preventive measures.",
    },
    {
      title: "Staff Shortage Impact",
      description: "Evaluate effects of reduced staffing levels",
      icon: Users,
      category: "staffing",
      prompt:
        "What if 40% of our nursing staff calls in sick during a flu outbreak? Analyze the impact on patient safety, workload distribution, and recommend emergency staffing protocols.",
    },
    {
      title: "Bed Capacity Overflow",
      description: "Handle sudden surge in patient admissions",
      icon: Bed,
      category: "capacity",
      prompt:
        "What if we experience a 200% increase in emergency admissions due to a major accident? Analyze bed allocation strategies, patient flow optimization, and overflow protocols.",
    },
    {
      title: "Emergency Mass Casualty",
      description: "Prepare for disaster response scenarios",
      icon: AlertTriangle,
      category: "emergency",
      prompt:
        "What if we receive 50 trauma patients from a multi-vehicle accident within 2 hours? Analyze triage protocols, resource allocation, and coordination with other hospitals.",
    },
    {
      title: "Equipment Failure",
      description: "Handle critical equipment breakdowns",
      icon: Heart,
      category: "resource",
      prompt:
        "What if our main ICU ventilators fail during peak usage? Analyze backup protocols, patient transfer options, and emergency equipment procurement strategies.",
    },
    {
      title: "Seasonal Disease Outbreak",
      description: "Manage infectious disease surges",
      icon: TrendingUp,
      category: "capacity",
      prompt:
        "What if we face a COVID-19 like outbreak with 300% increase in respiratory cases? Analyze isolation protocols, staffing adjustments, and supply chain impacts.",
    },
  ];

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "bot",
        content: `🏥 **Hospital Operations AI Assistant**

I'm powered by Google Gemini AI to provide real-time operational guidance for hospital scenarios.

📊 **Current Status**: Oxygen 29% (CRITICAL), 66 beds available, Staff load 27%, 7 emergency cases

🎯 **I Can Analyze**:
- Resource crises (oxygen, supplies, equipment)
- Staffing impacts (shortages, scheduling)
- Capacity management (bed overflow, surge)
- Emergency preparedness (mass casualty, disasters)

💡 **Try asking**: "What if oxygen drops to 30%?" or "What if 50 patients arrive at once?"

**Select a scenario below or ask your own question for AI-powered analysis.**`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Fetch live metrics for AI context (with safe fallback)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (!aiConfig.features.enableRealTimeContext) return;
        const summary = await EnhancedApiService.getDashboardSummary();
        if (!summary || cancelled) return;

        const totalBeds =
          (summary as any).available_beds + (summary as any).occupied_beds ||
          liveStatus.totalBeds;
        const availableBeds =
          (summary as any).available_beds ?? liveStatus.availableBeds;
        const occupiedBeds =
          (summary as any).occupied_beds ?? totalBeds - availableBeds;
        const staffOnDuty =
          (summary as any).staff_on_duty ?? liveStatus.staffOnDuty;
        const totalStaff = liveStatus.totalStaff;
        const staffLoadPercent = totalStaff
          ? Math.round((staffOnDuty / totalStaff) * 100)
          : liveStatus.staffLoadPercent;

        // Compute oxygen average from status buckets if present
        let oxygenLevelPercent = liveStatus.oxygenLevelPercent;
        const oxygenStatus = (summary as any).oxygen_status as
          | Array<{ status: string; count: number; avg_level: number }>
          | undefined;
        let criticalOxygenStations = liveStatus.criticalOxygenStations;
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
          if (criticalBucket) {
            criticalOxygenStations = criticalBucket.count || 0;
          }
        }

        setLiveStatus((prev) => ({
          ...prev,
          totalBeds: totalBeds || prev.totalBeds,
          availableBeds: availableBeds ?? prev.availableBeds,
          occupiedBeds: occupiedBeds ?? prev.occupiedBeds,
          oxygenLevelPercent,
          staffOnDuty,
          staffLoadPercent,
          criticalOxygenStations,
        }));
      } catch (e) {
        // Keep defaults on failure
        console.warn("Live context fetch failed; using defaults", e);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Update scroll button visibility when messages change
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      handleScroll();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      // Show button when user is not at the bottom (more than 100px from bottom)
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content: "Analyzing scenario and generating recommendations...",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const systemPrompt = geminiService.getHospitalSystemPrompt(liveStatus);
      const botResponse = await geminiService.generateResponse(
        message,
        systemPrompt
      );

      // Try to extract the strict JSON block and prepend a KPI summary
      const enhancedContent = (() => {
        try {
          const idx = botResponse.lastIndexOf("JSON:");
          if (idx >= 0) {
            const jsonText = botResponse
              .slice(idx + 5)
              .trim()
              // If model accidentally wrapped with code fences, strip them
              .replace(/^```json\s*/i, "")
              .replace(/```\s*$/i, "");
            const parsed = JSON.parse(jsonText);
            const beds = parsed.beds_needed;
            const oxygen = parsed.oxygen_needed_liters;
            const staff = parsed.staff_needed || {};
            const others: Array<{
              item: string;
              quantity: number;
              unit: string;
              priority: string;
            }> = parsed.other_resources || [];

            const otherLines = others
              .slice(0, 5)
              .map(
                (o: any) =>
                  `- ${o.item} — ${o.quantity} ${o.unit} (${o.priority})`
              )
              .join("\n");

            const summary = `**✅ Key requirements (computed)**\n- Beds needed: ${beds} \n- Oxygen needed: ${oxygen} liters\n- Staff needed: ${
              staff.total ?? 0
            } (doctors ${staff.doctors ?? 0}, nurses ${
              staff.nurses ?? 0
            }, technicians ${staff.technicians ?? 0})\n${
              others.length ? `- Other resources (top):\n${otherLines}` : ""
            }\n\n`;

            return summary + botResponse;
          }
        } catch (e) {
          // ignore parse errors; show original text
        }
        return botResponse;
      })();

      // Remove loading message and add bot response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        return [
          ...filtered,
          {
            id: Date.now().toString(),
            type: "bot",
            content: enhancedContent,
            timestamp: new Date(),
          },
        ];
      });
    } catch (error) {
      console.error("Error calling Gemini API:", error);

      // Remove loading message and add detailed error message
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        return [
          ...filtered,
          {
            id: Date.now().toString(),
            type: "bot",
            content: `🚨 **System Alert - Analysis Service Interrupted**

**What happened**: The AI analysis service encountered an unexpected error while processing your scenario.

**Possible causes**:
- Network connectivity issues between hospital and AI service
- Temporary service overload due to high demand
- API authentication or rate limiting
- Service maintenance window

🎯 **Immediate Actions**:
- **For Critical Scenarios**: Contact Hospital Operations Center immediately at extension 911
- **For Planning Scenarios**: Try again in 2-3 minutes
- Use the pre-built scenario buttons below for tested examples

📋 **Alternative Options**:
- Review hospital Standard Operating Procedures (SOPs)
- Consult department emergency response protocols  
- Contact your supervisor or department head
- Use the hospital's printed emergency response guides

💡 **Tip**: The system works best with specific scenarios like "What if oxygen drops to 30%" rather than general questions.

**Error Details**: ${
              error instanceof Error ? error.message : "Unknown error occurred"
            }

*This is a demonstration system. For real emergencies, always follow your hospital's established protocols.*`,
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScenarioClick = (scenario: WhatIfScenario) => {
    setSelectedScenario(scenario);
    sendMessage(scenario.prompt);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const exportChat = () => {
    const chatContent = messages
      .map(
        (msg) =>
          `[${msg.timestamp.toLocaleTimeString()}] ${msg.type.toUpperCase()}: ${
            msg.content
          }`
      )
      .join("\n\n");

    const blob = new Blob([chatContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `what-if-analysis-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearChat = () => {
    setMessages([]);
    setSelectedScenario(null);
    // Re-add welcome message
    setTimeout(() => {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "bot",
        content: `🔄 **Chat Reset - AI Assistant Ready**

**System Status**: Gemini AI operational and ready for scenario analysis.

What hospital scenario would you like to explore? Select from the sidebar or ask your own question.`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }, 100);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "resource":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "emergency":
        return "bg-red-100 text-red-800 border-red-200";
      case "capacity":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "staffing":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                What-If Analysis Assistant
              </span>
            </h1>
            <p className="text-gray-600 text-lg">
              AI-powered scenario analysis and resource optimization
              recommendations
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={scrollToBottom}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              title="Scroll to bottom of chat"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              <span>Bottom</span>
            </button>
            <button
              onClick={exportChat}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={clearChat}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Scenario Suggestions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Scenario Library
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Select from pre-built scenarios or ask your own questions
            </p>
            <div className="space-y-3">
              {whatIfScenarios.map((scenario, index) => {
                const Icon = scenario.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleScenarioClick(scenario)}
                    disabled={isLoading}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                      selectedScenario?.title === scenario.title
                        ? "border-purple-300 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-purple-200"
                    } ${
                      isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {scenario.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {scenario.description}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(
                            scenario.category
                          )}`}
                        >
                          {scenario.category}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Live Status
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm font-medium text-red-900">
                    Oxygen Supply
                  </span>
                </div>
                <span className="text-sm font-bold text-red-600">
                  {liveStatus.oxygenLevelPercent}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium text-green-900">
                    Bed Available
                  </span>
                </div>
                <span className="text-sm font-bold text-green-600">
                  {liveStatus.availableBeds}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium text-green-900">
                    Staff Load
                  </span>
                </div>
                <span className="text-sm font-bold text-green-600">
                  {liveStatus.staffLoadPercent}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  <span className="text-sm font-medium text-yellow-900">
                    Emergency
                  </span>
                </div>
                <span className="text-sm font-bold text-yellow-600">
                  {liveStatus.emergencyCases} cases
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col h-[800px] relative">
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      AI Analysis Assistant
                    </h3>
                    <p className="text-sm text-gray-600">
                      {isLoading
                        ? "Analyzing scenario..."
                        : "Ready to help with what-if analysis"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isLoading ? "bg-yellow-400" : "bg-green-400"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {isLoading ? "Processing" : "Online"}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6"
              onScroll={handleScroll}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-4xl ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                        : "bg-gray-50 text-gray-900 border border-gray-200"
                    } rounded-2xl p-4 shadow-sm`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-1 rounded-lg ${
                          message.type === "user"
                            ? "bg-white/20"
                            : "bg-blue-100"
                        }`}
                      >
                        {message.type === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot
                            className={`w-4 h-4 ${
                              message.isLoading
                                ? "text-yellow-600 animate-spin"
                                : "text-blue-600"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-sm font-medium ${
                              message.type === "user"
                                ? "text-white/80"
                                : "text-gray-600"
                            }`}
                          >
                            {message.type === "user" ? "You" : "AI Assistant"}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-xs ${
                                message.type === "user"
                                  ? "text-white/60"
                                  : "text-gray-500"
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {!message.isLoading && (
                              <button
                                onClick={() => copyMessage(message.content)}
                                className={`p-1 rounded hover:bg-opacity-20 transition-colors ${
                                  message.type === "user"
                                    ? "hover:bg-white"
                                    : "hover:bg-gray-400"
                                }`}
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          {message.type === "user" ? (
                            <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </div>
                          ) : (
                            <MarkdownRenderer
                              content={message.content}
                              className="text-gray-900"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Floating Scroll to Bottom Button */}
            {showScrollButton && (
              <div className="absolute bottom-20 right-6 z-10">
                <button
                  onClick={scrollToBottom}
                  className="p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all duration-200 hover:scale-105"
                  title="Scroll to bottom"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Input */}
            <div className="p-6 border-t border-gray-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(inputMessage);
                }}
                className="flex space-x-4"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about scenarios like 'What if we lose 50% of ICU capacity?' or select from scenarios..."
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  <span>Analyze</span>
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                💡 Try asking about resource shortages, staff changes, capacity
                issues, or emergency scenarios
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfAnalysis;
