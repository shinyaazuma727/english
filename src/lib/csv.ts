import type { Word } from "@/types/word";

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function splitLines(text: string): string[] {
  return text.split(/\r\n|\r|\n/);
}

function parseCsvLine(line: string): string[] {
  return line.split(",").map((cell) => {
    const trimmed = cell.trim();
    if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return trimmed.slice(1, -1).trim();
    }
    return trimmed;
  });
}

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return `w_${Date.now()}_${idCounter}_${Math.random().toString(36).slice(2, 8)}`;
}

export function parseCsv(text: string): Word[] {
  const lines = splitLines(stripBom(text));
  const words: Word[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const [english, japanese, emoji] = parseCsvLine(line);
    if (!english || !japanese) continue;
    if (english.toLowerCase() === "english" && japanese.toLowerCase() === "japanese") continue;

    words.push({
      id: generateId(),
      english,
      japanese,
      status: "learning",
      correctCount: 0,
      ...(emoji ? { emoji } : {}),
    });
  }

  return words;
}
