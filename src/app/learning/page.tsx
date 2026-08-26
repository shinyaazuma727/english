"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { appendHistoryRecord, loadWords, recordWrittenAnswer, saveWords } from "@/lib/storage";
import { pickNextWord } from "@/lib/pool";
import { applyAnswerResult } from "@/lib/judge";
import { isCorrectAnswer, normalizeAnswer } from "@/lib/answer";
import { speakEnglish } from "@/lib/speech";
import { NEXT_DELAY_MS } from "@/lib/constants";
import type { Word } from "@/types/word";
import styles from "./page.module.css";

type Phase = "answering" | "result";

export default function LearningPage() {
  const [loaded, setLoaded] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [phase, setPhase] = useState<Phase>("answering");
  const [resultCorrect, setResultCorrect] = useState<boolean | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [answerCount, setAnswerCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const initial = loadWords();
    setWords(initial);
    setCurrentWord(pickNextWord(initial, null));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (phase === "answering") {
      inputRef.current?.focus();
    }
  }, [currentWord, phase]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== "answering" || !currentWord) return;

    startTimeRef.current = Date.now();
    setElapsedMs(0);
    const intervalId = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 100);

    return () => clearInterval(intervalId);
  }, [currentWord, phase]);

  const handleSubmit = useCallback(() => {
    if (phase !== "answering" || !currentWord) return;

    const correct = isCorrectAnswer(inputValue, currentWord.english);
    const takenMs = Date.now() - startTimeRef.current;
    const updatedWord = applyAnswerResult(currentWord, correct);
    const nextWords = words.map((w) => (w.id === updatedWord.id ? updatedWord : w));

    setWords(nextWords);
    saveWords(nextWords);
    appendHistoryRecord({ correct, elapsedMs: takenMs, timestamp: Date.now() });
    if (normalizeAnswer(inputValue).length > 0) {
      // Blank submissions aren't "writing" — Phase2 tree/daily totals exclude them.
      recordWrittenAnswer();
    }
    setResultCorrect(correct);
    setElapsedMs(takenMs);
    setPhase("result");
    setAnswerCount((count) => count + 1);
    speakEnglish(currentWord.english);

    timeoutRef.current = setTimeout(() => {
      setCurrentWord(pickNextWord(nextWords, currentWord.id));
      setInputValue("");
      setResultCorrect(null);
      setPhase("answering");
    }, NEXT_DELAY_MS);
  }, [phase, currentWord, inputValue, words]);

  if (!loaded) {
    return <main className={styles.screen} />;
  }

  if (words.length === 0) {
    return (
      <main className={styles.empty}>
        <p>単語データがありません</p>
        <Link href="/" className={styles.emptyLink}>
          HOMEへ戻る
        </Link>
      </main>
    );
  }

  return (
    <main className={styles.screen}>
      <Link href="/" className={styles.home} aria-label="HOMEへ戻る">
        ×
      </Link>

      <div className={styles.timer} aria-hidden="true">
        {(elapsedMs / 1000).toFixed(1)}s
      </div>

      <div className={styles.japanese}>{currentWord?.japanese ?? ""}</div>

      <div className={styles.answerWrap}>
        <input
          ref={inputRef}
          className={`${styles.answerInput} ${
            phase === "result" ? (resultCorrect ? styles.correctLine : styles.incorrectLine) : ""
          }`}
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSubmit();
          }}
          disabled={phase !== "answering"}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <button
        type="button"
        className={styles.checkButton}
        onClick={handleSubmit}
        disabled={phase !== "answering"}
        aria-label="回答する"
      >
        <span key={answerCount} className={styles.checkIcon}>
          ✓
        </span>
      </button>

      <div
        className={`${styles.resultArea} ${phase === "result" ? styles.visible : ""}`}
        aria-live="polite"
      >
        {currentWord && (
          <div key={`${currentWord.id}-${answerCount}`} className={styles.resultContent}>
            <div
              className={`${styles.resultMark} ${
                resultCorrect ? styles.correct : styles.incorrect
              }`}
            >
              {resultCorrect ? "○" : "×"}
            </div>
            <div className={styles.correctWord}>{currentWord.english}</div>
          </div>
        )}
      </div>
    </main>
  );
}
