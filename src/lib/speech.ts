export function speakEnglish(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// --- Speech-to-text (answer by voice) ---
// Uses the Web Speech API's SpeechRecognition, exposed as
// `webkitSpeechRecognition` on Safari/iOS. Support is inconsistent across
// browsers and iPadOS versions, so every caller must feature-detect with
// isSpeechRecognitionSupported() before offering a mic button, and must
// treat a failure/denial as "fall back to typing/writing", not a hard error.

type SpeechRecognitionResultLike = { transcript: string };
type SpeechRecognitionEventLike = { results: SpeechRecognitionResultLike[][] };
type SpeechRecognitionErrorEventLike = { error: string };

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

export type SpeechAnswerHandlers = {
  onResult: (transcript: string) => void;
  onError: (reason: string) => void;
  onEnd: () => void;
};

// Starts listening for a single spoken answer. Returns a function that
// aborts listening early, or null if speech recognition isn't available (or
// failed to start, e.g. mic permission was previously denied outright).
export function listenForSpokenAnswer(handlers: SpeechAnswerHandlers): (() => void) | null {
  const Ctor = getSpeechRecognitionConstructor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript ?? "";
    handlers.onResult(transcript);
  };
  recognition.onerror = (event) => {
    handlers.onError(event.error ?? "unknown");
  };
  recognition.onend = () => {
    handlers.onEnd();
  };

  try {
    recognition.start();
  } catch {
    return null;
  }

  return () => {
    try {
      recognition.abort();
    } catch {
      // already stopped — nothing to do
    }
  };
}
