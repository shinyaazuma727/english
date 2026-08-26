"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadWords } from "@/lib/storage";
import type { Word } from "@/types/word";
import styles from "./page.module.css";

export default function MasteredListPage() {
  const [masteredWords, setMasteredWords] = useState<Word[] | null>(null);

  useEffect(() => {
    setMasteredWords(loadWords().filter((w) => w.status === "mastered"));
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <Link href="/" className={styles.back} aria-label="HOMEへ戻る">
          ×
        </Link>
        <h1 className={styles.title}>MASTERED LIST</h1>
      </div>

      {masteredWords !== null && masteredWords.length === 0 && (
        <p className={styles.empty}>まだmasteredになった単語はありません</p>
      )}

      {masteredWords !== null && masteredWords.length > 0 && (
        <p className={styles.count}>{masteredWords.length}語</p>
      )}

      <ul className={styles.list}>
        {masteredWords?.map((word) => (
          <li key={word.id} className={styles.item}>
            <span className={styles.english}>{word.english}</span>
            <span className={styles.japanese}>{word.japanese}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
