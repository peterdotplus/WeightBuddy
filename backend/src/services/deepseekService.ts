import axios from "axios";
import { config } from "../config/config";

export async function generateInspirationMessage(
  prompt: string,
): Promise<string> {
  const apiKey = config.deepseek.apiKey;
  const apiUrl = config.deepseek.apiUrl;

  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured");
  }

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.data.choices || response.data.choices.length === 0) {
      throw new Error(
        "Invalid response from DeepSeek API: No choices returned",
      );
    }

    const message = response.data.choices[0].message;
    if (!message || !message.content) {
      throw new Error(
        "Invalid response from DeepSeek API: No content in response",
      );
    }

    return message.content;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to generate inspiration message: ${error.message}`,
      );
    }
    throw new Error("Failed to generate inspiration message: Unknown error");
  }
}
