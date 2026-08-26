import type { Word } from "@/types/word";
import type { AnswerRecord } from "@/types/history";
import type { LearningStats } from "@/types/stats";
import {
  HISTORY_STORAGE_KEY,
  LEARNING_STATS_STORAGE_KEY,
  MAX_HISTORY_LENGTH,
  STORAGE_KEY,
} from "./constants";
import { DEFAULT_WORDS } from "./defaultWords";
import { getLocalDateString } from "./date";

const EMPTY_STATS: LearningStats = { totalAnswerCount: 0, dailyRecords: {} };

export function loadWords(): Word[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      // First launch: nothing has ever been saved, so seed with the
      // built-in elementary-6th-grade word list instead of an empty state.
      saveWords(DEFAULT_WORDS);
      return DEFAULT_WORDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Word[]) : [];
  } catch {
    return [];
  }
}

export function saveWords(words: Word[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

export function loadHistory(): AnswerRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AnswerRecord[]) : [];
  } catch {
    return [];
  }
}

export function appendHistoryRecord(record: AnswerRecord): void {
  if (typeof window === "undefined") return;

  const history = loadHistory();
  history.push(record);
  const trimmed =
    history.length > MAX_HISTORY_LENGTH ? history.slice(history.length - MAX_HISTORY_LENGTH) : history;
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
}

export function loadLearningStats(): LearningStats {
  if (typeof window === "undefined") return EMPTY_STATS;

  try {
    const raw = window.localStorage.getItem(LEARNING_STATS_STORAGE_KEY);
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

export function saveLearningStats(stats: LearningStats): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LEARNING_STATS_STORAGE_KEY, JSON.stringify(stats));
}

// Only call when the answer was non-blank — blank submissions don't count as
// "having written" toward the tree/daily totals (Phase2 spec).
export function recordWrittenAnswer(): LearningStats {
  const stats = loadLearningStats();
  const today = getLocalDateString();
  const updated: LearningStats = {
    totalAnswerCount: stats.totalAnswerCount + 1,
    dailyRecords: {
      ...stats.dailyRecords,
      [today]: (stats.dailyRecords[today] ?? 0) + 1,
    },
  };
  saveLearningStats(updated);
  return updated;
}
