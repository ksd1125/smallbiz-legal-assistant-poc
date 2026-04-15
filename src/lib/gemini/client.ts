const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GeminiOptions {
  maxOutputTokens?: number;
  responseSchema?: object;
}

function isRetryableGeminiError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /Gemini API error: (429|500|502|503|504)\b/.test(error.message);
}

export async function callGemini<T>(prompt: string, options: GeminiOptions = {}): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  async function requestText(currentPrompt: string, maxOutputTokens = options.maxOutputTokens ?? 2048): Promise<string> {
    const generationConfig: Record<string, unknown> = {
      temperature: 0.1,
      maxOutputTokens
    };

    if (options.responseSchema) {
      generationConfig.responseMimeType = 'application/json';
      generationConfig.responseSchema = options.responseSchema;
    }

    const response = await fetch(`${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: currentPrompt }] }],
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

    return text;
  }

  if (options.responseSchema) {
    let lastParseError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const currentPrompt = attempt === 0
        ? prompt
        : `${prompt}\n\n이전 응답은 유효한 JSON이 아니었습니다. 설명 문장 없이 responseSchema에 맞는 완전한 JSON 객체만 다시 출력하세요.`;
      const maxOutputTokens = attempt === 0
        ? options.maxOutputTokens ?? 2048
        : Math.max((options.maxOutputTokens ?? 2048) * 3, 8192);
      let text: string;
      try {
        text = await requestText(currentPrompt, maxOutputTokens);
      } catch (error) {
        if (attempt === 0 && isRetryableGeminiError(error)) {
          lastParseError = error;
          continue;
        }
        throw error;
      }
      try {
        return JSON.parse(text) as T;
      } catch (error) {
        lastParseError = error;
      }
    }

    throw new Error(lastParseError instanceof Error ? `Gemini response was not valid JSON: ${lastParseError.message}` : 'Gemini response was not valid JSON.');
  }

  let text: string;
  try {
    text = await requestText(prompt);
  } catch (error) {
    if (!isRetryableGeminiError(error)) {
      throw error;
    }
    text = await requestText(prompt, Math.max((options.maxOutputTokens ?? 2048) * 3, 8192));
  }
  return text as T;
}
