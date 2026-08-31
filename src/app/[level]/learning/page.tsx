"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { appendHistoryRecord, loadWords, recordWrittenAnswer, saveWords } from "@/lib/storage";
import { pickNextWord } from "@/lib/pool";
import { applyAnswerResult } from "@/lib/judge";
import { isCorrectAnswer, isCorrectAnswerLoose, normalizeAnswer } from "@/lib/answer";
import { isSpeechRecognitionSupported, listenForSpokenAnswer, speakEnglish } from "@/lib/speech";
import { ANSWER_TIMEOUT_MS, NEXT_DELAY_MS, getLevelConfig } from "@/lib/constants";
import type { Word } from "@/types/word";
import styles from "./page.module.css";

type Phase = "answering" | "result";

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function LearningPage() {
  const params = useParams<{ level: string }>();
  const levelId = params.level;
  const level = getLevelConfig(levelId);
  const judge = level?.judgeMode === "loose" ? isCorrectAnswerLoose : isCorrectAnswer;
  const [loaded, setLoaded] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [phase, setPhase] = useState<Phase>("answering");
  const [resultCorrect, setResultCorrect] = useState<boolean | null>(null);
  const [remainingMs, setRemainingMs] = useState(ANSWER_TIMEOUT_MS);
  const [answerCount, setAnswerCount] = useState(0);
  const [micSupported, setMicSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deadlineRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);
  const inputValueRef = useRef("");
  const stopListeningRef = useRef<(() => void) | null>(null);
  // Guards against the ✓ button and the 15s timeout both resolving the same
  // question (e.g. a click landing right as the deadline timer fires).
  const resolvedRef = useRef(false);

  useEffect(() => {
    setMicSupported(isSpeechRecognitionSupported());
  }, []);

  const stopListening = useCallback(() => {
    stopListeningRef.current?.();
    stopListeningRef.current = null;
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  const handleMicClick = useCallback(() => {
    if (phase !== "answering" || isListening) return;

    const stop = listenForSpokenAnswer({
      onResult: (transcript) => {
        setInputValue(transcript);
        inputValueRef.current = transcript;
      },
      onError: () => {
        stopListeningRef.current = null;
        setIsListening(false);
      },
      onEnd: () => {
        stopListeningRef.current = null;
        setIsListening(false);
      },
    });
    if (!stop) return;
    stopListeningRef.current = stop;
    setIsListening(true);
  }, [phase, isListening]);

  useEffect(() => {
    const initial = loadWords(levelId);
    setWords(initial);
    setCurrentWord(pickNextWord(initial, null));
    setLoaded(true);
  }, [levelId]);

  useEffect(() => {
    if (phase === "answering") {
      inputRef.current?.focus();
    }
  }, [currentWord, phase]);

  useEffect(() => {
    return () => {
      if (advanceRef.current) clearTimeout(advanceRef.current);
    };
  }, []);

  // Resolves the current question exactly once, whether triggered by the ✓
  // button or by the 15s timeout. `correct` is decided by the caller —
  // timeout always passes false.
  const resolve = useCallback(
    (correct: boolean) => {
      if (resolvedRef.current || phase !== "answering" || !currentWord) return;
      resolvedRef.current = true;
      stopListening();

      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      if (deadlineRef.current) {
        clearTimeout(deadlineRef.current);
        deadlineRef.current = null;
      }

      const takenMs = Date.now() - startTimeRef.current;
      const updatedWord = applyAnswerResult(currentWord, correct);
      const nextWords = words.map((w) => (w.id === updatedWord.id ? updatedWord : w));

      setWords(nextWords);
      saveWords(levelId, nextWords);
      appendHistoryRecord(levelId, { correct, elapsedMs: takenMs, timestamp: Date.now() });
      if (normalizeAnswer(inputValueRef.current).length > 0) {
        // Blank submissions aren't "writing" — Phase2 tree/daily totals exclude them.
        recordWrittenAnswer(levelId);
      }
      setResultCorrect(correct);
      setPhase("result");
      setAnswerCount((count) => count + 1);
      speakEnglish(currentWord.english);

      advanceRef.current = setTimeout(() => {
        setCurrentWord(pickNextWord(nextWords, currentWord.id));
        setInputValue("");
        inputValueRef.current = "";
        setResultCorrect(null);
        setPhase("answering");
      }, NEXT_DELAY_MS);
    },
    [phase, currentWord, words, levelId, stopListening]
  );

  // Starts (and fully resets) the 15s answer-limit timer whenever a new
  // question becomes answerable. Torn down on every phase/word change so a
  // stale timer can never fire into the next question.
  useEffect(() => {
    if (phase !== "answering" || !currentWord) return;

    resolvedRef.current = false;
    startTimeRef.current = Date.now();
    setRemainingMs(ANSWER_TIMEOUT_MS);

    tickIntervalRef.current = setInterval(() => {
      setRemainingMs(Math.max(0, ANSWER_TIMEOUT_MS - (Date.now() - startTimeRef.current)));
    }, 100);

    deadlineRef.current = setTimeout(() => {
      resolve(false);
    }, ANSWER_TIMEOUT_MS);

    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      if (deadlineRef.current) clearTimeout(deadlineRef.current);
      tickIntervalRef.current = null;
      deadlineRef.current = null;
    };
  }, [currentWord, phase, resolve]);

  const handleSubmit = useCallback(() => {
    if (phase !== "answering" || !currentWord) return;
    resolve(judge(inputValue, currentWord.english));
  }, [phase, currentWord, inputValue, resolve, judge]);

  if (!loaded) {
    return <main className={styles.screen} />;
  }

  if (words.length === 0) {
    return (
      <main className={styles.empty}>
        <p>単語データがありません</p>
        <Link href={`/${levelId}`} className={styles.emptyLink}>
          HOMEへ戻る
        </Link>
      </main>
    );
  }

  return (
    <main className={styles.screen}>
      <Link href={`/${levelId}`} className={styles.home} aria-label="HOMEへ戻る">
        <span aria-hidden="true">×</span>
      </Link>

      <div className={styles.timer} aria-hidden="true">
        {formatRemaining(remainingMs)}
      </div>

      <div className={styles.card}>
        <div className={styles.emoji} aria-hidden="true">
          {currentWord?.emoji ?? ""}
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
            onChange={(event) => {
              const value = event.target.value;
              setInputValue(value);
              inputValueRef.current = value;
            }}
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
      </div>

      <div className={styles.actionRow}>
        {micSupported && (
          <button
            type="button"
            className={`${styles.micButton} ${isListening ? styles.micListening : ""}`}
            onClick={handleMicClick}
            disabled={phase !== "answering"}
            aria-label={isListening ? "音声を聞き取り中" : "音声で答える"}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 11v1a6 6 0 0 0 12 0v-1M12 18v3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

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
      </div>

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
