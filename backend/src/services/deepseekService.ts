import axios from 'axios';

export async function generateInspirationMessage(prompt: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

  if (!apiKey) {
    throw new Error('DeepSeek API key is not configured');
  }

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data.choices || response.data.choices.length === 0) {
      throw new Error('Invalid response from DeepSeek API: No choices returned');
    }

    const message = response.data.choices[0].message;
    if (!message || !message.content) {
      throw new Error('Invalid response from DeepSeek API: No content in response');
    }

    return message.content;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate inspiration message: ${error.message}`);
    }
    throw new Error('Failed to generate inspiration message: Unknown error');
  }
}
