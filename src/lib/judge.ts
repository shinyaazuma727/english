import type { Word } from "@/types/word";
import { MASTERED_CORRECT_COUNT } from "./constants";

export function applyAnswerResult(word: Word, correct: boolean): Word {
  if (word.status === "mastered") {
    if (correct) {
      return word;
    }
    return { ...word, status: "learning", correctCount: 0 };
  }

  if (!correct) {
    return word;
  }

  const correctCount = word.correctCount + 1;
  if (correctCount >= MASTERED_CORRECT_COUNT) {
    return { ...word, correctCount, status: "mastered" };
  }
  return { ...word, correctCount };
}
