# Telegram Bot Functionality

This document describes the new Telegram bot functionality that has been added to the WeightBuddy backend.

## Overview

The Telegram bot now supports interactive commands and inline keyboards, allowing users to interact with the bot through buttons and commands.

## New Features

### `/test` Command

When a user types `/test` in the chatbot, the bot will display an inline keyboard with three buttons:

1. **3StateButton** - A toggle button with three states displayed using different emojis:
   - 🔴 (Red) - Initial state
   - 🟡 (Yellow) - Second state  
   - 🟢 (Green) - Third state
   - Clicking cycles through these states

2. **2StateButton** - A toggle button with two states:
   - 🔴 (Red) - Initial state
   - 🟢 (Green) - Second state
   - Clicking toggles between these states

3. **ToastButton** - Displays a toast notification in the app:
   - Shows a popup message "🍞 Toast notification displayed!"
   - Uses Telegram's alert-style callback query

## Technical Implementation

### Files Added

1. **`src/services/telegramBotService.ts`**
   - Main bot service using Telegraf framework
   - Handles commands and button interactions
   - Manages user state for toggle buttons

2. **`src/routes/telegram.ts`**
   - Webhook endpoint for receiving Telegram updates
   - Webhook management endpoints

3. **`tests/services/telegramBotService.test.ts`**
   - Unit tests for the bot service

### Configuration Updates

The config interface now includes an optional `webhookBaseUrl` field for production webhook setup.

## Setup Instructions

### Development Mode

In development, the bot uses polling (no webhook setup required):

1. Ensure `TELEGRAM_BOT_TOKEN` is set in your environment or config file
2. Start the server: `npm run dev`
3. The bot will automatically start polling for updates

### Production Mode

For production, you need to set up a webhook:

1. Set `WEBHOOK_BASE_URL` environment variable to your public URL
2. Call the setup endpoint: `POST /telegram/setup-webhook`
3. The bot will use webhooks instead of polling

### Webhook Management Endpoints

- `POST /telegram/setup-webhook` - Set up webhook with Telegram
- `POST /telegram/remove-webhook` - Remove webhook
- `GET /telegram/webhook-info` - Get current webhook information

## Usage Example

1. Start a chat with your Telegram bot
2. Send the command: `/test`
3. You'll see an inline keyboard with the three buttons
4. Click any button to see the functionality:
   - 3StateButton: Cycles through 🔴→🟡→🟢
   - 2StateButton: Toggles between 🔴 and 🟢
   - ToastButton: Shows a toast notification

## Dependencies

- `telegraf` - Telegram Bot API framework for Node.js

## State Management

The bot maintains user state in memory for the toggle buttons. Each user's button states are stored separately and persist for the duration of the server session.

## Error Handling

- All bot errors are caught and logged to the console
- Webhook errors return appropriate HTTP status codes
- User-facing errors are handled gracefully