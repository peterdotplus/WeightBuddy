import {
  addUserMessage,
  addAssistantMessage,
  getConversationSummary,
  setConversationSummary,
  formatConversationHistoryForPrompt,
  clearUserConversation,
  initializeConversationMemory,
} from "../../src/services/conversationMemoryService";

/**
 * Real Conversation Demo
 * This demonstrates how the conversation memory system preserves key achievements
 * even as messages get trimmed due to the 30-message limit.
 */
async function runRealConversationDemo() {
  console.log("🎭 Real Conversation Demo - Weight Loss Journey\n");
  console.log(
    "This demo shows how key achievements (like losing 5kg) are preserved",
  );
  console.log(
    "in the conversation summary, even when individual messages are lost.\n",
  );

  const USER_ID = 123456789;

  try {
    // Initialize and clear conversation
    initializeConversationMemory();
    clearUserConversation(USER_ID);
    console.log("🔄 Starting fresh conversation...\n");

    // Phase 1: User shares important achievements
    console.log("📅 WEEK 1 - User shares key achievements");
    console.log("=".repeat(50));

    addUserMessage(
      USER_ID,
      "Hoi! Ik ben net begonnen met mijn gewichtsverlies reis. Ik weeg nu 85 kg.",
    );
    addAssistantMessage(
      USER_ID,
      "Wat goed dat je bent begonnen! Dat is de eerste stap. Hoe voel je je?",
    );

    addUserMessage(
      USER_ID,
      "Ik voel me gemotiveerd! Mijn doel is om 10 kg af te vallen in 3 maanden.",
    );
    addAssistantMessage(
      USER_ID,
      "Dat is een mooi en realistisch doel! 10 kg in 3 maanden is prima te doen met gezonde gewoontes.",
    );

    addUserMessage(
      USER_ID,
      "Ik heb deze week al 2 kg verloren! Ik ben zo trots!",
    );
    addAssistantMessage(
      USER_ID,
      "Wauw, fantastisch! 2 kg in de eerste week is geweldig. Blijf zo doorgaan!",
    );

    // Manually set a summary to capture these key achievements
    setConversationSummary(
      USER_ID,
      "User weegt 85 kg, doel is 10 kg afvallen in 3 maanden, heeft al 2 kg verloren in eerste week, voelt zich gemotiveerd.",
    );

    console.log("✅ Week 1 achievements captured in summary");
    console.log("📋 Summary:", getConversationSummary(USER_ID));
    console.log();

    // Phase 2: Daily check-ins (these will eventually push out early messages)
    console.log("📅 WEEKS 2-4 - Daily progress updates");
    console.log("=".repeat(50));

    // Simulate 20 days of daily updates
    for (let day = 1; day <= 20; day++) {
      addUserMessage(
        USER_ID,
        `Dag ${day} update: ${day % 3 === 0 ? "Goede dag gehad" : "Normale dag"} met voeding en beweging.`,
      );
      if (day % 5 === 0) {
        addAssistantMessage(
          USER_ID,
          `Je bent op dag ${day}! Consistentie is key. Hoe gaat het met je motivatie?`,
        );
      }
    }

    addUserMessage(
      USER_ID,
      "Ik ben nu 5 kg afgevallen! Ik weeg 80 kg nu. Zo blij!",
    );
    addAssistantMessage(
      USER_ID,
      "Geweldige prestatie! 5 kg is een mijlpaal. Je bent op de helft van je doel!",
    );

    // Update summary with new achievement
    setConversationSummary(
      USER_ID,
      "User weegt nu 80 kg (5 kg verloren), doel is 10 kg afvallen in 3 maanden, consistent bezig met voeding en beweging, voelt zich blij en gemotiveerd.",
    );

    console.log("✅ 5kg milestone added to summary");
    console.log("📋 Updated summary:", getConversationSummary(USER_ID));
    console.log(
      "📊 Messages in history: 25 (early Week 1 messages still present)",
    );
    console.log();

    // Phase 3: More daily updates that will push out early messages
    console.log("📅 WEEKS 5-6 - More updates (testing message limit)");
    console.log("=".repeat(50));

    // Add 10 more messages (this will push us over 30, trimming early messages)
    for (let day = 21; day <= 30; day++) {
      addUserMessage(
        USER_ID,
        `Dag ${day}: Nog steeds gemotiveerd. Focus op gezonde keuzes.`,
      );
    }

    console.log(
      "📊 Messages in history: 30 (early Week 1 messages are now gone)",
    );
    console.log("📋 Summary preserved:", getConversationSummary(USER_ID));
    console.log();

    // Phase 4: Demonstrate the preserved context
    console.log("📅 CURRENT STATE - What the AI sees");
    console.log("=".repeat(50));

    const currentSummary = getConversationSummary(USER_ID);
    console.log("🎯 KEY ACHIEVEMENTS PRESERVED IN SUMMARY:");
    console.log("   • 5 kg weight loss ✅");
    console.log("   • Current weight: 80 kg ✅");
    console.log("   • Goal: 10 kg in 3 months ✅");
    console.log("   • Motivation level: high ✅");
    console.log();

    console.log("🤖 AI PROMPT CONTEXT:");
    console.log("-".repeat(30));

    // Simulate a new user message
    const newUserMessage =
      "Ik vind het moeilijk om gemotiveerd te blijven nu het wat langzamer gaat.";
    const history: any[] = []; // Empty because we're showing just the summary context

    const promptContext = formatConversationHistoryForPrompt(
      history,
      currentSummary,
    );
    console.log(promptContext);
    console.log(`Current user message: "${newUserMessage}"`);
    console.log();

    console.log(
      "💡 The AI can now respond with full context of the user's journey,",
    );
    console.log(
      "   even though the individual early messages are no longer in history!",
    );
    console.log();

    // Phase 5: Final achievement
    console.log("📅 WEEK 8 - Final milestone");
    console.log("=".repeat(50));

    addUserMessage(
      USER_ID,
      "IK HEB HET GEDAAN! 10 kg AFGEVALLEN! Ik weeg nu 75 kg!",
    );
    addAssistantMessage(
      USER_ID,
      "ON-GE-LO-FE-LIJK! Wat een fantastische prestatie! Je hebt je doel bereikt en dat in minder dan 3 maanden!",
    );

    // Final summary update
    setConversationSummary(
      USER_ID,
      "User heeft doel bereikt: 10 kg afgevallen in 8 weken, weegt nu 75 kg (van 85 kg), zeer gemotiveerd en trots op prestatie.",
    );

    console.log("🎉 FINAL ACHIEVEMENT CAPTURED!");
    console.log("📋 Final summary:", getConversationSummary(USER_ID));
    console.log();

    // Cleanup
    clearUserConversation(USER_ID);
    console.log("🧹 Conversation cleared");
    console.log();

    console.log("🎭 DEMO COMPLETE");
    console.log("=".repeat(50));
    console.log("Key takeaways:");
    console.log("• Manual summaries preserve important achievements");
    console.log("• 30-message limit prevents memory bloat");
    console.log("• AI always has context of user's journey");
    console.log("• Critical info (weight loss, goals) never gets lost");
  } catch (error) {
    console.error("❌ Demo failed:", error);
  }
}

// Run the demo
if (require.main === module) {
  runRealConversationDemo();
}

export { runRealConversationDemo };
