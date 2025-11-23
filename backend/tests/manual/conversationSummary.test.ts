import {
  addUserMessage,
  addAssistantMessage,
  getUserConversationHistory,
  getConversationSummary,
  setConversationSummary,
  formatConversationHistoryForPrompt,
  clearUserConversation,
  initializeConversationMemory
} from "../../src/services/conversationMemoryService";

/**
 * Manual test for conversation memory with summary functionality
 * This test demonstrates how key achievements are preserved in summaries
 */
async function runConversationSummaryTest() {
  console.log("🧪 Starting Conversation Summary Manual Test...\n");

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

    // Simulate a conversation with key achievements
    console.log("3. Simulating conversation with key achievements...\n");

    // User shares important achievement
    console.log("📝 User: 'Ik ben 5 kg afgevallen deze maand!'");
    addUserMessage(TEST_USER_ID, "Ik ben 5 kg afgevallen deze maand!");

    // Assistant responds
    console.log("🤖 Coach: 'Geweldig! Dat is een fantastische prestatie. Blijf zo doorgaan!'");
    addAssistantMessage(TEST_USER_ID, "Geweldig! Dat is een fantastische prestatie. Blijf zo doorgaan!");

    // User shares goal
    console.log("📝 User: 'Mijn doel is om nog 3 kg af te vallen voor de zomer'");
    addUserMessage(TEST_USER_ID, "Mijn doel is om nog 3 kg af te vallen voor de zomer");

    // Assistant responds
    console.log("🤖 Coach: 'Dat is een mooi doel! Laten we een plan maken om dat te bereiken.'");
    addAssistantMessage(TEST_USER_ID, "Dat is een mooi doel! Laten we een plan maken om dat te bereiken.");

    // User shares challenge
    console.log("📝 User: 'Ik vind het moeilijk om gemotiveerd te blijven met sporten'");
    addUserMessage(TEST_USER_ID, "Ik vind het moeilijk om gemotiveerd te blijven met sporten");

    // Assistant responds
    console.log("🤖 Coach: 'Probeer verschillende sporten uit te vinden wat je leuk vindt. Consistentie is belangrijker dan intensiteit.'");
    addAssistantMessage(TEST_USER_ID, "Probeer verschillende sporten uit te vinden wat je leuk vindt. Consistentie is belangrijker dan intensiteit.");

    // User shares another achievement
    console.log("📝 User: 'Ik heb deze week 4x gesport!'");
    addUserMessage(TEST_USER_ID, "Ik heb deze week 4x gesport!");

    // Manually set a comprehensive summary that captures key achievements
    console.log("\n4. Setting comprehensive conversation summary...");
    const comprehensiveSummary = "User heeft 5 kg afgevallen, wil nog 3 kg verliezen voor de zomer, heeft moeite met motivatie voor sporten maar heeft deze week 4x gesport.";
    setConversationSummary(TEST_USER_ID, comprehensiveSummary);
    console.log("✅ Summary set:", comprehensiveSummary);

    // Get conversation summary
    console.log("\n5. Retrieving conversation summary...");
    const summary = getConversationSummary(TEST_USER_ID);
    console.log("📋 Current summary:", summary);

    // Get conversation history
    console.log("\n6. Retrieving conversation history...");
    const history = getUserConversationHistory(TEST_USER_ID);
    console.log(`📊 Total messages in history: ${history.length}`);

    // Format conversation for prompt
    console.log("\n7. Formatting conversation for AI prompt...");
    const formattedPrompt = formatConversationHistoryForPrompt(history, summary);
    console.log("📝 Formatted prompt preview:");
    console.log("=".repeat(50));
    console.log(formattedPrompt);
    console.log("=".repeat(50));

    // Simulate adding many more messages to test the 30-message limit
    console.log("\n8. Testing message limit (adding 25 more messages)...");
    for (let i = 1; i <= 25; i++) {
      addUserMessage(TEST_USER_ID, `Dagelijkse update bericht ${i}`);
      if (i % 5 === 0) {
        addAssistantMessage(TEST_USER_ID, `Motiverend antwoord ${i}`);
      }
    }

    // Check that summary persists even when messages are trimmed
    console.log("\n9. Verifying summary persistence after message trimming...");
    const finalHistory = getUserConversationHistory(TEST_USER_ID);
    const finalSummary = getConversationSummary(TEST_USER_ID);

    console.log(`📊 Final message count: ${finalHistory.length}`);
    console.log(`📋 Final summary: ${finalSummary}`);
    console.log(`✅ Summary preserved: ${finalSummary === comprehensiveSummary ? "YES" : "NO"}`);

    // Show that key achievements are still in the summary even when old messages are gone
    console.log("\n10. Key achievements preserved in summary:");
    const keyAchievements = [
      "5 kg afgevallen",
      "3 kg verliezen voor de zomer",
      "4x gesport"
    ];

    keyAchievements.forEach(achievement => {
      const isPreserved = finalSummary.includes(achievement);
      console.log(`   ${achievement}: ${isPreserved ? "✅ PRESERVED" : "❌ LOST"}`);
    });

    // Test prompt formatting with the preserved summary
    console.log("\n11. Final prompt formatting test...");
    const finalFormatted = formatConversationHistoryForPrompt(finalHistory, finalSummary);
    console.log("📝 Final formatted prompt length:", finalFormatted.length, "characters");
    console.log("📝 Contains summary:", finalFormatted.includes("Conversation Summary:"));
    console.log("📝 Contains recent messages:", finalFormatted.includes("Dagelijkse update bericht"));

    // Clean up
    console.log("\n12. Cleaning up...");
    clearUserConversation(TEST_USER_ID);
    const cleanupSummary = getConversationSummary(TEST_USER_ID);
    console.log(`🗑️  Summary after cleanup: "${cleanupSummary}"`);
    console.log(`✅ Cleanup successful: ${cleanupSummary === "No conversation history yet." ? "YES" : "NO"}`);

    console.log("\n🎉 Conversation Summary Manual Test Completed Successfully!");
    console.log("\n💡 Key Insight: The summary preserves important achievements even when individual messages are lost due to the 30-message limit!");

  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  runConversationSummaryTest();
}

export { runConversationSummaryTest };
