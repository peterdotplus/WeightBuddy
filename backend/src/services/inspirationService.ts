import {
  selectRandomCategory,
  getCategoryPrompt,
  Category,
} from "./categoryService";
import { generateMessage } from "./deepseekService";
import { sendTelegramMessage } from "./telegramService";

export interface InspirationResult {
  category: Category;
  message: string;
}

export async function sendDailyInspiration(): Promise<InspirationResult> {
  try {
    // Step 1: Select random category
    const category = selectRandomCategory();

    // Step 2: Get appropriate prompt for the category
    const prompt = getCategoryPrompt(category);

    // Step 3: Generate inspiration message using AI
    const message = await generateMessage(prompt);

    // Step 4: Send message to Telegram
    await sendTelegramMessage(message);

    // Return result for logging/monitoring
    return {
      category,
      message,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to send daily inspiration: ${error.message}`);
    }
    throw new Error("Failed to send daily inspiration: Unknown error");
  }
}
