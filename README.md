# KAKU

Apple Pencilで英単語を手書きしながら覚えるための英語学習アプリです。

KAKUの目的は「英単語を書く回数を増やすこと」だけです。多機能な単語アプリを目指さず、

```
日本語を見る → Apple Pencilで書く → ✓ → ○×を見る → 発音を聞く → 次の問題
```

という流れに集中できることを最優先にしています。

Phase1（毎日実際に使える最小限の学習機能）に加え、Phase2（HOMEでの学習量の可視化：木の成長・今日/累計の学習数・mastered率の円グラフ）を実装しています。LEARNING画面は集中を妨げないよう、Phase2の統計表示は追加していません。

## 技術構成

- Next.js（App Router）
- React / TypeScript
- CSS（CSS Modules、外部UIライブラリなし）
- localStorage（データ保存）
- Web Speech API（発音）
- iPadOS Scribble（手書き入力。通常のHTML `<input>` へApple Pencilで書き込む方式）
- PWA（ホーム画面への追加を想定した manifest 対応）

Redux/Zustand/Tailwind/外部DB/AI APIなどは使用していません。

## 開発環境の起動方法

```bash
npm install
npm run dev
```

`http://localhost:3000` を開いてください（ポートが使用中の場合は自動で別ポートになります）。

## ビルド方法

```bash
npm run build
npm run start
```

## Vercelへのデプロイ方法

1. このリポジトリをVercelにインポートします。
2. `kaku` ディレクトリを Project の Root Directory として指定します（モノレポ内にある場合）。
3. ビルドコマンド・出力設定はNext.jsの標準のままで問題ありません（環境変数・外部DBは不要です）。
4. Deployを実行します。

## デフォルトの単語データ

初回起動時（localStorageに何も保存されていない状態）は、`src/lib/defaultWords.ts` に埋め込まれた小学校6年生レベルの単語302語が自動でセットされ、CSVインポートなしでそのまま「学習開始」できます。この単語リストの元データは `public/words-elementary6.csv` です（数・色・動物・食べ物・家族・学校・教科・曜日・月・天気・体・気持ち・基本動詞・場所・スポーツ・職業・乗り物・疑問詞・時間・国・服・自然、など）。

このリストを変更したい場合は `public/words-elementary6.csv` を編集し、`node scripts/gen-default-words.mjs` を実行して `src/lib/defaultWords.ts` を再生成してください。

## CSV形式

2列（English, Japanese）のCSVをHOME画面からインポートします。独自の単語リストに切り替えたい場合はCSVインポートで上書きできます（`public/words-elementary6.csv` をそのままインポート用CSVとしても使えます）。

```csv
English,Japanese
prevent,防ぐ
accept,受け入れる
```

3列目に絵文字を1つ入れると、LEARNING画面の問題カードにイラストとして表示されます（省略可）。

```csv
English,Japanese,Emoji
apple,りんご,🍎
prevent,防ぐ
```

- UTF-8 / UTF-8 BOM、CRLF / LF / CR に対応しています。
- ヘッダー行・空行はスキップされます。
- 列が揃っていない不正な行はスキップされ、有効な行のみ登録されます。
- 3列目（Emoji）が無い行・空の行はイラストなしで登録されます（学習・判定には影響しません）。
- 既存データがある状態で再インポートすると、**学習の進捗を含めて完全に上書き**されます（確認ダイアログあり）。

## データ保存について

学習データ（単語・正解数・mastered状態）はサーバーやクラウドではなく、**ブラウザのlocalStorage**（キー: `kaku_words`）に保存されます。ブラウザやPWAを閉じても直前までの進捗は保持されますが、別端末・別ブラウザとは共有されません。

Phase2の「どれだけ書いたか」の記録は別キー `kaku_learning_stats`（累計回答数・日ごとの回答数）に保存しており、`kaku_words` とは独立しています。そのためCSVを再インポートして単語帳を入れ替えても、木の成長・今日/累計の学習数は維持されます（空欄回答はどちらのカウントにも含まれません）。判定の正答率グラフ用の生ログは `kaku_history` に保存しています（`/stats` 画面用）。

## 木の成長段階

HOMEの木は「累計で何回書いたか」（`kaku_learning_stats` の `totalAnswerCount`。空欄提出は含みません）だけで育ちます。正解・不正解は問いません。段階のしきい値は `src/lib/constants.ts` の `TREE_GROWTH_STAGES` に集約しています（初期値: 0 / 30 / 100 / 300 / 700 / 1500回）。

## 前提デバイス

最重要デバイスは **iPad + Apple Pencil** です。iPadOS標準のScribble機能を使い、通常のテキスト入力欄へ手書きすると自動でテキストに変換される方式を採用しています。独自のCanvas手書き認識やOCR APIは使用していません。PCでも最低限利用できますが、レイアウト・操作性はiPadでの利用を優先して設計しています。

## iPad実機確認項目

ブラウザ環境だけでは確認できないiPadOS固有の挙動があるため、実機での確認をお願いします。

1. Apple PencilでScribble入力できるか
2. 問題表示直後に書き始められるか
3. オートフォーカスが自然に働くか
4. ソフトウェアキーボードが表示された際に邪魔にならないか
5. 入力線（回答欄）が書きやすい太さ・長さか
6. ✓ボタンが押しやすいか（現在88px四方）
7. ○×が見やすいか
8. 正解英単語の表示が見やすいか
9. 発音のタイミングが自然か
10. 判定から次の問題までの間隔（1000ms）が適切か
11. 問題ごとに画面内の要素の位置が動かないか
12. PWAとしてホーム画面に追加し、standaloneで利用できるか
13. HOME画面の木・円グラフ・数値がiPad縦向き/横向きで崩れず収まるか

特に3・4（オートフォーカスとソフトウェアキーボードの干渉）はiOS Safari側の挙動に依存するため、Scribbleの動作を壊すような強引な回避処理は実装していません。実機での見え方次第で `src/app/learning/page.module.css` の調整が必要になる可能性があります。

## UI調整

LEARNING画面の主要な見た目の数値は `src/app/globals.css` のCSS変数に集約しています。ロジックを変更せずに調整できます。

```css
--emoji-size
--japanese-font-size
--answer-font-size
--answer-line-width
--answer-line-thickness
--answer-line-color
--check-button-size
--result-mark-size
```

学習ロジック側の定数（NEXT_DELAY_MS、MASTERED_CORRECT_COUNT、MASTERED_REVIEW_RATIO）は `src/lib/constants.ts` に集約しています。
