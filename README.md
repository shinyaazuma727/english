# KAKU

Apple Pencilで英単語を手書きしながら覚えるための英語学習アプリです。

KAKUの目的は「英単語を書く回数を増やすこと」だけです。多機能な単語アプリを目指さず、

```
日本語を見る → Apple Pencilで書く → ✓ → ○×を見る → 発音を聞く → 次の問題
```

という流れに集中できることを最優先にしています。

現在はPhase1（毎日実際に使える最小限の学習機能）のみを実装しています。

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

## CSV形式

2列（English, Japanese）のCSVをHOME画面からインポートします。

```csv
English,Japanese
prevent,防ぐ
accept,受け入れる
```

- UTF-8 / UTF-8 BOM、CRLF / LF / CR に対応しています。
- ヘッダー行・空行はスキップされます。
- 列が揃っていない不正な行はスキップされ、有効な行のみ登録されます。
- 既存データがある状態で再インポートすると、**学習の進捗を含めて完全に上書き**されます（確認ダイアログあり）。

## データ保存について

学習データ（単語・正解数・mastered状態）はサーバーやクラウドではなく、**ブラウザのlocalStorage**（キー: `kaku_words`）に保存されます。ブラウザやPWAを閉じても直前までの進捗は保持されますが、別端末・別ブラウザとは共有されません。

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

特に3・4（オートフォーカスとソフトウェアキーボードの干渉）はiOS Safari側の挙動に依存するため、Scribbleの動作を壊すような強引な回避処理は実装していません。実機での見え方次第で `src/app/learning/page.module.css` の調整が必要になる可能性があります。

## UI調整

LEARNING画面の主要な見た目の数値は `src/app/globals.css` のCSS変数に集約しています。ロジックを変更せずに調整できます。

```css
--japanese-font-size
--answer-font-size
--answer-line-width
--answer-line-thickness
--answer-line-color
--check-button-size
--result-mark-size
```

学習ロジック側の定数（NEXT_DELAY_MS、MASTERED_CORRECT_COUNT、MASTERED_REVIEW_RATIO）は `src/lib/constants.ts` に集約しています。
