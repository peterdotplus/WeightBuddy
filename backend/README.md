# WeightBuddy Backend

A weight loss motivation chatbot backend that sends daily inspiration and check-in messages via Telegram.

## Features

- **Daily Inspiration**: Sends motivational messages and check-ins via Telegram
- **AI-Powered**: Uses DeepSeek AI to generate personalized messages
- **Localhost Security**: `/send-inspiration` endpoint only accessible from localhost
- **Test-Driven Development**: Comprehensive test suite with Jest

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Testing**: Jest
- **AI Integration**: DeepSeek API
- **Messaging**: Telegram Bot API

## Project Structure

```
backend/
├── src/
│   ├── middleware/
│   │   └── localhostOnly.ts     # Localhost access restriction
│   ├── routes/
│   │   └── inspiration.ts       # API routes
│   ├── services/
│   │   ├── categoryService.ts   # Category selection logic
│   │   ├── deepseekService.ts   # AI message generation
│   │   ├── inspirationService.ts # Main orchestration service
│   │   └── telegramService.ts   # Telegram message sending
│   └── index.ts                 # Main server file
├── tests/
│   ├── routes/                  # API route tests
│   ├── services/                # Service unit tests
│   └── setup.ts                 # Test configuration
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- DeepSeek API account and API key
- Telegram Bot Token and Chat ID

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment template and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# DeepSeek API Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 3. Run the Application

**Development mode (recommended for coding):**
```bash
npm run dev
```
- No build step required
- Auto-restarts on file changes
- Runs TypeScript directly

**Production mode:**
```bash
npm run build
npm start
```
- Build step compiles TypeScript to JavaScript
- Better performance for production use

### 4. Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate test coverage:
```bash
npm run test:coverage
```

## API Endpoints

### POST `/automation/send-inspiration`

Sends a daily inspiration message via Telegram. Only accessible from localhost.

**Headers:**
- `X-Forwarded-For: 127.0.0.1` (or any localhost IP)

**Response:**
```json
{
  "success": true,
  "data": {
    "category": "Motivation",
    "message": "You are doing great! Keep pushing forward!"
  }
}
```

### GET `/health`

Health check endpoint to verify the API is running.

**Response:**
```json
{
  "success": true,
  "message": "WeightBuddy API is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Setting Up Telegram Bot

1. Create a new bot with [@BotFather](https://t.me/botfather) on Telegram
2. Get your bot token
3. Start a chat with your bot
4. Get your chat ID by sending a message to the bot and checking the response

## Setting Up DeepSeek API

1. Sign up for a DeepSeek account at [deepseek.com](https://www.deepseek.com)
2. Generate an API key from your dashboard
3. Add the API key to your `.env` file

## Cron Job Setup

To send daily messages automatically, set up a cron job that calls the `/send-inspiration` endpoint:

```bash
# Example cron job (runs daily at 9 AM)
# Make sure the server is running first!
0 9 * * * curl -X POST http://localhost:3001/automation/send-inspiration
```

**Important**: The server must be running (`npm run dev` or `npm start`) for the cron job to work.

## Development Workflow

This project follows Test-Driven Development (TDD):

1. **RED**: Write failing tests first
2. **GREEN**: Implement minimal code to pass tests  
3. **REFACTOR**: Improve code while maintaining test coverage

### Quick Start for Development:
```bash
npm install          # Install dependencies once
npm run dev          # Start development server (no build needed)
npm test             # Run tests anytime
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DEEPSEEK_API_KEY` | DeepSeek API authentication key | Yes |
| `DEEPSEEK_API_URL` | DeepSeek API endpoint URL | No (has default) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | Yes |
| `TELEGRAM_CHAT_ID` | Target chat ID for messages | Yes |
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment mode | No (default: development) |

## Error Handling

The API provides consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common error scenarios:
- Missing API keys
- Invalid Telegram configuration
- AI service failures
- Network connectivity issues

## Contributing

1. Follow TDD approach: write tests first
2. Ensure all tests pass before committing
3. Maintain code coverage
4. Use TypeScript for type safety

## License

MIT License - see LICENSE file for details