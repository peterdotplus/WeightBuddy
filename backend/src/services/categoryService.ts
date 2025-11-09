export type Category = "Motivation" | "Check-in";

export function selectRandomCategory(): Category {
  const categories: Category[] = ["Motivation", "Check-in"];
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex]!;
}

export function getCategoryPrompt(category: Category): string {
  switch (category) {
    case "Motivation":
      return "Geef een korte, inspirerende motivatieboodschap voor iemand die bezig is met afvallen. Houd het onder 160 tekens en schrijf in het Nederlands.";
    case "Check-in":
      return "Stel een korte, aanmoedigende check-in vraag over de voortgang van het afvallen. Houd het onder 160 tekens en schrijf in het Nederlands.";
    default:
      throw new Error(`Invalid category: ${category}`);
  }
}
