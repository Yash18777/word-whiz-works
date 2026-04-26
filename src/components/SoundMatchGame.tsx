import { useState } from "react";
import { ArrowLeft, RefreshCw, RotateCw, Volume2, VolumeX } from "lucide-react";
import { speak, useMuted } from "@/lib/speech";

// Pick the word that starts with the same sound as the cue word.
const ROUNDS: Array<{ cue: string; correct: string; options: string[] }> = [
  { cue: "sun", correct: "sock", options: ["sock", "ball", "tree"] },
  { cue: "cat", correct: "cup", options: ["dog", "cup", "fish"] },
  { cue: "ball", correct: "boat", options: ["apple", "boat", "milk"] },
  { cue: "fish", correct: "fox", options: ["cake", "fox", "bus"] },
  { cue: "moon", correct: "mouse", options: ["lion", "rain", "mouse"] },
  { cue: "tree", correct: "toy", options: ["toy", "egg", "bird"] },
  { cue: "dog", correct: "duck", options: ["nose", "duck", "shoe"] },
  { cue: "rain", correct: "robot", options: ["robot", "snail", "leaf"] },
];

function shuffle<T>(a: T[]): T[] {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

export function SoundMatchGame({ onExit }: { onExit: () => void }) {
  const [rounds] = useState(() => shuffle(ROUNDS).slice(0, 5));
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [muted, setMutedFlag] = useMuted();

  const sayCue = () => speak(current.cue, 0.85);

  const current = rounds[step];
  const done = step >= rounds.length;

  const pick = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    speak(opt, 0.85);
    if (opt === current.correct) setScore((s) => s + 1);
    setTimeout(() => {
      setPicked(null);
      setStep((s) => s + 1);
    }, 1100);
  };

  const restart = () => {
    setStep(0);
    setScore(0);
    setPicked(null);
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
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-2xl font-bold text-foreground">🔊 Sound Match</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMutedFlag(!muted)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
              aria-label={muted ? "Unmute sound" : "Mute sound"}
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {muted ? "Muted" : "Sound on"}
            </button>
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground">
              ⭐ {score}
            </span>
          </div>
        </div>
        <p className="mt-1 text-muted-foreground">
          Listen to the word, then pick a word that starts with the SAME sound.
        </p>

        {!done ? (
          <div className="mt-8 flex flex-col items-center gap-6">
            <button
              type="button"
              onClick={() => speak(current.cue)}
              className="flex flex-col items-center gap-3 rounded-3xl px-10 py-6 text-3xl font-extrabold transition-transform hover:scale-105"
              style={{
                background: "var(--gradient-fun)",
                color: "var(--primary-foreground)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              <Volume2 className="h-7 w-7" />
              {current.cue}
            </button>
            <p className="text-sm text-muted-foreground">Tap the speaker to hear it again</p>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
              {current.options.map((opt, i) => {
                const isPicked = picked === opt;
                const isAnswer = opt === current.correct;
                let bg = "var(--background)";
                if (picked && isAnswer) bg = "var(--highlight-correct)";
                else if (isPicked && !isAnswer) bg = "var(--highlight-error)";
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pick(opt)}
                    className="rounded-2xl border-2 border-border py-5 text-2xl font-bold capitalize transition-transform hover:scale-105"
                    style={{ background: bg }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground">
              Round {step + 1} of {rounds.length}
            </p>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl bg-muted p-6 text-center">
            <p className="text-2xl font-bold text-foreground">🌟 Awesome listening!</p>
            <p className="mt-2 text-lg text-foreground">
              Score: {score} / {rounds.length}
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
