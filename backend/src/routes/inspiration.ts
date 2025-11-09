import express from "express";
import { sendDailyInspiration } from "../services/inspirationService";
import { localhostOnly } from "../middleware/localhostOnly";

const router = express.Router();

/**
 * POST /automation/send-inspiration
 * Sends a daily inspiration message via Telegram
 * Only accessible from localhost (for cronjob use)
 */
router.post("/send-inspiration", localhostOnly, async (req, res) => {
  try {
    const result = await sendDailyInspiration();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error sending daily inspiration:", error);

    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? `Failed to send daily inspiration: ${error.message}`
          : "Failed to send daily inspiration: Unknown error occurred",
    });
  }
});

export default router;
