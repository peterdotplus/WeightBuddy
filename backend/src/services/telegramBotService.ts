import { Telegraf, Context } from "telegraf";
import { config } from "../config/config";
import { handleChatMessage } from "./chatService";

// Define button states and emojis
const THREE_STATE_BUTTON_STATES = ["🔴", "🟡", "🟢"] as const;
const TWO_STATE_BUTTON_STATES = ["🔴", "🟢"] as const;

type ThreeState = (typeof THREE_STATE_BUTTON_STATES)[number];
type TwoState = (typeof TWO_STATE_BUTTON_STATES)[number];

// User state management
interface UserState {
  threeState: ThreeState;
  twoState: TwoState;
}

const userStates = new Map<number, UserState>();

// Initialize bot
const bot = new Telegraf(config.telegram.botToken);

// Helper function to get or initialize user state
function getUserState(userId: number): UserState {
  if (!userStates.has(userId)) {
    userStates.set(userId, {
      threeState: "🔴",
      twoState: "🔴",
    });
  }
  return userStates.get(userId)!;
}

// Helper function to cycle through states
function cycleState<T extends string>(current: T, states: readonly T[]): T {
  const currentIndex = states.indexOf(current);
  const nextIndex = (currentIndex + 1) % states.length;
  return states[nextIndex]!;
}

// Handle /test command
bot.command("test", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const userState = getUserState(userId);

  await ctx.reply("Test functionality activated! Choose a button:", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `3StateButton ${userState.threeState}`,
            callback_data: "toggle_three_state",
          },
        ],
        [
          {
            text: `2StateButton ${userState.twoState}`,
            callback_data: "toggle_two_state",
          },
        ],
        [
          {
            text: "ToastButton",
            callback_data: "show_toast",
          },
        ],
        [
          {
            text: "AlertButton",
            callback_data: "show_alert",
          },
        ],
      ],
    },
  });
});

// Handle button callbacks
bot.action("toggle_three_state", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const userState = getUserState(userId);
  userState.threeState = cycleState(
    userState.threeState,
    THREE_STATE_BUTTON_STATES,
  );

  await ctx.editMessageText("Test functionality activated! Choose a button:", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `3StateButton ${userState.threeState}`,
            callback_data: "toggle_three_state",
          },
        ],
        [
          {
            text: `2StateButton ${userState.twoState}`,
            callback_data: "toggle_two_state",
          },
        ],
        [
          {
            text: "ToastButton",
            callback_data: "show_toast",
          },
        ],
        [
          {
            text: "AlertButton",
            callback_data: "show_alert",
          },
        ],
      ],
    },
  });
});

bot.action("toggle_two_state", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const userState = getUserState(userId);
  userState.twoState = cycleState(userState.twoState, TWO_STATE_BUTTON_STATES);

  await ctx.editMessageText("Test functionality activated! Choose a button:", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `3StateButton ${userState.threeState}`,
            callback_data: "toggle_three_state",
          },
        ],
        [
          {
            text: `2StateButton ${userState.twoState}`,
            callback_data: "toggle_two_state",
          },
        ],
        [
          {
            text: "ToastButton",
            callback_data: "show_toast",
          },
        ],
        [
          {
            text: "AlertButton",
            callback_data: "show_alert",
          },
        ],
      ],
    },
  });
});

bot.action("show_toast", async (ctx) => {
  await ctx.answerCbQuery("🍞 Toast notification displayed!");
});

bot.action("show_alert", async (ctx) => {
  await ctx.answerCbQuery("🚨 Alert notification displayed!", {
    show_alert: true,
  });
});

// Handle text messages (non-command chat)
bot.on("text", async (ctx) => {
  const message = ctx.message.text;
  const userId = ctx.from?.id;

  if (!userId) {
    console.warn("Received text message without user ID");
    return;
  }

  try {
    // Handle the chat message using our chat service
    const response = await handleChatMessage(message);

    // If response is null, it means it was a slash command or empty message
    // In that case, let the command handlers handle it
    if (response === null) {
      return;
    }

    // Send the AI-generated response back to the user
    await ctx.reply(response);
  } catch (error) {
    console.error("Error handling chat message:", error);

    // Send a friendly error message to the user
    await ctx.reply(
      "Sorry, I'm having trouble processing your message right now. Please try again later.",
    );
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Export bot instance and initialization function
export const telegramBot = bot;

export async function initializeTelegramBot(): Promise<void> {
  try {
    console.log("🤖 Initializing Telegram bot...");
    console.log(`🤖 Environment: ${config.server.environment}`);
    console.log(
      `🤖 Bot token configured: ${config.telegram.botToken ? "Yes" : "No"}`,
    );

    // For non-production environments, use polling instead of webhook
    if (config.server.environment !== "production") {
      console.log("🤖 Starting Telegram bot in polling mode...");
      await bot.launch();
      console.log("✅ Telegram bot started successfully in polling mode");
    } else {
      console.log("🤖 Telegram bot ready for webhook setup...");
    }

    console.log("✅ Telegram bot service initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Telegram bot:", error);
    throw error;
  }
}

export async function stopTelegramBot(): Promise<void> {
  await bot.stop();
}
