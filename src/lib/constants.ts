import type { Word } from "@/types/word";
import { DEFAULT_WORDS_PRE2 } from "./defaultWordsPre2";
import { DEFAULT_WORDS_GRADE2 } from "./defaultWordsGrade2";

export const NEXT_DELAY_MS = 1000;
// Per-question time limit: forces an incorrect result if the user hasn't
// submitted within this window, so a stuck word doesn't stall the learning cycle.
export const ANSWER_TIMEOUT_MS = 15_000;
export const MASTERED_CORRECT_COUNT = 3;
export const MASTERED_REVIEW_RATIO = 0.25;
export const STATS_BATCH_SIZE = 10;
export const MAX_HISTORY_LENGTH = 2000;

// Materials structure: today this project only has one material (英検) split
// into levels. A level's data (words/history/stats) is fully independent —
// see the storageKey helpers below. To add a future layer (材料 > 級 >
// カテゴリー > ...) without migrating existing data, extend the id scheme
// instead of this shape, e.g. a category becomes its own id like
// "pre1-education" — storage stays a flat per-id namespace either way.
export type LevelConfig = {
  id: string;
  label: string;
  materialLabel: string;
  // Seeded into a level's word bank the first time it's opened (before any
  // CSV import). A starter set, not the full official Eiken word list.
  defaultWords: Word[];
};

export const LEVELS: LevelConfig[] = [
  { id: "pre2", label: "準2級", materialLabel: "英検準2級", defaultWords: DEFAULT_WORDS_PRE2 },
  { id: "grade2", label: "2級", materialLabel: "英検2級", defaultWords: DEFAULT_WORDS_GRADE2 },
];

export function getLevelConfig(levelId: string): LevelConfig | undefined {
  return LEVELS.find((level) => level.id === levelId);
}

export function wordsStorageKey(levelId: string): string {
  return `kaku_words_${levelId}`;
}

export function historyStorageKey(levelId: string): string {
  return `kaku_history_${levelId}`;
}

export function learningStatsStorageKey(levelId: string): string {
  return `kaku_learning_stats_${levelId}`;
}

// Phase2: tree growth is driven by the mastered-word percentage of the
// current level's word bank (see masteredRatio.ts), not by answer count.
// Thresholds/labels are collected here so they can be retuned in one place.
export const TREE_GROWTH_THRESHOLDS = [0, 10, 30, 50, 80];
export const TREE_STAGE_LABELS = ["芽", "苗", "若木", "葉が茂る", "花が咲く"];
