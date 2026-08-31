import { parseCsv } from "./csv";
import type { Word } from "@/types/word";

// Starter word bank for 英検準2級 (Eiken Pre-2 / high-school-entry level).
// This is a representative subset, not the full official Eiken word list —
// users can replace it any time via CSV import on the level's HOME screen.
const DEFAULT_WORDS_PRE2_CSV = `English,Japanese
decide,決める
improve,改善する
increase,増える
decrease,減る
produce,生産する
provide,提供する
achieve,達成する
encourage,励ます
prevent,防ぐ
communicate,意思疎通する
focus,集中する
exist,存在する
admire,感心する
appreciate,感謝する
mention,言及する
remind,思い出させる
suggest,提案する
imagine,想像する
prepare,準備する
protect,守る
active,活発な
careful,注意深い
comfortable,快適な
convenient,便利な
dangerous,危険な
difficult,難しい
various,様々な
similar,似ている
particular,特定の
necessary,必要な
popular,人気のある
common,一般的な
several,いくつかの
probably,おそらく
actually,実際は
recently,最近
especially,特に
environment,環境
temperature,気温
government,政府
information,情報
experience,経験
opportunity,機会
technology,技術
culture,文化
disease,病気
energy,エネルギー
population,人口
product,製品
quality,質
research,研究
society,社会
medicine,薬
purpose,目的
development,発展`;

export const DEFAULT_WORDS_PRE2: Word[] = parseCsv(DEFAULT_WORDS_PRE2_CSV);
