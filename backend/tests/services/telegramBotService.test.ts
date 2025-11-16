// Mock Telegraf first
jest.mock("telegraf", () => {
  const mockBot = {
    command: jest.fn(),
    action: jest.fn(),
    catch: jest.fn(),
    launch: jest.fn(),
    stop: jest.fn(),
    telegram: {
      setWebhook: jest.fn(),
      getWebhookInfo: jest.fn(),
      deleteWebhook: jest.fn(),
    },
  };
  return {
    Telegraf: jest.fn(() => mockBot),
  };
});

import {
  initializeTelegramBot,
  stopTelegramBot,
} from "../../src/services/telegramBotService";

const { telegramBot } = require("../../src/services/telegramBotService");

describe("Telegram Bot Service", () => {
  const originalEnv = process.env;
  let mockBot: any;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    // Get the mock bot instance
    mockBot = telegramBot as any;
    // Reset the mock bot instance
    mockBot.command.mockClear();
    mockBot.action.mockClear();
    mockBot.catch.mockClear();
    mockBot.launch.mockClear();
    mockBot.stop.mockClear();
    mockBot.telegram.setWebhook.mockClear();
    mockBot.telegram.getWebhookInfo.mockClear();
    mockBot.telegram.deleteWebhook.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("initializeTelegramBot", () => {
    it("should initialize bot successfully in development mode", async () => {
      process.env.NODE_ENV = "development";

      await initializeTelegramBot();

      expect(mockBot.launch).toHaveBeenCalled();
    });

    it("should initialize bot successfully in production mode", async () => {
      process.env.NODE_ENV = "production";

      await initializeTelegramBot();

      expect(mockBot.launch).not.toHaveBeenCalled();
    });

    it("should handle initialization errors", async () => {
      process.env.NODE_ENV = "development";
      mockBot.launch.mockRejectedValue(new Error("Bot launch failed"));

      await expect(initializeTelegramBot()).rejects.toThrow(
        "Bot launch failed",
      );
    });
  });

  describe("stopTelegramBot", () => {
    it("should stop bot successfully", async () => {
      await stopTelegramBot();

      expect(mockBot.stop).toHaveBeenCalled();
    });
  });

  describe("Bot command handlers", () => {
    it("should register /test command", () => {
      expect(mockBot.command).toHaveBeenCalledWith(
        "test",
        expect.any(Function),
      );
    });

    it("should register button action handlers", () => {
      expect(mockBot.action).toHaveBeenCalledWith(
        "toggle_three_state",
        expect.any(Function),
      );
      expect(mockBot.action).toHaveBeenCalledWith(
        "toggle_two_state",
        expect.any(Function),
      );
      expect(mockBot.action).toHaveBeenCalledWith(
        "show_toast",
        expect.any(Function),
      );
    });

    it("should register error handler", () => {
      expect(mockBot.catch).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
