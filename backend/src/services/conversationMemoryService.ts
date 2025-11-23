import fs from "fs";
import path from "path";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ConversationMemory {
  [userId: number]: ConversationMessage[];
}

const MEMORY_FILE_NAME = "conversation-memory.json";
const MAX_MESSAGES_PER_USER = 30;

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
    fs.writeFileSync(memoryFilePath, JSON.stringify(initialMemory, null, 2), "utf-8");
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
function addMessage(userId: number, role: "user" | "assistant", content: string): void {
  const memory = loadConversationMemory();

  if (!memory[userId]) {
    memory[userId] = [];
  }

  const message: ConversationMessage = {
    role,
    content,
    timestamp: new Date().toISOString()
  };

  // Add new message
  memory[userId].push(message);

  // Keep only last MAX_MESSAGES_PER_USER messages
  if (memory[userId].length > MAX_MESSAGES_PER_USER) {
    memory[userId] = memory[userId].slice(-MAX_MESSAGES_PER_USER);
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
export function getUserConversationHistory(userId: number): ConversationMessage[] {
  try {
    const memory = loadConversationMemory();
    return memory[userId] || [];
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
export function formatConversationHistoryForPrompt(history: ConversationMessage[]): string {
  if (history.length === 0) {
    return "";
  }

  const formattedMessages = history.map(message =>
    `${message.role === 'user' ? 'User' : 'Coach'}: ${message.content}`
  );

  return "Previous conversation:\n" + formattedMessages.join('\n') + '\n\n';
}

/**
 * Get conversation summary (basic implementation - can be enhanced with AI)
 */
export function getConversationSummary(userId: number): string {
  const history = getUserConversationHistory(userId);

  if (history.length === 0) {
    return "No previous conversation.";
  }

  const userMessages = history.filter(msg => msg.role === "user");
  const recentTopics = userMessages.slice(-5).map(msg => msg.content);

  return `User has been discussing: ${recentTopics.join(', ')}`;
}
