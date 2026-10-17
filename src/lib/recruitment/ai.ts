import 'server-only';
import { buildPrompt, evaluationResponseSchema, evaluationSchema, SYSTEM_PROMPT, verifyEvaluation, type EvaluationInput, type StoredEvaluation } from './ai-prompt';
import type { Criterion } from './rubric';

export type EvaluationResult =
  | { status: 'done'; evaluation: StoredEvaluation; model: string }
  | { status: 'disabled' }
  | { status: 'failed'; error: string; model: string };

const DEFAULT_MODEL = 'gemini-2.5-flash';
const TIMEOUT_MS = 60_000;
const ATTEMPTS = 3;

/**
 * The evaluation is optional. It runs only when AI_EVAL_ENABLED is "true" and
 * a Gemini API key is set; otherwise applications are reviewed by hand.
 */
export function aiConfig(): { apiKey: string; model: string } | null {
  if (process.env.AI_EVAL_ENABLED !== 'true' || !process.env.GEMINI_API_KEY) return null;
  return { apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || DEFAULT_MODEL };
}

class RetryableError extends Error {}

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
};

async function callGemini(apiKey: string, model: string, prompt: string): Promise<unknown> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json', responseSchema: evaluationResponseSchema },
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (response.status === 429 || response.status >= 500) throw new RetryableError(`Gemini answered ${response.status}`);
  if (!response.ok) throw new Error(`Gemini answered ${response.status}: ${(await response.text()).slice(0, 200)}`);

  const body = (await response.json()) as GeminiResponse;
  if (body.promptFeedback?.blockReason) throw new Error(`Gemini declined the request (${body.promptFeedback.blockReason})`);
  const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('');
  if (!text) throw new RetryableError(`Gemini returned no text (${body.candidates?.[0]?.finishReason ?? 'unknown reason'})`);
  try {
    return JSON.parse(text);
  } catch {
    throw new RetryableError('Gemini returned malformed JSON');
  }
}

/** Never throws: a failure is recorded on the application and reviewers carry on without it. */
export async function evaluateApplication(input: EvaluationInput, criteria: Criterion[]): Promise<EvaluationResult> {
  const config = aiConfig();
  if (!config) return { status: 'disabled' };
  const prompt = buildPrompt(input, criteria);

  let lastError = 'Unknown error';
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const parsed = evaluationSchema.safeParse(await callGemini(config.apiKey, config.model, prompt));
      if (!parsed.success) throw new RetryableError('The AI response did not match the expected format');
      return { status: 'done', evaluation: verifyEvaluation(parsed.data, input), model: config.model };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      const retryable = error instanceof RetryableError || (error instanceof Error && error.name === 'TimeoutError');
      if (!retryable || attempt === ATTEMPTS) break;
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
  return { status: 'failed', error: lastError.slice(0, 500), model: config.model };
}
