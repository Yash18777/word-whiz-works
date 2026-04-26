import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { WordMatchGame } from "./WordMatchGame";
import { LetterFlipGame } from "./LetterFlipGame";
import { SoundMatchGame } from "./SoundMatchGame";
import { WordBuilderGame } from "./WordBuilderGame";

type GameId = "match" | "flip" | "sound" | "builder";

interface GameInfo {
  id: GameId;
  emoji: string;
  title: string;
  desc: string;
  bg: string;
}

const GAMES: GameInfo[] = [
  {
    id: "match",
    emoji: "🃏",
    title: "Word Match",
    desc: "Pair up words that look or sound alike — like was & saw.",
    bg: "var(--fun-pink)",
  },
  {
    id: "flip",
    emoji: "🪞",
    title: "Letter Flip",
    desc: "Spot the right letter from b, d, p, q tricky twins!",
    bg: "var(--fun-mint)",
  },
  {
    id: "sound",
    emoji: "🔊",
    title: "Sound Match",
    desc: "Listen and pick the word that starts with the same sound.",
    bg: "var(--fun-sky)",
  },
  {
    id: "builder",
    emoji: "🧩",
    title: "Word Builder",
    desc: "Drag letters into the right order to build a word.",
    bg: "var(--fun-orange)",
  },
];

export function GamesHub({
  onExit,
  initialGame,
}: {
  onExit?: () => void;
  initialGame?: GameId;
}) {
  const [active, setActive] = useState<GameId | null>(initialGame ?? null);

  if (active === "match") return <WordMatchGame onExit={() => setActive(null)} />;
  if (active === "flip") return <LetterFlipGame onExit={() => setActive(null)} />;
  if (active === "sound") return <SoundMatchGame onExit={() => setActive(null)} />;
  if (active === "builder") return <WordBuilderGame onExit={() => setActive(null)} />;

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      {onExit && (
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      )}

      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-foreground md:text-4xl">
          🎮 Brain Games
        </h2>
        <p className="mt-2 text-muted-foreground">
          Pick a game and have fun while training your reading brain!
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setActive(g.id)}
            className="group flex flex-col items-start gap-3 rounded-3xl border-2 border-border p-6 text-left transition-transform hover:-translate-y-1 hover:scale-[1.02]"
            style={{
              background: g.bg,
              boxShadow: "var(--shadow-pop)",
            }}
          >
            <span className="text-5xl">{g.emoji}</span>
            <span className="text-2xl font-extrabold text-foreground">{g.title}</span>
            <span className="text-sm font-medium text-foreground/75">{g.desc}</span>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-background/70 px-3 py-1 text-xs font-bold text-foreground group-hover:bg-background">
              Play now →
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
