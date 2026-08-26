export type WordStatus = "learning" | "mastered";

export type Word = {
  id: string;
  english: string;
  japanese: string;
  status: WordStatus;
  correctCount: number;
};
