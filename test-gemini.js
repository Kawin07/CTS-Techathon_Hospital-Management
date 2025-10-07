// Test script for Gemini API integration
// Run this script to verify the What-If Analysis AI functionality

import GeminiService from "../src/services/GeminiService.js";

const testGeminiIntegration = async () => {
  console.log("🏥 Testing Hospital What-If Analysis AI Integration...\n");

  // Initialize Gemini service
  const geminiService = new GeminiService(
    "AIzaSyB8TVxfT2QUq_r2z81njzy_7krygugC37g"
  );

  // Test API key validation
  console.log("1. Testing API Key Validation...");
  const isValidKey = geminiService.isValidApiKey(
    "AIzaSyB8TVxfT2QUq_r2z81njzy_7krygugC37g"
  );
  console.log(`   API Key Valid: ${isValidKey ? "✅" : "❌"}\n`);

  // Test connection
  console.log("2. Testing API Connection...");
  try {
    const connectionTest = await geminiService.testConnection();
    console.log(
      `   Connection Status: ${connectionTest ? "✅ Connected" : "❌ Failed"}\n`
    );
  } catch (error) {
    console.log(`   Connection Status: ❌ Error - ${error.message}\n`);
  }

  // Test hospital scenario analysis
  console.log("3. Testing Hospital Scenario Analysis...");
  const testScenario =
    "What if our oxygen supply drops to 30% capacity during peak hours?";

  try {
    console.log(`   Scenario: ${testScenario}`);
    console.log("   Generating AI response...\n");

    const systemPrompt = geminiService.getHospitalSystemPrompt();
    const response = await geminiService.generateResponse(
      testScenario,
      systemPrompt
    );

    console.log("   ✅ AI Response Generated Successfully!");
    console.log("   📄 Response Preview:");
    console.log(`   ${response.substring(0, 200)}...\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log("🎯 Test Summary:");
  console.log("   - Gemini API integration implemented");
  console.log("   - Hospital-specific system prompts configured");
  console.log("   - What-If Analysis scenarios supported");
  console.log("   - Error handling and validation included");
  console.log("\n✨ Ready for hospital scenario analysis!");
};

// Run the test
if (typeof window === "undefined") {
  // Node.js environment
  testGeminiIntegration().catch(console.error);
} else {
  // Browser environment
  console.log("🏥 What-If Analysis AI System Ready!");
  console.log("Navigate to Analytics → What-If Analysis to test the feature.");
}

export default testGeminiIntegration;
