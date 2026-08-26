import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const csv = fs.readFileSync(path.join(root, "public/words-elementary6.csv"), "utf8").trim();

const escaped = csv.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

const ts = `import { parseCsv } from "./csv";
import type { Word } from "@/types/word";

// Source of truth for this list: public/words-elementary6.csv (kept in sync manually).
// Covers common Japanese elementary-school (6th grade level) vocabulary categories:
// numbers, colors, animals, food, family, school items, subjects, days/months,
// weather, body parts, feelings, basic verbs, places, sports, jobs, transportation,
// question words, time, countries, clothes, and nature.
const DEFAULT_WORDS_CSV = \`${escaped}\`;

export const DEFAULT_WORDS: Word[] = parseCsv(DEFAULT_WORDS_CSV);
`;

fs.writeFileSync(path.join(root, "src/lib/defaultWords.ts"), ts);
console.log("wrote src/lib/defaultWords.ts", ts.length, "chars");
