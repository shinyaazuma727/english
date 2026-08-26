"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { loadWords, saveWords } from "@/lib/storage";
import { parseCsv } from "@/lib/csv";
import type { Word } from "@/types/word";
import styles from "./page.module.css";

export default function HomePage() {
  const [words, setWords] = useState<Word[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setWords(loadWords());
  }, []);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const imported = parseCsv(text);
      if (imported.length === 0) return;

      const existing = loadWords();
      if (existing.length > 0) {
        const confirmed = window.confirm(
          `既存の単語データ（${existing.length}件）を上書きします。よろしいですか？\n学習の進捗もリセットされます。`
        );
        if (!confirmed) return;
      }

      saveWords(imported);
      setWords(imported);
    };
    reader.readAsText(file);
  }

  const wordCount = words?.length ?? 0;
  const masteredCount = words?.filter((w) => w.status === "mastered").length ?? 0;
  const canStart = wordCount > 0;

  return (
    <main className={styles.home}>
      <h1 className={styles.title}>KAKU</h1>

      <div className={styles.actions}>
        <Link
          href="/learning"
          className={`${styles.button} ${styles.buttonPrimary}`}
          aria-disabled={!canStart}
          onClick={(event) => {
            if (!canStart) event.preventDefault();
          }}
        >
          学習開始
        </Link>

        <button type="button" className={styles.button} onClick={handleImportClick}>
          CSVインポート
        </button>

        <Link href="/mastered" className={styles.button}>
          MASTERED LIST{masteredCount > 0 ? `（${masteredCount}）` : ""}
        </Link>
      </div>

      {words !== null && wordCount === 0 && (
        <p className={styles.hint}>CSVをインポートすると学習を開始できます</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        className={styles.hiddenInput}
      />
    </main>
  );
}
