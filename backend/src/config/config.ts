import fs from "fs";
import path from "path";

export interface Config {
  deepseek: {
    apiKey: string;
    apiUrl: string;
  };
  telegram: {
    botToken: string;
    chatId: string;
  };
  server: {
    port: number;
    environment: string;
    webhookBaseUrl?: string;
  };
}

/**
 * Configuration loader that works in both development and production
 * Tries multiple locations for config files and environment variables
 */
export function loadConfig(): Config {
  // For test environment, use test config
  if (process.env.NODE_ENV === "test") {
    const configPaths = [
      path.join(process.cwd(), "config.test.json"),
      path.join(__dirname, "..", "..", "config.test.json"),
    ];

    for (const configPath of configPaths) {
      try {
        if (fs.existsSync(configPath)) {
          const configContent = fs.readFileSync(configPath, "utf8");
          const fileConfig = JSON.parse(configContent);
          console.log(`✅ Test config loaded from: ${configPath}`);
          return fileConfig as Config;
        }
      } catch (error) {
        console.warn(
          `⚠️  Failed to load test config from ${configPath}:`,
          (error as Error).message,
        );
      }
    }
  }

  const configPaths = [
    // Development - project root
    path.join(process.cwd(), "config.json"),
    path.join(process.cwd(), "config", "config.json"),

    // Production - relative to dist folder
    path.join(__dirname, "..", "..", "config.json"),
    path.join(__dirname, "..", "..", "config", "config.json"),

    // Absolute paths
    path.resolve("/etc/weightbuddy/config.json"),
    path.resolve("/opt/weightbuddy/config.json"),
  ];

  let fileConfig: Partial<Config> = {};

  // Try to load from config files
  for (const configPath of configPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, "utf8");
        fileConfig = JSON.parse(configContent);
        console.log(`✅ Config loaded from: ${configPath}`);
        break;
      }
    } catch (error) {
      console.warn(
        `⚠️  Failed to load config from ${configPath}:`,
        (error as Error).message,
      );
    }
  }

  // Merge with environment variables (environment takes precedence)
  const config: Config = {
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY || fileConfig.deepseek?.apiKey || "",
      apiUrl:
        process.env.DEEPSEEK_API_URL ||
        fileConfig.deepseek?.apiUrl ||
        "https://api.deepseek.com/v1/chat/completions",
    },
    telegram: {
      botToken:
        process.env.TELEGRAM_BOT_TOKEN || fileConfig.telegram?.botToken || "",
      chatId: process.env.TELEGRAM_CHAT_ID || fileConfig.telegram?.chatId || "",
    },
    server: {
      port: parseInt(
        process.env.PORT || fileConfig.server?.port?.toString() || "3001",
      ),
      environment:
        process.env.NODE_ENV || fileConfig.server?.environment || "development",
      webhookBaseUrl:
        process.env.WEBHOOK_BASE_URL || fileConfig.server?.webhookBaseUrl,
    },
  };

  // Validate required configuration
  validateConfig(config);

  return config;
}

/**
 * Validate that all required configuration values are present
 */
function validateConfig(config: Config): void {
  const errors: string[] = [];

  if (!config.deepseek.apiKey) {
    errors.push("DEEPSEEK_API_KEY is required");
  }

  if (!config.telegram.botToken) {
    errors.push("TELEGRAM_BOT_TOKEN is required");
  }

  if (!config.telegram.chatId) {
    errors.push("TELEGRAM_CHAT_ID is required");
  }

  if (errors.length > 0) {
    console.error("❌ Configuration errors:");
    errors.forEach((error) => console.error(`   - ${error}`));
    console.error("\nPlease set these values in either:");
    console.error("   - Environment variables");
    console.error("   - config.json file in the project root");
    console.error("   - /etc/weightbuddy/config.json");

    // Don't exit in test environment
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
  }

  console.log("✅ Configuration validated successfully");
}

// Export a singleton instance
export const config = loadConfig();
