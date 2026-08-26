export function normalizeAnswer(value: string): string {
  return value.replace(/\s+/g, "");
}

export function isCorrectAnswer(input: string, correctEnglish: string): boolean {
  return normalizeAnswer(input) === normalizeAnswer(correctEnglish);
}
