import { generateMessage } from "./deepseekService";

const CHAT_PROMPT_BASE =
  'You are a supportive weight loss coach. A user has sent you this message: "';
const CHAT_PROMPT_SUFFIX =
  '".\nPlease respond helpfully and supportively to their message.\nKeep your response under 1000 characters and write in Dutch without using a greeting.';

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
  message: string,
): Promise<string | null> {
  const trimmedMessage = message.trim();

  // Return null for slash commands and empty messages
  if (isSlashCommand(trimmedMessage) || trimmedMessage.length === 0) {
    return null;
  }

  // Create a prompt for the AI that includes the user's message
  const prompt = `${CHAT_PROMPT_BASE}${trimmedMessage}${CHAT_PROMPT_SUFFIX}`;

  // Generate AI response
  const aiResponse = await generateMessage(prompt);

  return aiResponse;
}
