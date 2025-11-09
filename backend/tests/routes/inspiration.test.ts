import request from "supertest";
import express from "express";
import inspirationRoutes from "../../src/routes/inspiration";

// Mock the inspiration service
jest.mock("../../src/services/inspirationService", () => ({
  sendDailyInspiration: jest.fn(),
}));

const {
  sendDailyInspiration,
} = require("../../src/services/inspirationService");

describe("Inspiration Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/automation", inspirationRoutes);
    jest.clearAllMocks();
  });

  describe("POST /automation/send-inspiration", () => {
    it("should send daily inspiration when called from localhost", async () => {
      const mockResult = {
        category: "Motivation",
        message: "Je doet het geweldig! Blijf doorgaan!",
      };
      (sendDailyInspiration as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/automation/send-inspiration")
        .set("X-Forwarded-For", "127.0.0.1")
        .set("Host", "localhost")
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockResult,
      });
      expect(sendDailyInspiration).toHaveBeenCalledTimes(1);
    });

    it("should return 403 when called from non-localhost IP", async () => {
      const response = await request(app)
        .post("/automation/send-inspiration")
        .set("X-Forwarded-For", "192.168.1.100")
        .set("Host", "example.com")
        .send();

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        success: false,
        error:
          "Access denied. This endpoint is only accessible from localhost.",
      });
      expect(sendDailyInspiration).not.toHaveBeenCalled();
    });

    it("should return 403 when no IP is provided", async () => {
      const response = await request(app)
        .post("/automation/send-inspiration")
        .send();

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        success: false,
        error:
          "Access denied. This endpoint is only accessible from localhost.",
      });
      expect(sendDailyInspiration).not.toHaveBeenCalled();
    });

    it("should handle errors from the inspiration service", async () => {
      (sendDailyInspiration as jest.Mock).mockRejectedValue(
        new Error("AI Service Error"),
      );

      const response = await request(app)
        .post("/automation/send-inspiration")
        .set("X-Forwarded-For", "127.0.0.1")
        .set("Host", "localhost")
        .send();

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: "Failed to send daily inspiration: AI Service Error",
      });
    });

    it("should work with IPv6 localhost address", async () => {
      const mockResult = {
        category: "Check-in",
        message: "Hoe gaat het deze week met je voortgang?",
      };
      (sendDailyInspiration as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/automation/send-inspiration")
        .set("X-Forwarded-For", "::1")
        .set("Host", "localhost")
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockResult,
      });
      expect(sendDailyInspiration).toHaveBeenCalledTimes(1);
    });

    it("should work with localhost hostname", async () => {
      const mockResult = {
        category: "Motivation",
        message: "Blijf het goede werk doen!",
      };
      (sendDailyInspiration as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/automation/send-inspiration")
        .set("Host", "localhost:3001")
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockResult,
      });
      expect(sendDailyInspiration).toHaveBeenCalledTimes(1);
    });
  });
});
