import type { Word } from "@/types/word";

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function splitLines(text: string): string[] {
  return text.split(/\r\n|\r|\n/);
}

// Quote-aware split: sentence-level content (日常会話 etc.) routinely
// contains commas inside a field (e.g. "Can I have some water, please?"),
// so a plain line.split(",") would corrupt those rows. Wrap such a field in
// "double quotes" in the CSV; "" inside a quoted field escapes to a literal ".
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"' && current.trim() === "") {
      inQuotes = true;
    } else if (char === ",") {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
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
