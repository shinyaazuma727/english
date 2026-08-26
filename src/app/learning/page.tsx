"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadWords, saveWords } from "@/lib/storage";
import { pickNextWord } from "@/lib/pool";
import { applyAnswerResult } from "@/lib/judge";
import { isCorrectAnswer } from "@/lib/answer";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleSubmit = useCallback(() => {
    if (phase !== "answering" || !currentWord) return;

    const correct = isCorrectAnswer(inputValue, currentWord.english);
    const updatedWord = applyAnswerResult(currentWord, correct);
    const nextWords = words.map((w) => (w.id === updatedWord.id ? updatedWord : w));

    setWords(nextWords);
    saveWords(nextWords);
    setResultCorrect(correct);
    setPhase("result");
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

      <div className={styles.japanese}>{currentWord?.japanese ?? ""}</div>

      <div className={styles.answerWrap}>
        <input
          ref={inputRef}
          className={styles.answerInput}
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
        ✓
      </button>

      <div
        className={`${styles.resultArea} ${phase === "result" ? styles.visible : ""}`}
        aria-live="polite"
      >
        {currentWord && (
          <>
            <div
              className={`${styles.resultMark} ${
                resultCorrect ? styles.correct : styles.incorrect
              }`}
            >
              {resultCorrect ? "○" : "×"}
            </div>
            <div className={styles.correctWord}>{currentWord.english}</div>
          </>
        )}
      </div>
    </main>
  );
}
