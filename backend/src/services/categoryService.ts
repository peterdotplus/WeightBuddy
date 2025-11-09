export type Category = "Motivation" | "Check-in";

export function selectRandomCategory(): Category {
  const categories: Category[] = ["Motivation", "Check-in"];
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex]!;
}

export function getCategoryPrompt(category: Category): string {
  switch (category) {
    case "Motivation":
      return "Geef een inspirerende, persoonlijke motivatieboodschap voor iemand die bezig is met afvallen. Varieer in thema's zoals doorzettingsvermogen, kleine successen vieren, geduld hebben, en gezondheidsvoordelen. Maak het aanmoedigend en oprecht. Houd het onder 400 tekens en schrijf in het Nederlands.";
    case "Check-in":
      return "Stel een persoonlijke, aanmoedigende check-in vraag over de voortgang van het afvallen. Varieer in thema's zoals voeding, beweging, mentale gezondheid, uitdagingen, of kleine overwinningen. Maak het een open vraag die aanzet tot reflectie. Houd het onder 400 tekens en schrijf in het Nederlands.";
    default:
      throw new Error(`Invalid category: ${category}`);
  }
}
