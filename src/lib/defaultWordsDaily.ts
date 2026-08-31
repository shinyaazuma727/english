import { parseCsv } from "./csv";
import type { Word } from "@/types/word";

// Starter content for 日常会話 (daily conversation). Unlike the Eiken levels,
// this mixes short everyday phrases with full sentences — practical
// day-to-day English rather than exam vocabulary. Judged in "loose" mode
// (case/punctuation-insensitive, see LevelConfig.judgeMode) since both
// speech-to-text and typed full sentences vary in ways that don't matter
// here. A comma inside a field must be wrapped in double quotes for the CSV
// parser (see csv.ts).
const DEFAULT_WORDS_DAILY_CSV = `English,Japanese
Hello.,こんにちは。
Thank you.,ありがとう。
Excuse me.,すみません。
I'm sorry.,ごめんなさい。
See you later.,またあとで。
How are you?,元気ですか？
Nice to meet you.,はじめまして。
What time is it?,今何時ですか？
I'm hungry.,お腹がすきました。
I'm tired.,疲れました。
Let's go.,行きましょう。
Wait a minute.,ちょっと待ってください。
Can you help me?,手伝ってもらえますか？
Where is the bathroom?,トイレはどこですか？
How much is this?,これはいくらですか？
I usually wake up at seven.,私はたいてい7時に起きます。
"Can I have some water, please?",お水をいただけますか？
It's time to eat breakfast.,朝ごはんの時間です。
Let's clean up your toys.,おもちゃを片付けましょう。
Do you want to go outside?,外に行きたい？
I need to buy some milk.,牛乳を買わないといけません。
What do you want for lunch?,お昼ご飯は何が食べたい？
Please wash your hands.,手を洗ってね。
It's raining outside today.,今日は外は雨です。
I'll be back in a minute.,すぐ戻ります。
Can you say thank you?,「ありがとう」って言える？
Let's read a book together.,一緒に本を読もう。
It's almost bedtime.,もうすぐ寝る時間だよ。
I'm proud of you.,あなたを誇りに思うよ。
"Be careful, it's hot.",気をつけて、熱いよ。
Do you need any help?,何か手伝おうか？
I'll pick you up at three.,3時に迎えに行きます。
Let's put on your shoes.,靴を履こうね。
We're going to the park.,公園に行きます。
I love you very much.,あなたのことが大好きです。
Can you pass me that?,それを取ってもらえますか？
I'm going to the store.,お店に行ってきます。
Please speak more slowly.,もっとゆっくり話してください。
I didn't understand that.,それがわかりませんでした。
Could you say that again?,もう一度言ってもらえますか？`;

export const DEFAULT_WORDS_DAILY: Word[] = parseCsv(DEFAULT_WORDS_DAILY_CSV);
