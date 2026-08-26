import type { AnswerRecord } from "@/types/history";
import { STATS_BATCH_SIZE } from "./constants";

export type BatchAccuracy = {
  batchIndex: number;
  accuracy: number;
  correct: number;
  total: number;
};

export function calculateOverallAccuracy(history: AnswerRecord[]): number {
  if (history.length === 0) return 0;
  const correct = history.filter((r) => r.correct).length;
  return Math.round((correct / history.length) * 100);
}

export function calculateAverageElapsedMs(history: AnswerRecord[]): number {
  if (history.length === 0) return 0;
  const total = history.reduce((sum, r) => sum + r.elapsedMs, 0);
  return Math.round(total / history.length);
}

export function calculateBatchAccuracies(history: AnswerRecord[]): BatchAccuracy[] {
  const batches: BatchAccuracy[] = [];

  for (let start = 0; start + STATS_BATCH_SIZE <= history.length; start += STATS_BATCH_SIZE) {
    const batch = history.slice(start, start + STATS_BATCH_SIZE);
    const correct = batch.filter((r) => r.correct).length;
    batches.push({
      batchIndex: batches.length + 1,
      accuracy: Math.round((correct / batch.length) * 100),
      correct,
      total: batch.length,
    });
  }

  return batches;
}
