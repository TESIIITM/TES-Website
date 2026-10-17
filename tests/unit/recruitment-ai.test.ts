import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const { evaluateApplication } = await import('@/lib/recruitment/ai');

const input = {
  yearOfStudy: '1', knowledge: 'TES runs the website.', contributions: 'None yet.', showcase: 'https://example.org',
  plan: 'Write docs.', department: 'Design', role: 'Designer', weeklyHours: 4, commitment: 'short_term' as const,
  additionalInfo: null, links: [], verifiedFacts: [],
};
const criteria = [{ key: 'knowledge', label: 'Understanding', guidance: 'Facts.', weight: 5 }];
const score = { score: 5, reason: 'Fine.' };
const evaluation = {
  summary: 'New, curious.', strengths: [], concerns: ['No work shown yet'], evidence: [{ point: 'Knows the site', quote: 'TES runs the website.' }],
  suitability: 'Could start with docs.', suggested_role: null, flags: [],
  scores: { knowledge: score, contributions: score, showcase: score, plan: score, department_fit: score },
};
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const answer = (json: unknown) => reply({ candidates: [{ content: { parts: [{ text: JSON.stringify(json) }] } }] });

describe('evaluateApplication', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout'] });
    vi.stubEnv('AI_EVAL_ENABLED', 'true');
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.stubEnv('GEMINI_MODEL', 'test-model');
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('does nothing unless it is switched on', async () => {
    vi.stubEnv('AI_EVAL_ENABLED', '');
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    expect(await evaluateApplication(input, criteria)).toEqual({ status: 'disabled' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('sends the key in a header and stores a checked evaluation', async () => {
    const fetch = vi.fn().mockResolvedValue(answer(evaluation));
    vi.stubGlobal('fetch', fetch);
    const result = await evaluateApplication(input, criteria);
    expect(result.status).toBe('done');
    if (result.status === 'done') expect(result.evaluation.evidence[0].verified).toBe(true);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toContain('/models/test-model:generateContent');
    expect(url).not.toContain('test-key');
    expect(init.headers['x-goog-api-key']).toBe('test-key');
  });

  it('retries rate limits and malformed replies, then reports the failure', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(reply({}, 429))
      .mockResolvedValueOnce(answer({ summary: 'missing fields' }))
      .mockResolvedValueOnce(reply({}, 503));
    vi.stubGlobal('fetch', fetch);
    const pending = evaluateApplication(input, criteria);
    await vi.runAllTimersAsync();
    expect(await pending).toEqual({ status: 'failed', error: 'Gemini answered 503', model: 'test-model' });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('does not retry a rejected key', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('API key not valid', { status: 400 }));
    vi.stubGlobal('fetch', fetch);
    const result = await evaluateApplication(input, criteria);
    expect(result).toMatchObject({ status: 'failed', error: expect.stringContaining('400') });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
