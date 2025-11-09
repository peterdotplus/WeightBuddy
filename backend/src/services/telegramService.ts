import axios from "axios";
import { config } from "../config/config";

export async function sendTelegramMessage(message: string): Promise<void> {
  const botToken = config.telegram.botToken;
  const chatId = config.telegram.chatId;

  if (!botToken) {
    throw new Error("Telegram bot token is not configured");
  }

  if (!chatId) {
    throw new Error("Telegram chat ID is not configured");
  }

  // Telegram has a message length limit of 4096 characters
  const truncatedMessage =
    message.length > 4096 ? message.substring(0, 4093) + "..." : message;

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: truncatedMessage,
        parse_mode: "HTML",
      },
    );

    if (!response.data.ok) {
      throw new Error(
        response.data.description || "Unknown Telegram API error",
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to send Telegram message: ${error.message}`);
    }
    throw new Error("Failed to send Telegram message: Unknown error");
  }
}
