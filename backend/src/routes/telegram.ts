import express from 'express';
import { telegramBot } from '../services/telegramBotService';
import { config } from '../config/config';

const router = express.Router();

// Webhook endpoint for receiving Telegram updates
router.post('/webhook', express.json(), async (req, res) => {
  try {
    await telegramBot.handleUpdate(req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process Telegram update'
    });
  }
});

// Endpoint to set up webhook with Telegram
router.post('/setup-webhook', async (req, res) => {
  try {
    const webhookUrl = `${config.server.webhookBaseUrl}/telegram/webhook`;

    await telegramBot.telegram.setWebhook(webhookUrl);

    const webhookInfo = await telegramBot.telegram.getWebhookInfo();

    res.status(200).json({
      success: true,
      message: 'Webhook set up successfully',
      webhookInfo: {
        url: webhookInfo.url,
        hasCustomCertificate: webhookInfo.has_custom_certificate,
        pendingUpdateCount: webhookInfo.pending_update_count,
        lastErrorDate: webhookInfo.last_error_date,
        lastErrorMessage: webhookInfo.last_error_message,
        maxConnections: webhookInfo.max_connections,
        allowedUpdates: webhookInfo.allowed_updates
      }
    });
  } catch (error) {
    console.error('Error setting up webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set up webhook'
    });
  }
});

// Endpoint to remove webhook
router.post('/remove-webhook', async (req, res) => {
  try {
    await telegramBot.telegram.deleteWebhook();

    res.status(200).json({
      success: true,
      message: 'Webhook removed successfully'
    });
  } catch (error) {
    console.error('Error removing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove webhook'
    });
  }
});

// Endpoint to get webhook info
router.get('/webhook-info', async (req, res) => {
  try {
    const webhookInfo = await telegramBot.telegram.getWebhookInfo();

    res.status(200).json({
      success: true,
      webhookInfo: {
        url: webhookInfo.url,
        hasCustomCertificate: webhookInfo.has_custom_certificate,
        pendingUpdateCount: webhookInfo.pending_update_count,
        lastErrorDate: webhookInfo.last_error_date,
        lastErrorMessage: webhookInfo.last_error_message,
        maxConnections: webhookInfo.max_connections,
        allowedUpdates: webhookInfo.allowed_updates
      }
    });
  } catch (error) {
    console.error('Error getting webhook info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get webhook info'
    });
  }
});

export default router;
