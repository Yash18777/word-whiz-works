import { useMemo, useState } from "react";
import { ArrowLeft, Check, RefreshCw, RotateCcw } from "lucide-react";

// Simple, common 3-4 letter words for kids to unscramble
const WORDS = ["cat", "dog", "sun", "fish", "bird", "moon", "star", "cake", "frog", "book"];

function shuffle<T>(a: T[]): T[] {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

interface Letter {
  id: number;
  ch: string;
}

function pickWord(used: Set<string>): string {
  const remaining = WORDS.filter((w) => !used.has(w));
  const pool = remaining.length ? remaining : WORDS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function scramble(word: string): Letter[] {
  let arr: Letter[];
  do {
    arr = shuffle(word.split("").map((ch, i) => ({ id: i, ch })));
  } while (arr.map((l) => l.ch).join("") === word && word.length > 1);
  return arr;
}

export function WordBuilderGame({ onExit }: { onExit: () => void }) {
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [target, setTarget] = useState<string>(() => pickWord(new Set()));
  const [pool, setPool] = useState<Letter[]>(() => scramble(target));
  const [picked, setPicked] = useState<Letter[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const TOTAL = 5;

  const built = useMemo(() => picked.map((l) => l.ch).join(""), [picked]);
  const isComplete = built.length === target.length;
  const isCorrect = isComplete && built === target;

  const choose = (letter: Letter) => {
    if (isComplete) return;
    setPool((p) => p.filter((l) => l.id !== letter.id));
    setPicked((p) => [...p, letter]);
  };

  const undo = (letter: Letter) => {
    setPicked((p) => p.filter((l) => l.id !== letter.id));
    setPool((p) => [...p, letter]);
  };

  const reset = () => {
    setPool(scramble(target));
    setPicked([]);
  };

  const next = () => {
    if (isCorrect) setScore((s) => s + 1);
    const newUsed = new Set(used).add(target);
    if (round >= TOTAL) {
      setRound(round + 1);
      return;
    }
    const w = pickWord(newUsed);
    setUsed(newUsed);
    setTarget(w);
    setPool(scramble(w));
    setPicked([]);
    setRound((r) => r + 1);
  };

  const restart = () => {
    const w = pickWord(new Set());
    setUsed(new Set());
    setTarget(w);
    setPool(scramble(w));
    setPicked([]);
    setScore(0);
    setRound(1);
  };

  const done = round > TOTAL;

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
          <h2 className="text-2xl font-bold text-foreground">🧩 Word Builder</h2>
          <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground">
            ⭐ {score}
          </span>
        </div>
        <p className="mt-1 text-muted-foreground">
          Tap the letters in the right order to build the word!
        </p>

        {!done ? (
          <>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Build this word:{" "}
              <span className="ml-1 rounded-lg bg-muted px-3 py-1 font-bold text-foreground">
                {target}
              </span>
            </p>

            {/* Built slots */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {Array.from({ length: target.length }).map((_, i) => {
                const l = picked[i];
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!l}
                    onClick={() => l && undo(l)}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed text-3xl font-bold transition-transform hover:scale-105"
                    style={{
                      borderColor: "var(--primary)",
                      background: l
                        ? isComplete
                          ? isCorrect
                            ? "var(--highlight-correct)"
                            : "var(--highlight-error)"
                          : "var(--accent)"
                        : "var(--background)",
                    }}
                  >
                    {l?.ch ?? ""}
                  </button>
                );
              })}
            </div>

            {/* Letter pool */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {pool.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => choose(l)}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-extrabold transition-transform hover:scale-110"
                  style={{
                    background: "var(--gradient-fun)",
                    color: "var(--primary-foreground)",
                    boxShadow: "var(--shadow-soft)",
                  }}
                >
                  {l.ch}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!isComplete}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
              >
                <Check className="h-4 w-4" /> {isCorrect ? "Yay! Next" : "Next word"}
              </button>
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Round {round} of {TOTAL}
            </p>
          </>
        ) : (
          <div className="mt-8 rounded-2xl bg-muted p-6 text-center">
            <p className="text-2xl font-bold text-foreground">🏆 All done!</p>
            <p className="mt-2 text-lg text-foreground">
              You built {score} of {TOTAL} words!
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
