"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { loadLearningStats, loadWords, saveWords } from "@/lib/storage";
import { parseCsv } from "@/lib/csv";
import { calculateMasteredRatio } from "@/lib/masteredRatio";
import { getAnswersUntilNextStage, getStageProgress, getTreeStage } from "@/lib/tree";
import { getLocalDateString } from "@/lib/date";
import { TREE_STAGE_LABELS } from "@/lib/constants";
import { TreeIllustration } from "@/components/TreeIllustration";
import type { Word } from "@/types/word";
import type { LearningStats } from "@/types/stats";
import styles from "./page.module.css";

export default function HomePage() {
  const [words, setWords] = useState<Word[] | null>(null);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setWords(loadWords());
    setStats(loadLearningStats());
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
  const canStart = wordCount > 0;
  const masteredRatio = calculateMasteredRatio(words ?? []);

  const totalAnswerCount = stats?.totalAnswerCount ?? 0;
  const todayCount = stats?.dailyRecords[getLocalDateString()] ?? 0;
  const stage = getTreeStage(totalAnswerCount);
  const stageProgress = getStageProgress(totalAnswerCount);
  const answersUntilNext = getAnswersUntilNextStage(totalAnswerCount);

  return (
    <main className={styles.home}>
      <header className={styles.appBar}>
        <span className={styles.logoMark} aria-hidden="true">
          🌱
        </span>
        <h1 className={styles.title}>KAKU</h1>
      </header>

      <div className={styles.treeCard}>
        <TreeIllustration stage={stage} progress={stageProgress} />
        <p className={styles.stageLabel}>{TREE_STAGE_LABELS[stage]}</p>
        {answersUntilNext !== null && (
          <p className={styles.nextStage}>あと{answersUntilNext}回で成長します</p>
        )}
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statTile}>
          <div className={styles.todayValue}>{todayCount}</div>
          <div className={styles.statLabel}>今日書いた数</div>
        </div>

        <div className={styles.statTile}>
          <div
            className={styles.pie}
            style={{
              background: `conic-gradient(var(--color-accent) ${masteredRatio.percent}%, var(--color-surface-alt) 0)`,
            }}
          >
            <div className={styles.pieInner}>
              <div className={styles.pieValue}>{masteredRatio.percent}%</div>
              <div className={styles.pieSub}>
                {masteredRatio.masteredCount}/{masteredRatio.totalCount}
              </div>
            </div>
          </div>
          <div className={styles.statLabel}>覚えた単語の割合</div>
        </div>
      </div>

      <Link
        href="/learning"
        className={`${styles.button} ${styles.buttonPrimary}`}
        aria-disabled={!canStart}
        onClick={(event) => {
          if (!canStart) event.preventDefault();
        }}
      >
        <svg className={styles.buttonIcon} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 4v16m8-8H4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
        学習する
      </Link>

      <p className={styles.total}>累計 {totalAnswerCount.toLocaleString()}回</p>

      <div className={styles.secondaryActions}>
        <button type="button" className={styles.secondaryButton} onClick={handleImportClick}>
          <svg className={styles.secondaryIcon} viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 15V4m0 0-4 4m4-4 4 4M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>CSVインポート</span>
        </button>

        <Link href="/mastered" className={styles.secondaryButton}>
          <svg className={styles.secondaryIcon} viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="m5 13 4 4L19 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>
            MASTERED LIST
            {masteredRatio.masteredCount > 0 ? `（${masteredRatio.masteredCount}）` : ""}
          </span>
        </Link>

        <Link href="/stats" className={styles.secondaryButton}>
          <svg className={styles.secondaryIcon} viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5 19V9m7 10V5m7 14v-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>統計</span>
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
