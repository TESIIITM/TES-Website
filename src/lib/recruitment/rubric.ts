/**
 * The open-weights rubric. Each scored question has a private weight from 0 to
 * 10; applicants see only the importance label it maps to. Scores are 0 to 10
 * per criterion, and the total is a weighted percentage.
 */

export type Importance = 'low' | 'medium' | 'high';

export type Criterion = { key: string; label: string; guidance: string; weight: number };

/** Where a criterion's score came from. A reviewer beats the AI, which beats the automatic checks. */
export type ScoreSource = 'admin' | 'ai' | 'auto';

export type Scores = Partial<Record<string, number>>;

export type ResolvedScore = { key: string; score: number | null; source: ScoreSource | null };

export const IMPORTANCE_LABELS: Record<Importance, string> = { low: 'Low', medium: 'Medium', high: 'High' };

/** Weights 7 and up read as High, 4 to 6 as Medium, and below 4 as Low. */
export function importanceOf(weight: number): Importance {
  if (weight >= 7) return 'high';
  if (weight >= 4) return 'medium';
  return 'low';
}

/** Scores the AI is asked for. Availability and the resume are scored automatically. */
export const AI_CRITERIA = ['knowledge', 'contributions', 'showcase', 'plan', 'department_fit'] as const;

function isScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10;
}

/** Keeps the valid 0–10 integer scores from a stored JSON object. */
export function readScores(value: unknown): Scores {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const scores: Scores = {};
  for (const [key, score] of Object.entries(value)) if (isScore(score)) scores[key] = score;
  return scores;
}

export function resolveScores(criteria: Criterion[], sources: { admin: Scores; ai: Scores; auto: Scores }): ResolvedScore[] {
  return criteria.map(({ key }) => {
    for (const source of ['admin', 'ai', 'auto'] as const) {
      const score = sources[source][key];
      if (score !== undefined) return { key, score, source };
    }
    return { key, score: null, source: null };
  });
}

export type ScoreSummary = {
  /** Weighted percentage over the criteria scored so far, or `null` if none are. */
  score: number | null;
  scored: number;
  /** Criteria that count, i.e. with a weight above zero. */
  total: number;
};

export function summarizeScore(criteria: Criterion[], resolved: ResolvedScore[]): ScoreSummary {
  const byKey = new Map(resolved.map((entry) => [entry.key, entry.score]));
  let earned = 0;
  let possible = 0;
  let scored = 0;
  let total = 0;
  for (const { key, weight } of criteria) {
    if (weight <= 0) continue;
    total++;
    const score = byKey.get(key);
    if (score == null) continue;
    scored++;
    earned += weight * score;
    possible += weight * 10;
  }
  return { score: possible ? Math.round((earned / possible) * 100) : null, scored, total };
}
