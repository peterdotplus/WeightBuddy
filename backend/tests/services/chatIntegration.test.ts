import { handleChatMessage } from "../../src/services/chatService";
import { generateMessage } from "../../src/services/deepseekService";

// Mock the deepseek service
jest.mock("../../src/services/deepseekService", () => ({
  generateMessage: jest.fn(),
}));

describe("Chat Integration", () => {
  const mockGenerateMessage = generateMessage as jest.MockedFunction<
    typeof generateMessage
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Chat message handling", () => {
    it("should handle regular chat messages with AI responses", async () => {
      const userMessage = "Hoe kan ik gemotiveerd blijven met gewichtsverlies?";
      const aiResponse =
        "Het is belangrijk om kleine doelen te stellen en je successen te vieren. Elke dag dat je gezonde keuzes maakt, brengt je dichter bij je doel. Blijf volhouden!";

      mockGenerateMessage.mockResolvedValue(aiResponse);

      const result = await handleChatMessage(123456789, userMessage);

      expect(result).toBe(aiResponse);
      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.stringContaining(userMessage),
      );
      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.stringContaining("Keep your response under 600 characters"),
      );
      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.stringContaining("write in Dutch"),
      );
    });

    it("should ignore slash commands", async () => {
      const result = await handleChatMessage(123456789, "/start");

      expect(result).toBeNull();
      expect(mockGenerateMessage).not.toHaveBeenCalled();
    });

    it("should handle empty messages", async () => {
      const result = await handleChatMessage(123456789, "");

      expect(result).toBeNull();
      expect(mockGenerateMessage).not.toHaveBeenCalled();
    });

    it("should handle AI service errors gracefully", async () => {
      const errorMessage = "AI service unavailable";
      mockGenerateMessage.mockRejectedValue(new Error(errorMessage));

      await expect(handleChatMessage(123456789, "Hallo")).rejects.toThrow(
        errorMessage,
      );
    });

    it("should maintain consistent prompt structure", async () => {
      const userMessage = "Ik heb moeite met consistent blijven";
      mockGenerateMessage.mockResolvedValue("Test response");

      await handleChatMessage(123456789, userMessage);

      const calledPrompt = mockGenerateMessage.mock.calls[0]![0];

      expect(calledPrompt).toContain("You are a supportive weight loss coach");
      expect(calledPrompt).toContain(userMessage);
      expect(calledPrompt).toContain("Keep your response under 600 characters");
      expect(calledPrompt).toContain("write in Dutch");
      expect(calledPrompt).toContain("without using a greeting");
    });

    it("should handle various message types correctly", async () => {
      const testCases = [
        { message: "/help", shouldCallAI: false },
        { message: "/test", shouldCallAI: false },
        { message: "Hoe gaat het?", shouldCallAI: true },
        { message: "Ik wil afvallen", shouldCallAI: true },
        { message: "   ", shouldCallAI: false },
        { message: "", shouldCallAI: false },
      ];

      mockGenerateMessage.mockResolvedValue("AI response");

      for (const testCase of testCases) {
        await handleChatMessage(123456789, testCase.message);

        if (testCase.shouldCallAI) {
          expect(mockGenerateMessage).toHaveBeenCalled();
        } else {
          expect(mockGenerateMessage).not.toHaveBeenCalled();
        }

        jest.clearAllMocks();
      }
    });
  });
});
