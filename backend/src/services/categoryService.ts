export type Category = "Motivation" | "Check-in";

export function selectRandomCategory(): Category {
  const categories: Category[] = ["Motivation", "Check-in"];
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex]!;
}

export function getCategoryPrompt(category: Category): string {
  switch (category) {
    case "Motivation":
      return "Provide a short, inspiring motivation message for someone on a weight loss journey. Keep it under 160 characters.";
    case "Check-in":
      return "Ask a brief, encouraging check-in question about weight loss progress. Keep it under 160 characters.";
    default:
      throw new Error(`Invalid category: ${category}`);
  }
}
