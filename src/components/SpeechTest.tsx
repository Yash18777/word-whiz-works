import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, RefreshCw, RotateCw, Sparkles, Volume2, VolumeX } from "lucide-react";
import {
  TEST_SENTENCES,
  assessRisk,
  compareSentences,
  type RiskAssessment,
  type WordResult,
} from "@/lib/dyslexia";
import { speak, stopSpeaking, useMuted } from "@/lib/speech";
import { recordAttempt } from "@/lib/history";
import { GamesHub } from "./GamesHub";

// Minimal types for the Web Speech API (not in default lib.dom)
type SpeechRecognitionResult = { transcript: string };
type SpeechRecognitionAlternative = { 0: SpeechRecognitionResult; isFinal: boolean };
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionAlternative>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type Stage = "idle" | "recording" | "result" | "game";

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function SpeechTest() {
  const [stage, setStage] = useState<Stage>("idle");
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const supported = useMemo(() => getRecognitionCtor() !== null, []);
  const sentence = TEST_SENTENCES[sentenceIndex];

  const results: WordResult[] | null = useMemo(
    () => (stage === "result" && transcript ? compareSentences(sentence, transcript) : null),
    [stage, transcript, sentence],
  );
  const assessment: RiskAssessment | null = useMemo(
    () => (results ? assessRisk(results) : null),
    [results],
  );

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const startRecording = () => {
    setError(null);
    setTranscript("");
    setInterim("");
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError("Your browser does not support speech recognition. Try Chrome or Edge.");
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    let finalText = "";
    rec.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript + " ";
        else live += r[0].transcript;
      }
      setInterim(live);
      if (finalText) setTranscript(finalText.trim());
    };
    rec.onerror = (ev) => {
      setError(
        ev.error === "not-allowed"
          ? "Microphone access was blocked. Please allow it in your browser."
          : `Speech recognition error: ${ev.error}`,
      );
      setStage("idle");
    };
    rec.onend = () => {
      setInterim("");
      setTranscript((t) => {
        const final = (finalText || t).trim();
        if (final) setStage("result");
        else setStage("idle");
        return final;
      });
    };
    recognitionRef.current = rec;
    setStage("recording");
    try {
      rec.start();
    } catch {
      setError("Could not start the microphone. Please try again.");
      setStage("idle");
    }
  };

  const stopRecording = () => recognitionRef.current?.stop();

  const reset = () => {
    setStage("idle");
    setTranscript("");
    setInterim("");
    setError(null);
  };

  const nextSentence = () => {
    setSentenceIndex((i) => (i + 1) % TEST_SENTENCES.length);
    reset();
  };

  const speakSentence = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(sentence);
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  if (stage === "game") {
    return <GamesHub onExit={() => setStage("result")} />;
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-8">
      {/* Sentence card */}
      <div
        className="rounded-3xl border border-border bg-card p-8 md:p-10"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Read this sentence aloud
          </span>
          <button
            type="button"
            onClick={speakSentence}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-primary hover:bg-muted"
            aria-label="Listen to the sentence"
          >
            <Volume2 className="h-4 w-4" /> Listen
          </button>
        </div>
        <p className="text-3xl md:text-4xl font-semibold leading-relaxed text-foreground">
          {sentence}
        </p>
      </div>

      {/* Controls */}
      {stage === "idle" && (
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={startRecording}
            disabled={!supported}
            className="group inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-transform hover:scale-105 active:scale-100 disabled:opacity-50"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <Mic className="h-6 w-6" /> Start Test
          </button>
          {!supported && (
            <p className="text-sm text-danger">
              Speech recognition is not available in this browser. Please use Chrome or Edge.
            </p>
          )}
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      )}

      {stage === "recording" && (
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-3 rounded-full bg-danger px-8 py-4 text-lg font-semibold text-danger-foreground"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger-foreground opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-danger-foreground" />
            </span>
            <MicOff className="h-6 w-6" /> Stop Recording
          </button>
          <p className="min-h-6 text-base text-muted-foreground italic">
            {interim || "Listening… speak clearly."}
          </p>
        </div>
      )}

      {/* Result */}
      {stage === "result" && results && assessment && (
        <ResultPanel
          results={results}
          assessment={assessment}
          transcript={transcript}
          onRetry={reset}
          onNext={nextSentence}
          onPlayGame={() => setStage("game")}
        />
      )}
    </section>
  );
}

function ResultPanel({
  results,
  assessment,
  transcript,
  onRetry,
  onNext,
  onPlayGame,
}: {
  results: WordResult[];
  assessment: RiskAssessment;
  transcript: string;
  onRetry: () => void;
  onNext: () => void;
  onPlayGame: () => void;
}) {
  const riskColor =
    assessment.level === "Low"
      ? "var(--success)"
      : assessment.level === "Medium"
        ? "var(--warning)"
        : "var(--danger)";
  const riskFg =
    assessment.level === "Low"
      ? "var(--success-foreground)"
      : assessment.level === "Medium"
        ? "var(--warning-foreground)"
        : "var(--danger-foreground)";

  return (
    <div className="space-y-6">
      <div
        className="rounded-3xl border border-border bg-card p-6 md:p-8"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <h2 className="mb-4 text-xl font-semibold text-foreground">What we heard</h2>
        <p className="mb-2 text-sm text-muted-foreground">Your reading:</p>
        <p className="mb-6 rounded-xl bg-muted px-4 py-3 text-base italic text-muted-foreground">
          “{transcript}”
        </p>

        <p className="mb-2 text-sm text-muted-foreground">Word-by-word comparison:</p>
        <p className="flex flex-wrap gap-2 text-2xl leading-loose">
          {results.map((r, i) => {
            const word = r.expected ?? r.spoken ?? "";
            const styles: Record<string, string> = {};
            let title = "Correct";
            if (r.status === "correct") {
              styles.backgroundColor = "var(--highlight-correct)";
              styles.color = "var(--success-foreground)";
            } else if (r.status === "incorrect") {
              styles.backgroundColor = "var(--highlight-error)";
              styles.color = "var(--danger-foreground)";
              title = `Said "${r.spoken}" instead of "${r.expected}"`;
            } else if (r.status === "missing") {
              styles.backgroundColor = "var(--highlight-missing)";
              styles.color = "var(--warning-foreground)";
              styles.textDecoration = "line-through";
              title = "Word was missed";
            } else {
              styles.backgroundColor = "var(--highlight-error)";
              styles.color = "var(--danger-foreground)";
              styles.opacity = "0.7";
              title = "Extra word";
            }
            return (
              <span
                key={i}
                title={title}
                className="rounded-lg px-2 py-0.5 font-medium"
                style={styles}
              >
                {word}
              </span>
            );
          })}
        </p>

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Legend color="var(--highlight-correct)" label="Correct" />
          <Legend color="var(--highlight-error)" label="Wrong word" />
          <Legend color="var(--highlight-missing)" label="Missed" />
        </div>
      </div>

      <div
        className="overflow-hidden rounded-3xl border border-border bg-card"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <div
          className="px-6 py-5 md:px-8"
          style={{ background: riskColor, color: riskFg }}
        >
          <p className="text-sm font-medium uppercase tracking-wider opacity-90">
            Indicative risk level
          </p>
          <p className="text-3xl font-bold">{assessment.level}</p>
          <p className="mt-1 text-sm opacity-90">
            Accuracy: {Math.round(assessment.accuracy * 100)}% · {assessment.errors.incorrect}{" "}
            wrong, {assessment.errors.missing} missed, {assessment.errors.extra} extra
          </p>
        </div>
        <div className="space-y-4 p-6 md:p-8">
          <p className="text-lg text-foreground">{assessment.feedback}</p>
          <div className="rounded-2xl bg-muted p-5">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> Suggested activity
            </p>
            <p className="mb-4 text-foreground">{assessment.suggestion}</p>
            <button
              type="button"
              onClick={onPlayGame}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              🎮 Play Brain Games →
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            This is a screening activity, not a medical diagnosis. For concerns, please consult a
            qualified specialist.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground hover:opacity-90"
        >
          Next sentence
        </button>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
