"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { loadLearningStats, loadWords, saveWords } from "@/lib/storage";
import { parseCsv } from "@/lib/csv";
import { calculateMasteredRatio } from "@/lib/masteredRatio";
import { getTreeStage, getWordsUntilNextStage } from "@/lib/tree";
import { getLocalDateString } from "@/lib/date";
import { getLevelConfig, TREE_STAGE_LABELS } from "@/lib/constants";
import { TreeIllustration } from "@/components/TreeIllustration";
import type { Word } from "@/types/word";
import type { LearningStats } from "@/types/stats";
import styles from "./page.module.css";

export default function LevelHomePage() {
  const params = useParams<{ level: string }>();
  const levelId = params.level;
  const level = getLevelConfig(levelId);

  const [words, setWords] = useState<Word[] | null>(null);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!level) return;
    setWords(loadWords(levelId));
    setStats(loadLearningStats(levelId));
  }, [level, levelId]);

  if (!level) {
    return (
      <main className={styles.home}>
        <p className={styles.hint}>不明な級です</p>
        <Link href="/" className={`${styles.button} ${styles.buttonPrimary}`}>
          HOMEへ戻る
        </Link>
      </main>
    );
  }

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

      const existing = loadWords(levelId);
      if (existing.length > 0) {
        const confirmed = window.confirm(
          `既存の${level!.label}の単語データ（${existing.length}件）を上書きします。よろしいですか？\n学習の進捗もリセットされます。`
        );
        if (!confirmed) return;
      }

      saveWords(levelId, imported);
      setWords(imported);
    };
    reader.readAsText(file);
  }

  const wordCount = words?.length ?? 0;
  const canStart = wordCount > 0;
  const masteredRatio = calculateMasteredRatio(words ?? []);

  const totalAnswerCount = stats?.totalAnswerCount ?? 0;
  const todayCount = stats?.dailyRecords[getLocalDateString()] ?? 0;
  const stage = getTreeStage(masteredRatio.percent);
  const wordsUntilNext = getWordsUntilNextStage(masteredRatio.masteredCount, masteredRatio.totalCount);

  return (
    <main className={styles.home}>
      <header className={styles.appBar}>
        <Link href="/" className={styles.levelSwitch} aria-label="級を切り替える">
          <span aria-hidden="true">←</span>
        </Link>
        <h1 className={styles.title}>KAKU</h1>
        <span className={styles.levelBadge}>{level.label}</span>
      </header>

      <div className={styles.treeCard}>
        <TreeIllustration stage={stage} percent={masteredRatio.percent} />
        {masteredRatio.totalCount > 0 && (
          <p className={styles.masteredCount}>{masteredRatio.masteredCount}語 育ちました</p>
        )}
        <p className={styles.stageLabel}>{TREE_STAGE_LABELS[stage]}</p>
        {wordsUntilNext !== null && (
          <p className={styles.nextStage}>あと{wordsUntilNext}語覚えると成長します</p>
        )}
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statTile}>
          <div className={styles.todayValue}>{todayCount}</div>
          <div className={styles.statLabel}>今日書いた数</div>
        </div>

        <div className={styles.statTile}>
          <div className={styles.todayValue}>
            {masteredRatio.masteredCount}/{masteredRatio.totalCount}
          </div>
          <div className={styles.statLabel}>覚えた単語</div>
        </div>
      </div>

      <Link
        href={`/${levelId}/learning`}
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
        学習開始
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
          <span>{level.materialLabel} CSVインポート</span>
        </button>

        <Link href={`/${levelId}/mastered`} className={styles.secondaryButton}>
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

        <Link href={`/${levelId}/stats`} className={styles.secondaryButton}>
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

        <Link href="/guide" className={styles.secondaryButton}>
          <svg className={styles.secondaryIcon} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5v.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
          </svg>
          <span>使い方の手引き</span>
        </Link>
      </div>

      {words !== null && wordCount === 0 && (
        <p className={styles.hint}>{level.materialLabel}のCSVをインポートすると学習を開始できます</p>
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
