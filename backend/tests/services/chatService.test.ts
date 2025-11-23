import {
  handleChatMessage,
  isSlashCommand,
} from "../../src/services/chatService";
import { generateMessage } from "../../src/services/deepseekService";

// Mock the deepseek service
jest.mock("../../src/services/deepseekService", () => ({
  generateMessage: jest.fn(),
}));

describe("Chat Service", () => {
  const mockGenerateMessage = generateMessage as jest.MockedFunction<
    typeof generateMessage
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("isSlashCommand", () => {
    it("should return true for messages starting with /", () => {
      expect(isSlashCommand("/start")).toBe(true);
      expect(isSlashCommand("/test")).toBe(true);
      expect(isSlashCommand("/help")).toBe(true);
    });

    it("should return false for messages not starting with /", () => {
      expect(isSlashCommand("hello")).toBe(false);
      expect(isSlashCommand("how are you")).toBe(false);
      expect(isSlashCommand("")).toBe(false);
      expect(isSlashCommand(" /test")).toBe(false); // space before slash
    });

    it("should handle edge cases", () => {
      expect(isSlashCommand("/")).toBe(true);
      expect(isSlashCommand("//")).toBe(true);
      expect(isSlashCommand("/ ")).toBe(true);
    });
  });

  describe("handleChatMessage", () => {
    it("should return null for slash commands", async () => {
      const result = await handleChatMessage("/start");
      expect(result).toBeNull();
      expect(mockGenerateMessage).not.toHaveBeenCalled();
    });

    it("should call AI service for regular chat messages", async () => {
      const mockResponse =
        "Dit is een AI antwoord op je vraag over gewichtsverlies.";
      mockGenerateMessage.mockResolvedValue(mockResponse);

      const result = await handleChatMessage("Hoe kan ik gemotiveerd blijven?");

      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.stringContaining("Hoe kan ik gemotiveerd blijven?"),
      );
      expect(result).toBe(mockResponse);
    });

    it("should format the prompt correctly for AI service", async () => {
      const mockResponse = "AI antwoord";
      mockGenerateMessage.mockResolvedValue(mockResponse);

      const userMessage = "Ik heb moeite met consistent blijven";
      await handleChatMessage(userMessage);

      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.stringContaining("You are a supportive weight loss coach"),
      );
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

    it("should handle empty messages", async () => {
      const result = await handleChatMessage("");
      expect(result).toBeNull();
      expect(mockGenerateMessage).not.toHaveBeenCalled();
    });

    it("should handle whitespace-only messages", async () => {
      const result = await handleChatMessage("   ");
      expect(result).toBeNull();
      expect(mockGenerateMessage).not.toHaveBeenCalled();
    });

    it("should propagate errors from AI service", async () => {
      const errorMessage = "AI service unavailable";
      mockGenerateMessage.mockRejectedValue(new Error(errorMessage));

      await expect(handleChatMessage("Hallo")).rejects.toThrow(errorMessage);
    });

    it("should ensure response length constraints are passed to AI", async () => {
      const mockResponse = "Kort antwoord";
      mockGenerateMessage.mockResolvedValue(mockResponse);

      await handleChatMessage("Test bericht");

      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.stringContaining("Keep your response under 600 characters"),
      );
    });

    it("should ensure Dutch language requirement is passed to AI", async () => {
      const mockResponse = "Nederlands antwoord";
      mockGenerateMessage.mockResolvedValue(mockResponse);

      await handleChatMessage("Test bericht");

      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.stringContaining("write in Dutch"),
      );
    });
  });
});
