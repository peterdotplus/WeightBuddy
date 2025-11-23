import { handleChatMessage, isSlashCommand } from "../src/services/chatService";
import { generateMessage } from "../src/services/deepseekService";

// Mock the deepseek service
jest.mock("../src/services/deepseekService", () => ({
  generateMessage: jest.fn(),
}));

const mockGenerateMessage = generateMessage as jest.MockedFunction<
  typeof generateMessage
>;

describe("Chat End-to-End", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Complete Chat Flow", () => {
    it("should handle complete chat flow from user message to AI response", async () => {
      const userMessage = "Hoe kan ik gemotiveerd blijven met gewichtsverlies?";
      const aiResponse =
        "Het is belangrijk om kleine doelen te stellen en je successen te vieren. Elke dag dat je gezonde keuzes maakt, brengt je dichter bij je doel. Blijf volhouden!";

      mockGenerateMessage.mockResolvedValue(aiResponse);

      // Test slash command detection
      expect(isSlashCommand("/start")).toBe(true);
      expect(isSlashCommand(userMessage)).toBe(false);

      // Test chat message handling
      const result = await handleChatMessage(userMessage);

      expect(result).toBe(aiResponse);
      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.stringContaining(userMessage),
      );
      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.stringContaining("Keep your response under 1000 characters"),
      );
      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.stringContaining("write in Dutch"),
      );
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
        const result = await handleChatMessage(testCase.message);

        if (testCase.shouldCallAI) {
          expect(mockGenerateMessage).toHaveBeenCalled();
          expect(result).toBe("AI response");
        } else {
          expect(mockGenerateMessage).not.toHaveBeenCalled();
          expect(result).toBeNull();
        }

        jest.clearAllMocks();
      }
    });

    it("should maintain consistent prompt structure across all chat messages", async () => {
      const userMessages = [
        "Ik heb moeite met consistent blijven",
        "Wat zijn goede oefeningen?",
        "Hoeveel calorieën moet ik eten?",
      ];

      mockGenerateMessage.mockResolvedValue("Test response");

      for (const userMessage of userMessages) {
        await handleChatMessage(userMessage);

        const calledPrompt = mockGenerateMessage.mock.calls[0]![0];

        expect(calledPrompt).toContain(
          "You are a supportive weight loss coach",
        );
        expect(calledPrompt).toContain(userMessage);
        expect(calledPrompt).toContain(
          "Keep your response under 1000 characters",
        );
        expect(calledPrompt).toContain("write in Dutch");
        expect(calledPrompt).toContain("without using a greeting");

        jest.clearAllMocks();
      }
    });

    it("should handle AI service failures gracefully", async () => {
      const errorMessage = "AI service unavailable";
      mockGenerateMessage.mockRejectedValue(new Error(errorMessage));

      await expect(handleChatMessage("Hallo")).rejects.toThrow(errorMessage);
    });
  });
});
