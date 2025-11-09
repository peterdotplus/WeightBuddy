import dotenv from 'dotenv';
import path from 'path';

/**
 * Robust environment configuration loader
 * Handles different deployment scenarios (development, production, VPS)
 */
export function loadEnvironment(): void {
  const envPaths = [
    // 1. Current directory (development with ts-node-dev)
    '.env',

    // 2. Project root (production build)
    path.join(__dirname, '..', '..', '.env'),

    // 3. Two levels up (VPS deployment scenarios)
    path.join(__dirname, '..', '..', '..', '.env'),

    // 4. Absolute path fallback
    path.resolve(process.cwd(), '.env')
  ];

  let loaded = false;

  for (const envPath of envPaths) {
    try {
      const result = dotenv.config({ path: envPath });
      if (!result.error) {
        console.log(`✅ Environment loaded from: ${envPath}`);
        loaded = true;
        break;
      }
    } catch (error) {
      // Continue to next path
    }
  }

  if (!loaded) {
    console.warn('⚠️  No .env file found. Using environment variables from system.');
  }

  // Validate required environment variables
  validateEnvironment();
}

/**
 * Validate that all required environment variables are present
 */
function validateEnvironment(): void {
  const required = [
    'DEEPSEEK_API_KEY',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('Please check your .env file or system environment variables.');
    process.exit(1);
  }

  console.log('✅ All required environment variables are present');
}

/**
 * Get environment variable with fallback
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }

  return value;
}
