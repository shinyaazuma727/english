import { TREE_GROWTH_STAGES } from "./constants";

export function getTreeStage(totalAnswerCount: number): number {
  let stage = 0;
  for (let i = 0; i < TREE_GROWTH_STAGES.length; i++) {
    if (totalAnswerCount >= TREE_GROWTH_STAGES[i]) {
      stage = i;
    }
  }
  return stage;
}

export function getAnswersUntilNextStage(totalAnswerCount: number): number | null {
  const stage = getTreeStage(totalAnswerCount);
  if (stage >= TREE_GROWTH_STAGES.length - 1) return null;
  return TREE_GROWTH_STAGES[stage + 1] - totalAnswerCount;
}

// Fraction (0-1) of progress from the current stage's threshold toward the
// next one, for the tree's progress ring. 1 once the final stage is reached.
export function getStageProgress(totalAnswerCount: number): number {
  const stage = getTreeStage(totalAnswerCount);
  if (stage >= TREE_GROWTH_STAGES.length - 1) return 1;

  const current = TREE_GROWTH_STAGES[stage];
  const next = TREE_GROWTH_STAGES[stage + 1];
  return (totalAnswerCount - current) / (next - current);
}
