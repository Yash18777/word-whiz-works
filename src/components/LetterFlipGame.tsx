import { useMemo, useState } from "react";
import { ArrowLeft, Check, RefreshCw, X } from "lucide-react";

// Pairs of mirror/rotated letters that often confuse young readers
const TRIALS: Array<{ shown: string; correct: string; options: string[] }> = [
  { shown: "b", correct: "b", options: ["b", "d", "p"] },
  { shown: "d", correct: "d", options: ["b", "d", "q"] },
  { shown: "p", correct: "p", options: ["q", "p", "b"] },
  { shown: "q", correct: "q", options: ["p", "q", "d"] },
  { shown: "b", correct: "b", options: ["d", "p", "b"] },
  { shown: "d", correct: "d", options: ["q", "b", "d"] },
  { shown: "was", correct: "was", options: ["saw", "was", "wsa"] },
  { shown: "saw", correct: "saw", options: ["was", "swa", "saw"] },
];

function shuffle<T>(a: T[]): T[] {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

export function LetterFlipGame({ onExit }: { onExit: () => void }) {
  const [trials] = useState(() => shuffle(TRIALS).slice(0, 6));
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"right" | "wrong" | null>(null);

  const current = trials[step];
  const done = step >= trials.length;

  const pick = (opt: string) => {
    if (feedback) return;
    const ok = opt === current.correct;
    setFeedback(ok ? "right" : "wrong");
    if (ok) setScore((s) => s + 1);
    setTimeout(() => {
      setFeedback(null);
      setStep((s) => s + 1);
    }, 800);
  };

  const restart = () => {
    setStep(0);
    setScore(0);
    setFeedback(null);
  };

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <button
        type="button"
        onClick={onExit}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to games
      </button>

      <div
        className="rounded-3xl border-2 border-border bg-card p-6 md:p-8"
        style={{ boxShadow: "var(--shadow-pop)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">🪞 Letter Flip</h2>
          <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground">
            ⭐ {score}
          </span>
        </div>
        <p className="mt-1 text-muted-foreground">
          Look carefully! Tap the option that matches the BIG letter exactly.
        </p>

        {!done ? (
          <div className="mt-8 flex flex-col items-center gap-8">
            <div
              className="flex h-44 w-44 items-center justify-center rounded-3xl text-8xl font-extrabold"
              style={{
                background: "var(--gradient-fun)",
                color: "var(--primary-foreground)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              {current.shown}
            </div>
            <div className="grid w-full grid-cols-3 gap-3">
              {current.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(opt)}
                  className="rounded-2xl border-2 bg-background py-6 text-3xl font-bold transition-transform hover:scale-105"
                  style={{
                    borderColor:
                      feedback && opt === current.correct
                        ? "var(--success)"
                        : "var(--border)",
                    background:
                      feedback === "wrong" && opt !== current.correct
                        ? "var(--highlight-error)"
                        : feedback && opt === current.correct
                          ? "var(--highlight-correct)"
                          : "var(--background)",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Round {step + 1} of {trials.length}
            </p>
            {feedback && (
              <p className="flex items-center gap-2 text-lg font-semibold">
                {feedback === "right" ? (
                  <>
                    <Check className="h-5 w-5" style={{ color: "var(--success)" }} /> Great job!
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5" style={{ color: "var(--danger)" }} /> Try again next
                    time!
                  </>
                )}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl bg-muted p-6 text-center">
            <p className="text-2xl font-bold text-foreground">🎉 You finished!</p>
            <p className="mt-2 text-lg text-foreground">
              Score: {score} / {trials.length}
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <RefreshCw className="h-4 w-4" /> Play again
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
