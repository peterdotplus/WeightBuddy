import fs from "fs";
import path from "path";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface UserConversation {
  messages: ConversationMessage[];
  summary: string;
  lastSummaryUpdate: string;
}

export interface ConversationMemory {
  [userId: number]: UserConversation;
}

const MEMORY_FILE_NAME = "conversation-memory.json";
const MAX_MESSAGES_PER_USER = 30;
const SUMMARY_UPDATE_THRESHOLD = 10; // Update summary every 10 messages

/**
 * Get the path to the conversation memory file
 */
function getMemoryFilePath(): string {
  return path.join(__dirname, "..", "..", "data", MEMORY_FILE_NAME);
}

/**
 * Ensure the data directory exists
 */
function ensureDataDirectory(): void {
  const dataDir = path.dirname(getMemoryFilePath());
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * Initialize conversation memory file if it doesn't exist
 */
export function initializeConversationMemory(): void {
  ensureDataDirectory();

  const memoryFilePath = getMemoryFilePath();

  if (!fs.existsSync(memoryFilePath)) {
    const initialMemory: ConversationMemory = {};
    fs.writeFileSync(
      memoryFilePath,
      JSON.stringify(initialMemory, null, 2),
      "utf-8",
    );
    console.log("✅ Conversation memory file initialized");
  }
}

/**
 * Load conversation memory from file
 */
function loadConversationMemory(): ConversationMemory {
  try {
    const memoryFilePath = getMemoryFilePath();

    if (!fs.existsSync(memoryFilePath)) {
      return {};
    }

    const fileContent = fs.readFileSync(memoryFilePath, "utf-8");
    return JSON.parse(fileContent) as ConversationMemory;
  } catch (error) {
    console.error("❌ Failed to load conversation memory:", error);
    return {};
  }
}

/**
 * Save conversation memory to file
 */
function saveConversationMemory(memory: ConversationMemory): void {
  try {
    ensureDataDirectory();
    const memoryFilePath = getMemoryFilePath();
    fs.writeFileSync(memoryFilePath, JSON.stringify(memory, null, 2), "utf-8");
  } catch (error) {
    console.error("❌ Failed to save conversation memory:", error);
  }
}

/**
 * Add a message to user's conversation history
 */
function addMessage(
  userId: number,
  role: "user" | "assistant",
  content: string,
): void {
  const memory = loadConversationMemory();

  if (!memory[userId]) {
    memory[userId] = {
      messages: [],
      summary: "No conversation history yet.",
      lastSummaryUpdate: new Date().toISOString(),
    };
  }

  // Ensure messages array exists
  if (!memory[userId].messages) {
    memory[userId].messages = [];
  }

  const message: ConversationMessage = {
    role,
    content,
    timestamp: new Date().toISOString(),
  };

  // Add new message
  memory[userId].messages.push(message);

  // Keep only last MAX_MESSAGES_PER_USER messages
  if (memory[userId].messages.length > MAX_MESSAGES_PER_USER) {
    memory[userId].messages = memory[userId].messages.slice(
      -MAX_MESSAGES_PER_USER,
    );
  }

  // Check if we should update the summary (only if it's the default summary)
  const shouldUpdateSummary = shouldUpdateConversationSummary(memory[userId]);
  if (
    shouldUpdateSummary &&
    memory[userId].summary === "No conversation history yet."
  ) {
    updateConversationSummary(memory[userId]);
  }

  saveConversationMemory(memory);
}

/**
 * Add a user message to conversation history
 */
export function addUserMessage(userId: number, content: string): void {
  addMessage(userId, "user", content);
}

/**
 * Add an assistant message to conversation history
 */
export function addAssistantMessage(userId: number, content: string): void {
  addMessage(userId, "assistant", content);
}

/**
 * Get user's conversation history
 */
export function getUserConversationHistory(
  userId: number,
): ConversationMessage[] {
  try {
    const memory = loadConversationMemory();
    return memory[userId]?.messages || [];
  } catch (error) {
    console.error("❌ Failed to get user conversation history:", error);
    return [];
  }
}

/**
 * Clear user's conversation history
 */
export function clearUserConversation(userId: number): void {
  const memory = loadConversationMemory();

  if (memory[userId]) {
    delete memory[userId];
    saveConversationMemory(memory);
    console.log(`🗑️  Cleared conversation history for user ${userId}`);
  }
}

/**
 * Format conversation history for use in prompts
 */
export function formatConversationHistoryForPrompt(
  history: ConversationMessage[],
  summary?: string,
): string {
  let promptText = "";

  // Add summary first if available
  if (summary && summary !== "No conversation history yet.") {
    promptText += `Conversation Summary: ${summary}\n\n`;
  }

  // Add recent conversation history
  if (history.length > 0) {
    const formattedMessages = history.map(
      (message) =>
        `${message.role === "user" ? "User" : "Coach"}: ${message.content}`,
    );
    promptText +=
      "Recent conversation:\n" + formattedMessages.join("\n") + "\n\n";
  }

  return promptText;
}

/**
 * Get conversation summary (basic implementation - can be enhanced with AI)
 */
export function getConversationSummary(userId: number): string {
  try {
    const memory = loadConversationMemory();
    return memory[userId]?.summary || "No conversation history yet.";
  } catch (error) {
    console.error("❌ Failed to get conversation summary:", error);
    return "No conversation history yet.";
  }
}

export function updateConversationSummary(
  userConversation: UserConversation,
): void {
  // This is a basic implementation - in production, you might want to use AI to generate better summaries
  // Ensure messages array exists
  if (!userConversation.messages) {
    userConversation.messages = [];
  }

  const userMessages = userConversation.messages.filter(
    (msg) => msg.role === "user",
  );

  if (userMessages.length === 0) {
    userConversation.summary = "No conversation history yet.";
    return;
  }

  // Extract key achievements and important information from user messages
  const recentMessages = userMessages.slice(-10); // Look at last 10 user messages
  const keyPhrases = extractKeyInformation(
    recentMessages.map((msg) => msg.content),
  );

  if (keyPhrases.length > 0) {
    userConversation.summary = `Key information: ${keyPhrases.join(", ")}`;
  } else {
    // Fallback to basic summary
    const topics = recentMessages
      .slice(-3)
      .map(
        (msg) =>
          msg.content.substring(0, 50) + (msg.content.length > 50 ? "..." : ""),
      );
    userConversation.summary = `Recent topics: ${topics.join(", ")}`;
  }

  userConversation.lastSummaryUpdate = new Date().toISOString();
}

export function setConversationSummary(userId: number, summary: string): void {
  const memory = loadConversationMemory();

  if (!memory[userId]) {
    memory[userId] = {
      messages: [],
      summary: summary,
      lastSummaryUpdate: new Date().toISOString(),
    };
  } else {
    memory[userId].summary = summary;
    memory[userId].lastSummaryUpdate = new Date().toISOString();
  }

  saveConversationMemory(memory);
}

function shouldUpdateConversationSummary(
  userConversation: UserConversation,
): boolean {
  // Ensure messages array exists
  if (!userConversation.messages || userConversation.messages.length === 0)
    return false;

  const lastUpdate = new Date(userConversation.lastSummaryUpdate);
  const now = new Date();
  const hoursSinceUpdate =
    (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

  // Update summary if:
  // 1. It's been more than 24 hours since last update, OR
  // 2. We have 10+ new messages since last update
  return (
    hoursSinceUpdate >= 24 ||
    userConversation.messages.length % SUMMARY_UPDATE_THRESHOLD === 0
  );
}

function extractKeyInformation(messages: string[]): string[] {
  const keyPhrases: string[] = [];
  const weightPatterns = [
    /(\d+)\s*kg\s*(?:afgevallen|verloren|gewicht)/i,
    /(?:gewicht|gewichtsdaling)\s*van\s*(\d+)\s*kg/i,
    /(\d+)\s*kg\s*(?:minder|gewicht)/i,
  ];

  const achievementPatterns = [
    /(?:succes|bereikt|gehaald|gelukt)\s*(?:met|om)\s*([^.!?]+)/i,
    /(?:doel|target)\s*(?:van|is)\s*([^.!?]+)/i,
    /(?:proud|trots|blij)\s*(?:met|over)\s*([^.!?]+)/i,
  ];

  messages.forEach((message) => {
    // Look for weight loss achievements
    weightPatterns.forEach((pattern) => {
      const match = message.match(pattern);
      if (match) {
        keyPhrases.push(`Lost ${match[1]} kg`);
      }
    });

    // Look for other achievements
    achievementPatterns.forEach((pattern) => {
      const match = message.match(pattern);
      if (match && match[1] && match[1].length > 10 && match[1].length < 100) {
        keyPhrases.push(match[1].trim());
      }
    });

    // Look for specific mentions of goals or challenges
    if (
      message.toLowerCase().includes("doel") ||
      message.toLowerCase().includes("challenge")
    ) {
      const goalMatch = message.match(
        /(?:doel|challenge)\s*(?:is|van)\s*([^.!?]+)/i,
      );
      if (goalMatch) {
        keyPhrases.push(`Goal: ${goalMatch[1]!.trim()}`);
      }
    }
  });

  // Remove duplicates and limit to 5 key phrases
  return [...new Set(keyPhrases)].slice(0, 5);
}
