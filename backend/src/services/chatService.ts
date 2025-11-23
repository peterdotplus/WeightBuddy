import { generateMessage } from "./deepseekService";
import {
  addUserMessage,
  addAssistantMessage,
  getUserConversationHistory,
  formatConversationHistoryForPrompt,
} from "./conversationMemoryService";

const CHAT_PROMPT_BASE = "You are a supportive weight loss coach.\n\n";
const CHAT_PROMPT_MIDDLE = 'Current user message: "';
const CHAT_PROMPT_SUFFIX =
  '"\n\nPlease respond helpfully and supportively to their message, considering any previous conversation.\nKeep your response under 600 characters and write in Dutch without using a greeting.';

/**
 * Determines if a message is a slash command
 * @param message The message to check
 * @returns true if the message starts with '/', false otherwise
 */
export function isSlashCommand(message: string): boolean {
  return message.startsWith("/");
}

/**
 * Handles a chat message from a user
 * @param message The user's message
 * @returns AI-generated response for regular messages, null for slash commands
 * @throws Error if AI service fails
 */
export async function handleChatMessage(
  userId: number,
  message: string,
): Promise<string | null> {
  const trimmedMessage = message.trim();

  // Return null for slash commands and empty messages
  if (isSlashCommand(trimmedMessage) || trimmedMessage.length === 0) {
    return null;
  }

  // Add user message to conversation history
  addUserMessage(userId, trimmedMessage);

  // Get conversation history and format for prompt
  const conversationHistory = getUserConversationHistory(userId);
  const historyText = formatConversationHistoryForPrompt(conversationHistory);

  // Create a prompt for the AI that includes conversation history and user's message
  const prompt = `${CHAT_PROMPT_BASE}${historyText}${CHAT_PROMPT_MIDDLE}${trimmedMessage}${CHAT_PROMPT_SUFFIX}`;

  // Generate AI response
  const aiResponse = await generateMessage(prompt);

  // Add assistant response to conversation history
  addAssistantMessage(userId, aiResponse);

  return aiResponse;
}
