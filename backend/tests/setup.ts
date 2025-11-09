import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Global mocks
jest.mock("axios", () => ({
  default: {
    post: jest.fn(),
  },
}));
