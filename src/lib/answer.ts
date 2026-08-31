export function normalizeAnswer(value: string): string {
  return value.replace(/\s+/g, "");
}

// iPadOS Scribble sometimes capitalizes the first letter of handwritten input
// regardless of autocapitalize/autocorrect/spellcheck being off on the field
// (a longstanding WebKit limitation — Scribble's sentence-start detection runs
// ahead of the page's own input attributes and isn't something the page can
// suppress). Forgiving a mismatch that is EXACTLY "first letter case differs,
// everything else identical" absorbs that specific failure mode without
// making the judge case-insensitive in general — a word that genuinely
// requires a different letter, or differs in case anywhere but the first
// letter, still fails.
function isFirstLetterCapitalizationOnlyMismatch(input: string, correct: string): boolean {
  if (input.length !== correct.length || input.length === 0) return false;
  if (input.slice(1) !== correct.slice(1)) return false;
  return input[0] !== correct[0] && input[0].toLowerCase() === correct[0].toLowerCase();
}

export function isCorrectAnswer(input: string, correctEnglish: string): boolean {
  const normalizedInput = normalizeAnswer(input);
  const normalizedCorrect = normalizeAnswer(correctEnglish);
  if (normalizedInput === normalizedCorrect) return true;
  return isFirstLetterCapitalizationOnlyMismatch(normalizedInput, normalizedCorrect);
}

// Phrase/sentence-level content (LevelConfig.judgeMode "loose") needs a much
// more tolerant comparison than single words: both speech-to-text output and
// typed full sentences vary in case, punctuation, and spacing in ways that
// carry no real difference in meaning, so those are ignored entirely here.
function normalizeForLooseMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[.,!?;:'"’”()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isCorrectAnswerLoose(input: string, correctEnglish: string): boolean {
  return normalizeForLooseMatch(input) === normalizeForLooseMatch(correctEnglish);
}
