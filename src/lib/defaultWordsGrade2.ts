import { parseCsv } from "./csv";
import type { Word } from "@/types/word";

// Starter word bank for 英検2級 (Eiken Grade 2 / high-school-graduate level).
// This is a representative subset, not the full official Eiken word list —
// users can replace it any time via CSV import on the level's HOME screen.
const DEFAULT_WORDS_GRADE2_CSV = `English,Japanese
accomplish,成し遂げる
acquire,習得する
adapt,適応する
analyze,分析する
anticipate,予期する
appropriate,適切な
approximately,おおよそ
assume,想定する
characteristic,特徴
circumstance,状況
complex,複雑な
comprehensive,包括的な
consequence,結果
considerable,かなりの
consist,成り立つ
contribute,貢献する
controversy,論争
crucial,極めて重要な
definite,明確な
demonstrate,実証する
distinguish,区別する
diverse,多様な
eliminate,取り除く
emphasize,強調する
enormous,巨大な
essential,不可欠な
evaluate,評価する
evidence,証拠
exceed,超える
expand,拡大する
facilitate,促進する
feature,特徴
fundamental,基本的な
generate,生み出す
identical,同一の
illustrate,説明する
immense,計り知れない
implement,実行する
imply,暗示する
inevitable,避けられない
initiate,開始する
insight,洞察
integrate,統合する
intense,激しい
interpret,解釈する
isolate,孤立させる
justify,正当化する
maintain,維持する
obtain,得る
obvious,明白な
participate,参加する
permanent,永続的な
potential,潜在的な
predict,予測する
significant,重要な`;

export const DEFAULT_WORDS_GRADE2: Word[] = parseCsv(DEFAULT_WORDS_GRADE2_CSV);
