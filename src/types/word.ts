export type WordStatus = "learning" | "mastered";

export type Word = {
  id: string;
  english: string;
  japanese: string;
  status: WordStatus;
  correctCount: number;
  // Optional single-glyph illustration shown on the learning card to make
  // the Japanese prompt easier to recognize at a glance. Absent for words
  // with no clear one-glyph match, or for CSVs imported without a 3rd column.
  emoji?: string;
};
