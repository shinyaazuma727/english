import type { Word } from "@/types/word";
import { MASTERED_REVIEW_RATIO } from "./constants";

function pickRandom(list: Word[]): Word {
  return list[Math.floor(Math.random() * list.length)];
}

export function pickNextWord(words: Word[], previousWordId: string | null): Word | null {
  if (words.length === 0) return null;

  const learningWords = words.filter((w) => w.status === "learning");
  const masteredWords = words.filter((w) => w.status === "mastered");

  let pool: Word[];
  if (learningWords.length === 0) {
    pool = masteredWords;
  } else if (masteredWords.length === 0) {
    pool = learningWords;
  } else {
    pool = Math.random() < MASTERED_REVIEW_RATIO ? masteredWords : learningWords;
  }

  const withoutPrevious = pool.filter((w) => w.id !== previousWordId);
  const candidates = withoutPrevious.length > 0 ? withoutPrevious : pool;

  return pickRandom(candidates);
}
