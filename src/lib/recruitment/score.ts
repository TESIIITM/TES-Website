import { aiScores, readEvaluation } from './ai-prompt';
import { readScores, resolveScores, summarizeScore, type Criterion, type ResolvedScore, type ScoreSummary } from './rubric';

type ScoredRow = { auto_scores: unknown; admin_scores: unknown; ai_evaluation: unknown };

/** An application's per-criterion scores and weighted total under the current rubric. */
export function scoreApplication(row: ScoredRow, criteria: Criterion[]): { resolved: ResolvedScore[]; summary: ScoreSummary } {
  const resolved = resolveScores(criteria, {
    admin: readScores(row.admin_scores),
    ai: aiScores(readEvaluation(row.ai_evaluation)),
    auto: readScores(row.auto_scores),
  });
  return { resolved, summary: summarizeScore(criteria, resolved) };
}
