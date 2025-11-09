import {
  selectRandomCategory,
  getCategoryPrompt,
} from "../../src/services/categoryService";

describe("Category Service", () => {
  describe("selectRandomCategory", () => {
    it('should return either "Motivation" or "Check-in"', () => {
      const category = selectRandomCategory();

      expect(["Motivation", "Check-in"]).toContain(category);
    });

    it("should return both categories approximately equally over many calls", () => {
      const categories = new Set();

      // Call the function multiple times
      for (let i = 0; i < 100; i++) {
        categories.add(selectRandomCategory());
      }

      expect(categories.size).toBe(2);
      expect(categories.has("Motivation")).toBe(true);
      expect(categories.has("Check-in")).toBe(true);
    });
  });

  describe("getCategoryPrompt", () => {
    it('should return a motivation prompt when given "Motivation" category', () => {
      const prompt = getCategoryPrompt("Motivation");

      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain("motivatieboodschap");
    });

    it('should return a check-in prompt when given "Check-in" category', () => {
      const prompt = getCategoryPrompt("Check-in");

      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain("check-in vraag");
    });

    it("should throw an error for invalid category", () => {
      expect(() => {
        getCategoryPrompt("InvalidCategory" as any);
      }).toThrow("Invalid category: InvalidCategory");
    });

    it("should return prompts that are short enough for text messages", () => {
      const motivationPrompt = getCategoryPrompt("Motivation");
      const checkinPrompt = getCategoryPrompt("Check-in");

      // Check that prompts are reasonably short (under 1100 chars)
      expect(motivationPrompt.length).toBeLessThan(1100);
      expect(checkinPrompt.length).toBeLessThan(1100);
    });
  });
});
