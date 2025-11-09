import { sendDailyInspiration } from "../../src/services/inspirationService";
import {
  selectRandomCategory,
  getCategoryPrompt,
} from "../../src/services/categoryService";
import { generateInspirationMessage } from "../../src/services/deepseekService";
import { sendTelegramMessage } from "../../src/services/telegramService";

// Mock dependencies
jest.mock("../../src/services/categoryService");
jest.mock("../../src/services/deepseekService");
jest.mock("../../src/services/telegramService");

const mockedSelectRandomCategory = selectRandomCategory as jest.MockedFunction<
  typeof selectRandomCategory
>;
const mockedGetCategoryPrompt = getCategoryPrompt as jest.MockedFunction<
  typeof getCategoryPrompt
>;
const mockedGenerateInspirationMessage =
  generateInspirationMessage as jest.MockedFunction<
    typeof generateInspirationMessage
  >;
const mockedSendTelegramMessage = sendTelegramMessage as jest.MockedFunction<
  typeof sendTelegramMessage
>;

describe("Inspiration Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendDailyInspiration", () => {
    it("should send a motivation message when motivation category is selected", async () => {
      // Setup mocks
      mockedSelectRandomCategory.mockReturnValue("Motivation");
      mockedGetCategoryPrompt.mockReturnValue(
        "Geef een korte, inspirerende motivatieboodschap voor iemand die bezig is met afvallen. Houd het onder 160 tekens en schrijf in het Nederlands.",
      );
      mockedGenerateInspirationMessage.mockResolvedValue(
        "You are doing great! Keep going!",
      );
      mockedSendTelegramMessage.mockResolvedValue();

      await sendDailyInspiration();

      // Verify category selection
      expect(mockedSelectRandomCategory).toHaveBeenCalledTimes(1);

      // Verify prompt generation
      expect(mockedGetCategoryPrompt).toHaveBeenCalledWith("Motivation");

      // Verify AI message generation
      expect(mockedGenerateInspirationMessage).toHaveBeenCalledWith(
        "Geef een korte, inspirerende motivatieboodschap voor iemand die bezig is met afvallen. Houd het onder 160 tekens en schrijf in het Nederlands.",
      );

      // Verify Telegram message sending
      expect(mockedSendTelegramMessage).toHaveBeenCalledWith(
        "You are doing great! Keep going!",
      );
    });

    it("should send a check-in message when check-in category is selected", async () => {
      // Setup mocks
      mockedSelectRandomCategory.mockReturnValue("Check-in");
      mockedGetCategoryPrompt.mockReturnValue(
        "Stel een korte, aanmoedigende check-in vraag over de voortgang van het afvallen. Houd het onder 160 tekens en schrijf in het Nederlands.",
      );
      mockedGenerateInspirationMessage.mockResolvedValue(
        "How has your progress been this week?",
      );
      mockedSendTelegramMessage.mockResolvedValue();

      await sendDailyInspiration();

      // Verify category selection
      expect(mockedSelectRandomCategory).toHaveBeenCalledTimes(1);

      // Verify prompt generation
      expect(mockedGetCategoryPrompt).toHaveBeenCalledWith("Check-in");

      // Verify AI message generation
      expect(mockedGenerateInspirationMessage).toHaveBeenCalledWith(
        "Stel een korte, aanmoedigende check-in vraag over de voortgang van het afvallen. Houd het onder 160 tekens en schrijf in het Nederlands.",
      );

      // Verify Telegram message sending
      expect(mockedSendTelegramMessage).toHaveBeenCalledWith(
        "How has your progress been this week?",
      );
    });

    it("should handle errors from AI service gracefully", async () => {
      // Setup mocks
      mockedSelectRandomCategory.mockReturnValue("Motivation");
      mockedGetCategoryPrompt.mockReturnValue("Provide a motivational message");
      mockedGenerateInspirationMessage.mockRejectedValue(
        new Error("AI Service Error"),
      );

      await expect(sendDailyInspiration()).rejects.toThrow(
        "Failed to send daily inspiration: AI Service Error",
      );

      // Verify Telegram was not called
      expect(mockedSendTelegramMessage).not.toHaveBeenCalled();
    });

    it("should handle errors from Telegram service gracefully", async () => {
      // Setup mocks
      mockedSelectRandomCategory.mockReturnValue("Motivation");
      mockedGetCategoryPrompt.mockReturnValue("Provide a motivational message");
      mockedGenerateInspirationMessage.mockResolvedValue(
        "You are doing great!",
      );
      mockedSendTelegramMessage.mockRejectedValue(
        new Error("Telegram API Error"),
      );

      await expect(sendDailyInspiration()).rejects.toThrow(
        "Failed to send daily inspiration: Telegram API Error",
      );
    });

    it("should ensure the final message is reasonably short", async () => {
      // Setup mocks
      mockedSelectRandomCategory.mockReturnValue("Motivation");
      mockedGetCategoryPrompt.mockReturnValue("Short prompt");

      // Mock a very long AI response
      const longMessage = "A".repeat(5000);
      mockedGenerateInspirationMessage.mockResolvedValue(longMessage);
      mockedSendTelegramMessage.mockResolvedValue();

      await sendDailyInspiration();

      // Verify that the long message was sent to Telegram (truncation happens in Telegram service)
      expect(mockedSendTelegramMessage).toHaveBeenCalledWith(longMessage);
    });

    it("should return the sent message for logging purposes", async () => {
      // Setup mocks
      mockedSelectRandomCategory.mockReturnValue("Check-in");
      mockedGetCategoryPrompt.mockReturnValue("Ask a check-in question");
      mockedGenerateInspirationMessage.mockResolvedValue(
        "How are you feeling today?",
      );
      mockedSendTelegramMessage.mockResolvedValue();

      const result = await sendDailyInspiration();

      expect(result).toEqual({
        category: "Check-in",
        message: "How are you feeling today?",
      });
    });
  });
});
