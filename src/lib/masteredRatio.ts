import type { Word } from "@/types/word";

export type MasteredRatio = {
  percent: number;
  masteredCount: number;
  totalCount: number;
};

export function calculateMasteredRatio(words: Word[]): MasteredRatio {
  const totalCount = words.length;
  const masteredCount = words.filter((w) => w.status === "mastered").length;
  const percent = totalCount === 0 ? 0 : Math.round((masteredCount / totalCount) * 100);
  return { percent, masteredCount, totalCount };
}
