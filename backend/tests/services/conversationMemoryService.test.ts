import {
  addUserMessage,
  addAssistantMessage,
  getUserConversationHistory,
  clearUserConversation,
  initializeConversationMemory,
  getConversationSummary,
  setConversationSummary,
  formatConversationHistoryForPrompt,
} from "../../src/services/conversationMemoryService";
import fs from "fs";
import path from "path";

// Mock fs module
jest.mock("fs");
jest.mock("path");

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedPath = path as jest.Mocked<typeof path>;

describe("Conversation Memory Service", () => {
  const TEST_USER_ID = 123456789;
  const TEST_MEMORY_FILE = "/test/conversation-memory.json";

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock path.join to return test file path
    mockedPath.join.mockReturnValue(TEST_MEMORY_FILE);

    // Mock fs.existsSync to return false initially (file doesn't exist)
    mockedFs.existsSync.mockReturnValue(false);

    // Mock fs.readFileSync to return empty object
    mockedFs.readFileSync.mockReturnValue("{}");

    // Mock fs.writeFileSync
    mockedFs.writeFileSync.mockImplementation(() => {});
  });

  describe("initializeConversationMemory", () => {
    it("should create memory file if it doesn't exist", () => {
      mockedFs.existsSync.mockReturnValue(false);

      initializeConversationMemory();

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        TEST_MEMORY_FILE,
        "{}",
        "utf-8",
      );
    });

    it("should not overwrite existing memory file", () => {
      mockedFs.existsSync.mockReturnValue(true);

      initializeConversationMemory();

      expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe("addUserMessage", () => {
    it("should add user message to conversation history", () => {
      const message = "Hoe kan ik gemotiveerd blijven?";

      addUserMessage(TEST_USER_ID, message);

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        TEST_MEMORY_FILE,
        expect.stringContaining(`"${message}"`),
        "utf-8",
      );
    });

    it("should maintain only last 30 messages", () => {
      // Add 31 messages
      for (let i = 1; i <= 31; i++) {
        addUserMessage(TEST_USER_ID, `Message ${i}`);
      }

      const lastCall =
        mockedFs.writeFileSync.mock.calls[
          mockedFs.writeFileSync.mock.calls.length - 1
        ]!;
      const savedData = JSON.parse(lastCall[1] as string);
      const userMessages = savedData[TEST_USER_ID].messages;

      expect(userMessages).toHaveLength(30);
      expect(userMessages[0].content).toBe("Message 2"); // First message should be Message 2 (Message 1 was removed)
      expect(userMessages[29].content).toBe("Message 31"); // Last message should be Message 31
    });

    it("should store message with correct structure", () => {
      const message = "Test bericht";

      addUserMessage(TEST_USER_ID, message);

      const lastCall =
        mockedFs.writeFileSync.mock.calls[
          mockedFs.writeFileSync.mock.calls.length - 1
        ]!;
      const savedData = JSON.parse(lastCall[1] as string);
      const userMessage = savedData[TEST_USER_ID].messages[0];

      expect(userMessage.role).toBe("user");
      expect(userMessage.content).toBe(message);
      expect(userMessage.timestamp).toBeDefined();
      expect(new Date(userMessage.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe("addAssistantMessage", () => {
    it("should add assistant message to conversation history", () => {
      const message = "Je doet het geweldig! Blijf volhouden!";

      addAssistantMessage(TEST_USER_ID, message);

      const lastCall =
        mockedFs.writeFileSync.mock.calls[
          mockedFs.writeFileSync.mock.calls.length - 1
        ]!;
      const savedData = JSON.parse(lastCall[1] as string);
      const assistantMessage = savedData[TEST_USER_ID].messages[0];

      expect(assistantMessage.role).toBe("assistant");
      expect(assistantMessage.content).toBe(message);
    });

    it("should alternate user and assistant messages correctly", () => {
      addUserMessage(TEST_USER_ID, "User message");
      addAssistantMessage(TEST_USER_ID, "Assistant response");
      addUserMessage(TEST_USER_ID, "Another user message");

      const lastCall =
        mockedFs.writeFileSync.mock.calls[
          mockedFs.writeFileSync.mock.calls.length - 1
        ]!;
      const savedData = JSON.parse(lastCall[1] as string);
      const messages = savedData[TEST_USER_ID].messages;

      expect(messages).toHaveLength(3);
      expect(messages[0].role).toBe("user");
      expect(messages[1].role).toBe("assistant");
      expect(messages[2].role).toBe("user");
    });
  });

  describe("getUserConversationHistory", () => {
    it("should return empty array for user with no history", () => {
      mockedFs.readFileSync.mockReturnValue("{}");

      const history = getUserConversationHistory(TEST_USER_ID);

      expect(history).toEqual([]);
    });

    it("should return user conversation history", () => {
      const mockData = {
        [TEST_USER_ID]: {
          messages: [
            {
              role: "user",
              content: "Message 1",
              timestamp: new Date().toISOString(),
            },
            {
              role: "assistant",
              content: "Response 1",
              timestamp: new Date().toISOString(),
            },
          ],
          summary: "User has been discussing weight loss goals",
          lastSummaryUpdate: new Date().toISOString(),
        },
      };
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockData));

      const history = getUserConversationHistory(TEST_USER_ID);

      expect(history[0]!.role).toBe("user");
      expect(history[1]!.role).toBe("assistant");
    });

    it("should handle file read errors gracefully", () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error("File read error");
      });

      const history = getUserConversationHistory(TEST_USER_ID);

      expect(history).toEqual([]);
    });
  });

  describe("clearUserConversation", () => {
    it("should clear user conversation history", () => {
      const mockData = {
        [TEST_USER_ID]: {
          messages: [
            {
              role: "user",
              content: "Message 1",
              timestamp: new Date().toISOString(),
            },
            {
              role: "assistant",
              content: "Response 1",
              timestamp: new Date().toISOString(),
            },
          ],
          summary: "User has been discussing weight loss goals",
          lastSummaryUpdate: new Date().toISOString(),
        },
        999: {
          // Another user's data
          messages: [
            {
              role: "user",
              content: "Other message",
              timestamp: new Date().toISOString(),
            },
          ],
          summary: "Other user conversation",
          lastSummaryUpdate: new Date().toISOString(),
        },
      };
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockData));

      clearUserConversation(TEST_USER_ID);

      const lastCall =
        mockedFs.writeFileSync.mock.calls[
          mockedFs.writeFileSync.mock.calls.length - 1
        ]!;
      const savedData = JSON.parse(lastCall[1] as string);

      expect(savedData[TEST_USER_ID]).toBeUndefined();
      expect(savedData[999]).toEqual(mockData[999]); // Other user's data should remain
    });

    it("should handle clearing non-existent user", () => {
      mockedFs.readFileSync.mockReturnValue("{}");

      expect(() => {
        clearUserConversation(TEST_USER_ID);
      }).not.toThrow();
    });
  });

  describe("conversation history formatting", () => {
    it("should format conversation history for prompt correctly", () => {
      const mockData = {
        [TEST_USER_ID]: {
          messages: [
            {
              role: "user",
              content: "Hoe kan ik gemotiveerd blijven?",
              timestamp: new Date().toISOString(),
            },
            {
              role: "assistant",
              content: "Focus op kleine doelen en vier je successen!",
              timestamp: new Date().toISOString(),
            },
            {
              role: "user",
              content: "Ik heb moeite met consistent blijven",
              timestamp: new Date().toISOString(),
            },
          ],
          summary: "User discussing motivation and consistency in weight loss",
          lastSummaryUpdate: new Date().toISOString(),
        },
      };
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockData));

      const history = getUserConversationHistory(TEST_USER_ID);
      const formattedHistory = history
        .map(
          (msg) => `${msg.role === "user" ? "User" : "Coach"}: ${msg.content}`,
        )
        .join("\n");

      expect(formattedHistory).toContain(
        "Conversation Summary: User discussing motivation and consistency in weight loss",
      );

      expect(formattedHistory).toContain(
        "User: Hoe kan ik gemotiveerd blijven?",
      );
      expect(formattedHistory).toContain(
        "Coach: Focus op kleine doelen en vier je successen!",
      );
      expect(formattedHistory).toContain(
        "User: Ik heb moeite met consistent blijven",
      );
    });

    describe("Conversation Summary", () => {
      it("should get conversation summary for user", () => {
        const mockData = {
          [TEST_USER_ID]: {
            messages: [],
            summary: "User lost 5 kg and is focusing on exercise",
            lastSummaryUpdate: new Date().toISOString(),
          },
        };
        mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockData));

        const summary = getConversationSummary(TEST_USER_ID);

        expect(summary).toBe("User lost 5 kg and is focusing on exercise");
      });

      it("should return default summary for user with no history", () => {
        mockedFs.readFileSync.mockReturnValue("{}");

        const summary = getConversationSummary(TEST_USER_ID);

        expect(summary).toBe("No conversation history yet.");
      });

      it("should set conversation summary for user", () => {
        const summaryText =
          "User achieved goal of losing 5 kg and is now maintaining";

        setConversationSummary(TEST_USER_ID, summaryText);

        const lastCall =
          mockedFs.writeFileSync.mock.calls[
            mockedFs.writeFileSync.mock.calls.length - 1
          ]!;
        const savedData = JSON.parse(lastCall[1] as string);
        const userData = savedData[TEST_USER_ID];

        expect(userData.summary).toBe(summaryText);
        expect(userData.lastSummaryUpdate).toBeDefined();
      });

      it("should format conversation history with summary correctly", () => {
        const history = [
          {
            role: "user" as const,
            content: "I lost 5 kg this month!",
            timestamp: new Date().toISOString(),
          },
          {
            role: "assistant" as const,
            content: "That's amazing progress! Keep up the great work!",
            timestamp: new Date().toISOString(),
          },
        ];

        const summary = "User lost 5 kg and is very motivated";
        const formatted = formatConversationHistoryForPrompt(history, summary);

        expect(formatted).toContain(
          "Conversation Summary: User lost 5 kg and is very motivated",
        );
        expect(formatted).toContain("User: I lost 5 kg this month!");
        expect(formatted).toContain("Coach: That's amazing progress!");
      });

      it("should format conversation history without summary correctly", () => {
        const history = [
          {
            role: "user" as const,
            content: "How can I stay motivated?",
            timestamp: new Date().toISOString(),
          },
        ];

        const formatted = formatConversationHistoryForPrompt(
          history,
          "No conversation history yet.",
        );

        expect(formatted).not.toContain("Conversation Summary");
        expect(formatted).toContain("User: How can I stay motivated?");
      });

      it("should handle empty history correctly", () => {
        const formatted = formatConversationHistoryForPrompt(
          [],
          "No conversation history yet.",
        );

        expect(formatted).toBe("");
      });
    });
  });
});
