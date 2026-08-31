import type { Word } from "@/types/word";
import type { AnswerRecord } from "@/types/history";
import type { LearningStats } from "@/types/stats";
import {
  MAX_HISTORY_LENGTH,
  getLevelConfig,
  historyStorageKey,
  learningStatsStorageKey,
  wordsStorageKey,
} from "./constants";
import { getLocalDateString } from "./date";

const EMPTY_STATS: LearningStats = { totalAnswerCount: 0, dailyRecords: {} };

// All storage below is namespaced per level (準2級/2級/...) so their word
// data, history, and stats never mix. A level that has never been opened
// before is seeded with its starter word bank (see LevelConfig.defaultWords)
// so learning can start immediately; from then on, CSV import replaces it.

export function loadWords(levelId: string): Word[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(wordsStorageKey(levelId));
    if (raw === null) {
      const defaults = getLevelConfig(levelId)?.defaultWords ?? [];
      if (defaults.length > 0) saveWords(levelId, defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Word[]) : [];
  } catch {
    return [];
  }
}

export function saveWords(levelId: string, words: Word[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(wordsStorageKey(levelId), JSON.stringify(words));
}

export function loadHistory(levelId: string): AnswerRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(historyStorageKey(levelId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AnswerRecord[]) : [];
  } catch {
    return [];
  }
}

export function appendHistoryRecord(levelId: string, record: AnswerRecord): void {
  if (typeof window === "undefined") return;

  const history = loadHistory(levelId);
  history.push(record);
  const trimmed =
    history.length > MAX_HISTORY_LENGTH ? history.slice(history.length - MAX_HISTORY_LENGTH) : history;
  window.localStorage.setItem(historyStorageKey(levelId), JSON.stringify(trimmed));
}

export function loadLearningStats(levelId: string): LearningStats {
  if (typeof window === "undefined") return EMPTY_STATS;

  try {
    const raw = window.localStorage.getItem(learningStatsStorageKey(levelId));
    if (!raw) return EMPTY_STATS;
    const parsed = JSON.parse(raw);
    return {
      totalAnswerCount: typeof parsed?.totalAnswerCount === "number" ? parsed.totalAnswerCount : 0,
      dailyRecords:
        parsed?.dailyRecords && typeof parsed.dailyRecords === "object" ? parsed.dailyRecords : {},
    };
  } catch {
    return EMPTY_STATS;
  }
}

export function saveLearningStats(levelId: string, stats: LearningStats): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(learningStatsStorageKey(levelId), JSON.stringify(stats));
}

// Only call when the answer was non-blank — blank submissions don't count as
// "having written" toward the tree/daily totals (Phase2 spec).
export function recordWrittenAnswer(levelId: string): LearningStats {
  const stats = loadLearningStats(levelId);
  const today = getLocalDateString();
  const updated: LearningStats = {
    totalAnswerCount: stats.totalAnswerCount + 1,
    dailyRecords: {
      ...stats.dailyRecords,
      [today]: (stats.dailyRecords[today] ?? 0) + 1,
    },
  };
  saveLearningStats(levelId, updated);
  return updated;
}
