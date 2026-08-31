import { TREE_GROWTH_THRESHOLDS } from "./constants";

export function getTreeStage(masteredPercent: number): number {
  let stage = 0;
  for (let i = 0; i < TREE_GROWTH_THRESHOLDS.length; i++) {
    if (masteredPercent >= TREE_GROWTH_THRESHOLDS[i]) {
      stage = i;
    }
  }
  return stage;
}

// Words still needed (mastered) before the tree advances to the next growth
// stage. Null once the final stage is reached, or when there's no word bank
// yet to measure a percentage against.
export function getWordsUntilNextStage(masteredCount: number, totalCount: number): number | null {
  if (totalCount === 0) return null;

  const percent = (masteredCount / totalCount) * 100;
  const stage = getTreeStage(percent);
  if (stage >= TREE_GROWTH_THRESHOLDS.length - 1) return null;

  const nextThreshold = TREE_GROWTH_THRESHOLDS[stage + 1];
  const neededMastered = Math.ceil((nextThreshold / 100) * totalCount);
  return Math.max(1, neededMastered - masteredCount);
}
