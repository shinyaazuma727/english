import type { Word } from "@/types/word";
import { STORAGE_KEY } from "./constants";

export function loadWords(): Word[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
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
