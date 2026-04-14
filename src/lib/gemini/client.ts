const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GeminiOptions {
  maxOutputTokens?: number;
  responseSchema?: object;
}

export async function callGemini<T>(prompt: string, options: GeminiOptions = {}): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const generationConfig: Record<string, unknown> = {
    temperature: 0.1,
    maxOutputTokens: options.maxOutputTokens ?? 2048
  };

  if (options.responseSchema) {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = options.responseSchema;
  }

  const response = await fetch(`${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('');
  if (!text) {
    throw new Error('Gemini response is empty.');
  }

  if (options.responseSchema) {
    return JSON.parse(text) as T;
  }

  return text as T;
}
