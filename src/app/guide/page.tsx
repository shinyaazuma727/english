import Link from "next/link";
import { TreeIllustration } from "@/components/TreeIllustration";
import { TREE_GROWTH_THRESHOLDS, TREE_STAGE_LABELS } from "@/lib/constants";
import styles from "./page.module.css";

const NEXT_THRESHOLDS = [...TREE_GROWTH_THRESHOLDS.slice(1), 100];

const STAGE_DESCRIPTIONS = [
  "学習をはじめたばかりの状態です。",
  "少しずつ単語が身についてきました。",
  "覚えた単語が増え、木らしい形になってきました。",
  "かなりの単語を覚え、葉が茂ってきました。",
  "教材の単語をほぼ覚えた状態。花が咲きます。",
];

export default function GuidePage() {
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <Link href="/" className={styles.back} aria-label="HOMEへ戻る">
          ×
        </Link>
        <h1 className={styles.title}>使い方の手引き</h1>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>KAKUとは</h2>
        <p className={styles.text}>
          KAKUは、Apple Pencil（または手書き入力）で英単語を実際に書きながら覚える、英単語学習アプリです。
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>使い方</h2>
        <ol className={styles.steps}>
          <li>HOMEで学習する級（準2級・2級）を選びます。</li>
          <li>表示された日本語に合う英単語を、入力欄に手書き（または入力）します。</li>
          <li>✓ボタンを押すと採点され、正解は○、不正解は×で表示されます。</li>
          <li>正解の英単語が表示され、発音を聞いたあと自動的に次の問題に進みます。</li>
          <li>同じ単語に3回連続で正解すると「mastered（覚えた単語）」になります。</li>
          <li>mastered後に間違えると、その単語はまた学習中に戻ります。</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>木の成長について</h2>
        <p className={styles.text}>
          その級で覚えた単語（mastered）の割合が増えるほど、HOMEの木が育っていきます。準2級・2級はそれぞれ別の木として、独立して成長します。
        </p>

        <div className={styles.stageRow}>
          {TREE_STAGE_LABELS.map((label, index) => (
            <div key={label} className={styles.stageItem}>
              <div className={styles.stageIconBox}>
                <div className={styles.stageIconInner}>
                  <TreeIllustration stage={index} percent={TREE_GROWTH_THRESHOLDS[index]} showRing={false} showPercent={false} />
                </div>
              </div>
              <p className={styles.stageThreshold}>
                {TREE_GROWTH_THRESHOLDS[index]}%〜{NEXT_THRESHOLDS[index]}%
              </p>
              <p className={styles.stageLabel}>{label}</p>
              <p className={styles.stageDescription}>{STAGE_DESCRIPTIONS[index]}</p>
            </div>
          ))}
        </div>

        <p className={styles.hint}>
          覚えた単語が増えるたびに、木が少しずつ成長していきます。毎日HOME画面を開くのが楽しみになりますように。
        </p>
      </section>
    </main>
  );
}
