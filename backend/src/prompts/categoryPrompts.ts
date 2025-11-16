export const MOTIVATION_PROMPTS = [
  "Write an inspiring motivational message about perseverance and consistency in weight loss. Focus on how small daily efforts lead to significant long-term results. The message should be encouraging and genuine.",
  "Create an encouraging message about celebrating small victories in the weight loss journey. Emphasize how every healthy meal, workout, and day of persistence contributes to the ultimate goal.",
  "Compose a motivational text about having patience with the weight loss process. Explain that real transformation takes time and the body adapts at its own pace.",
  "Write an inspiring message about the health benefits of weight loss. Focus on increased energy, better sleep, improved mental health, and physical wellbeing.",
  "Create a motivational text about overcoming setbacks and challenges. Discuss how occasional slip-ups are normal and the importance of getting back on track.",
  "Write an encouraging message about finding joy in the weight loss process. Focus on discovering new healthy recipes, enjoyable workouts, and positive habits.",
  "Compose a motivational text about setting realistic goals. Emphasize the importance of achievable steps and tracking progress.",
  "Create an inspiring message about mental resilience. Focus on how positive mindset and self-compassion are essential for successful weight loss.",
] as const;

export const CHECK_IN_PROMPTS = [
  "Write a warm, encouraging check-in message asking about their current feelings and progress. Focus on creating a supportive space for reflection about their weight loss journey this week.",
  "Create a supportive check-in message about nutrition challenges and how they've been managing them. Make it encouraging and understanding of the difficulties.",
  "Write an encouraging check-in message about their exercise routine and how it's benefiting them. Focus on energy levels, strength improvements, and overall wellbeing.",
  "Create a caring check-in message about mental health during the weight loss process. Ask about stress management and emotional wellbeing in a supportive way.",
  "Write an encouraging check-in message about new healthy habits they're developing. Focus on progress and the positive changes they're making.",
  "Create a supportive check-in message about dealing with temptations and cravings. Offer encouragement for their strategies and willpower.",
  "Write a reflective check-in message about personal growth and insights gained during their weight loss journey. Focus on self-discovery and learning.",
  "Create a forward-looking check-in message about planning for the upcoming week. Encourage setting specific, achievable goals.",
  "Write a supportive check-in message asking about the type of support they need most right now. Show understanding and willingness to help.",
  "Create a celebratory check-in message focusing on successes, no matter how small. Encourage them to acknowledge and be proud of their achievements.",
] as const;

export function getRandomMotivationPrompt(): string {
  const randomIndex = Math.floor(Math.random() * MOTIVATION_PROMPTS.length);
  return MOTIVATION_PROMPTS[randomIndex]!;
}

export function getRandomCheckInPrompt(): string {
  const randomIndex = Math.floor(Math.random() * CHECK_IN_PROMPTS.length);
  return CHECK_IN_PROMPTS[randomIndex]!;
}
