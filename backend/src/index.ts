import express from "express";
import dotenv from "dotenv";
import inspirationRoutes from "./routes/inspiration";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/automation", inspirationRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "WeightBuddy API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handling middleware
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  },
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WeightBuddy server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(
    `💡 Inspiration endpoint: http://localhost:${PORT}/automation/send-inspiration`,
  );
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
