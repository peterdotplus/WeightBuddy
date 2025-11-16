export type Category = "Motivation" | "Check-in";

import {
  getRandomMotivationPrompt,
  getRandomCheckInPrompt,
} from "../prompts/categoryPrompts";

export function selectRandomCategory(): Category {
  const categories: Category[] = ["Motivation", "Check-in"];
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex]!;
}

export function getCategoryPrompt(category: Category): string {
  const basePrompt = getBasePrompt(category);

  switch (category) {
    case "Motivation":
      return `${basePrompt} ${getRandomMotivationPrompt()} Keep your response under 1000 characters and write in Dutch without using a greeting.`;
    case "Check-in":
      return `${basePrompt} ${getRandomCheckInPrompt()} Keep your response under 1000 characters and write in Dutch without using a greeting.`;
    default:
      throw new Error(`Invalid category: ${category}`);
  }
}

function getBasePrompt(category: Category): string {
  switch (category) {
    case "Motivation":
      return "You are a supportive weight loss coach. Write a personal, encouraging message that:";
    case "Check-in":
      return "You are a caring weight loss coach. Write a warm, supportive check-in message that:";
    default:
      return "You are a supportive weight loss coach. Write a message that:";
  }
}
