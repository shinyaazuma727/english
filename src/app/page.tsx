import Link from "next/link";
import { LEVELS } from "@/lib/constants";
import styles from "./page.module.css";

export default function LevelPickerPage() {
  return (
    <main className={styles.picker}>
      <header className={styles.appBar}>
        <span className={styles.logoMark} aria-hidden="true">
          🌱
        </span>
        <h1 className={styles.title}>KAKU</h1>
      </header>

      <p className={styles.subtitle}>級を選んでください</p>

      <div className={styles.levelList}>
        {LEVELS.map((level) => (
          <Link key={level.id} href={`/${level.id}`} className={styles.levelButton}>
            {level.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
