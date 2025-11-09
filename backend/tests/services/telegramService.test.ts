import { sendTelegramMessage } from "../../src/services/telegramService";

// Mock axios
jest.mock("axios", () => ({
  post: jest.fn(),
}));

const axios = require("axios");

describe("Telegram Service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.TELEGRAM_BOT_TOKEN = "test-bot-token";
    process.env.TELEGRAM_CHAT_ID = "123456789";
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe("sendTelegramMessage", () => {
    it("should send message to Telegram with correct parameters", async () => {
      // Mock successful API response
      const mockResponse = {
        data: {
          ok: true,
          result: {
            message_id: 123,
            text: "Test message",
          },
        },
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const message = "Test inspiration message";
      await sendTelegramMessage(message);

      expect(axios.post).toHaveBeenCalledWith(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        },
      );
    });

    it("should throw an error if bot token is not configured", async () => {
      delete process.env.TELEGRAM_BOT_TOKEN;

      await expect(sendTelegramMessage("test message")).rejects.toThrow(
        "Telegram bot token is not configured",
      );
    });

    it("should throw an error if chat ID is not configured", async () => {
      delete process.env.TELEGRAM_CHAT_ID;

      await expect(sendTelegramMessage("test message")).rejects.toThrow(
        "Telegram chat ID is not configured",
      );
    });

    it("should throw an error if Telegram API call fails", async () => {
      (axios.post as jest.Mock).mockRejectedValue(
        new Error("Telegram API Error"),
      );

      await expect(sendTelegramMessage("test message")).rejects.toThrow(
        "Failed to send Telegram message: Telegram API Error",
      );
    });

    it("should throw an error if Telegram API returns error response", async () => {
      const mockResponse = {
        data: {
          ok: false,
          description: "Bad Request: chat not found",
        },
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(sendTelegramMessage("test message")).rejects.toThrow(
        "Failed to send Telegram message: Bad Request: chat not found",
      );
    });

    it("should handle message truncation for very long messages", async () => {
      const mockResponse = {
        data: {
          ok: true,
          result: {
            message_id: 123,
            text: "A".repeat(4096),
          },
        },
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const longMessage = "A".repeat(5000);
      await sendTelegramMessage(longMessage);

      // Should truncate to Telegram's limit (4096 characters)
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          text: expect.stringMatching(/^A{4093}\.\.\.$/),
        }),
      );
    });
  });
});
