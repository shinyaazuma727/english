"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { loadHistory } from "@/lib/storage";
import { calculateAverageElapsedMs, calculateBatchAccuracies, calculateOverallAccuracy } from "@/lib/stats";
import { STATS_BATCH_SIZE } from "@/lib/constants";
import type { AnswerRecord } from "@/types/history";
import styles from "./page.module.css";

export default function StatsPage() {
  const params = useParams<{ level: string }>();
  const levelId = params.level;
  const [history, setHistory] = useState<AnswerRecord[] | null>(null);

  useEffect(() => {
    setHistory(loadHistory(levelId));
  }, [levelId]);

  if (history === null) {
    return <main className={styles.page} />;
  }

  if (history.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.header}>
          <Link href={`/${levelId}`} className={styles.back} aria-label="HOMEへ戻る">
            ×
          </Link>
          <h1 className={styles.title}>統計</h1>
        </div>
        <p className={styles.empty}>まだ回答データがありません</p>
      </main>
    );
  }

  const overallAccuracy = calculateOverallAccuracy(history);
  const averageElapsedMs = calculateAverageElapsedMs(history);
  const batches = calculateBatchAccuracies(history);
  const inProgressCount = history.length % STATS_BATCH_SIZE;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <Link href={`/${levelId}`} className={styles.back} aria-label="HOMEへ戻る">
          ×
        </Link>
        <h1 className={styles.title}>統計</h1>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <div className={styles.summaryValue}>{overallAccuracy}%</div>
          <div className={styles.summaryLabel}>正答率</div>
        </div>
        <div className={styles.summaryItem}>
          <div className={styles.summaryValue}>{history.length}</div>
          <div className={styles.summaryLabel}>回答数</div>
        </div>
        <div className={styles.summaryItem}>
          <div className={styles.summaryValue}>{(averageElapsedMs / 1000).toFixed(1)}s</div>
          <div className={styles.summaryLabel}>平均回答時間</div>
        </div>
      </div>

      <section className={styles.chartSection}>
        <h2 className={styles.chartTitle}>{STATS_BATCH_SIZE}問ごとの正答率</h2>

        {batches.length === 0 ? (
          <p className={styles.chartHint}>
            あと{STATS_BATCH_SIZE - inProgressCount}問でグラフが表示されます
          </p>
        ) : (
          <div className={styles.chartScroll}>
            <div className={styles.chart}>
              {batches.map((batch) => (
                <div key={batch.batchIndex} className={styles.bar}>
                  <div className={styles.barValue}>{batch.accuracy}%</div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ height: `${batch.accuracy}%` }} />
                  </div>
                  <div className={styles.barLabel}>{batch.batchIndex}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {inProgressCount > 0 && (
          <p className={styles.chartHint}>
            現在 {inProgressCount}/{STATS_BATCH_SIZE} 問（あと{STATS_BATCH_SIZE - inProgressCount}問で次のバーが追加されます）
          </p>
        )}
      </section>
    </main>
  );
}
