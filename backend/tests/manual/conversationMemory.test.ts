import {
  addUserMessage,
  addAssistantMessage,
  getUserConversationHistory,
  clearUserConversation,
  formatConversationHistoryForPrompt,
  initializeConversationMemory
} from "../../src/services/conversationMemoryService";

/**
 * Manual test for conversation memory functionality
 * This test demonstrates the conversation memory system in action
 */
async function runConversationMemoryTest() {
  console.log("🧪 Starting Conversation Memory Manual Test...\n");

  const TEST_USER_ID = 123456789;

  try {
    // Initialize conversation memory
    console.log("1. Initializing conversation memory...");
    initializeConversationMemory();
    console.log("✅ Conversation memory initialized\n");

    // Clear any existing conversation
    console.log("2. Clearing any existing conversation...");
    clearUserConversation(TEST_USER_ID);
    console.log("✅ Conversation cleared\n");

    // Simulate a conversation
    console.log("3. Simulating conversation...");

    // User messages
    addUserMessage(TEST_USER_ID, "Hoe kan ik gemotiveerd blijven met gewichtsverlies?");
    console.log("📝 Added user message 1");

    // Assistant response
    addAssistantMessage(TEST_USER_ID, "Focus op kleine doelen en vier je successen! Elke dag dat je gezonde keuzes maakt, brengt je dichter bij je doel.");
    console.log("🤖 Added assistant response 1");

    // User follow-up
    addUserMessage(TEST_USER_ID, "Ik heb moeite met consistent blijven");
    console.log("📝 Added user message 2");

    // Assistant follow-up response
    addAssistantMessage(TEST_USER_ID, "Consistentie is moeilijk voor iedereen. Probeer een vast schema te maken en wees niet te streng voor jezelf als het een keer niet lukt.");
    console.log("🤖 Added assistant response 2");

    // More user messages to test the 30 message limit
    for (let i = 3; i <= 35; i++) {
      addUserMessage(TEST_USER_ID, `Test bericht ${i}`);
    }
    console.log("📝 Added 33 more user messages (testing 30 message limit)\n");

    // Get conversation history
    console.log("4. Retrieving conversation history...");
    const history = getUserConversationHistory(TEST_USER_ID);
    console.log(`📊 Total messages in history: ${history.length}`);
    console.log(`✅ Expected: 30 (due to message limit), Actual: ${history.length}`);

    // Show first and last messages
    if (history.length > 0) {
      console.log(`\n📄 First message: "${history[0]?.content}"`);
      console.log(`📄 Last message: "${history[history.length - 1]?.content}"`);
    }

    // Format history for prompt
    console.log("\n5. Formatting conversation history for prompt...");
    const formattedHistory = formatConversationHistoryForPrompt(history);
    console.log("📋 Formatted history preview:");
    console.log(formattedHistory.substring(0, 200) + "...\n");

    // Show message distribution
    console.log("6. Message distribution:");
    const userMessages = history.filter(msg => msg.role === "user");
    const assistantMessages = history.filter(msg => msg.role === "assistant");
    console.log(`👤 User messages: ${userMessages.length}`);
    console.log(`🤖 Assistant messages: ${assistantMessages.length}`);

    // Test conversation persistence
    console.log("\n7. Testing persistence...");
    const freshHistory = getUserConversationHistory(TEST_USER_ID);
    console.log(`🔄 Fresh retrieval count: ${freshHistory.length}`);
    console.log(`✅ Persistence check: ${freshHistory.length === history.length ? "PASS" : "FAIL"}`);

    // Clean up
    console.log("\n8. Cleaning up...");
    clearUserConversation(TEST_USER_ID);
    const finalHistory = getUserConversationHistory(TEST_USER_ID);
    console.log(`🗑️  Final history count after cleanup: ${finalHistory.length}`);
    console.log(`✅ Cleanup check: ${finalHistory.length === 0 ? "PASS" : "FAIL"}`);

    console.log("\n🎉 Conversation Memory Manual Test Completed Successfully!");

  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  runConversationMemoryTest();
}

export { runConversationMemoryTest };
