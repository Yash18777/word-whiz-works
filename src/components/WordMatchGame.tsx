import { useMemo, useState } from "react";
import { ArrowLeft, Check, RefreshCw } from "lucide-react";

// Pairs of commonly confused / similar-looking words
const PAIRS: Array<{ word: string; match: string }> = [
  { word: "was", match: "saw" },
  { word: "big", match: "dig" },
  { word: "pat", match: "tap" },
  { word: "cat", match: "act" },
  { word: "bat", match: "tab" },
  { word: "net", match: "ten" },
];

interface Card {
  id: number;
  text: string;
  pairId: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): Card[] {
  const subset = shuffle(PAIRS).slice(0, 4);
  const cards: Card[] = [];
  subset.forEach((p, idx) => {
    cards.push({ id: idx * 2, text: p.word, pairId: idx });
    cards.push({ id: idx * 2 + 1, text: p.match, pairId: idx });
  });
  return shuffle(cards);
}

export function WordMatchGame({ onExit }: { onExit: () => void }) {
  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [selected, setSelected] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<[number, number] | null>(null);
  const [moves, setMoves] = useState(0);

  const won = useMemo(() => matched.size === deck.length, [matched, deck]);

  const handlePick = (card: Card) => {
    if (matched.has(card.pairId) || wrong) return;
    if (selected === null) {
      setSelected(card.id);
      return;
    }
    if (selected === card.id) {
      setSelected(null);
      return;
    }
    setMoves((m) => m + 1);
    const other = deck.find((c) => c.id === selected)!;
    if (other.pairId === card.pairId) {
      setMatched((prev) => new Set(prev).add(card.pairId));
      setSelected(null);
    } else {
      setWrong([selected, card.id]);
      setTimeout(() => {
        setWrong(null);
        setSelected(null);
      }, 700);
    }
  };

  const restart = () => {
    setDeck(buildDeck());
    setSelected(null);
    setMatched(new Set());
    setWrong(null);
    setMoves(0);
  };

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to result
        </button>
        <span className="text-sm text-muted-foreground">Moves: {moves}</span>
      </div>

      <div
        className="rounded-3xl border border-border bg-card p-6 md:p-8"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <h2 className="text-2xl font-bold text-foreground">Word Match</h2>
        <p className="mt-1 text-muted-foreground">
          Tap two cards that look or sound alike. They become a pair when matched.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {deck.map((card) => {
            const isMatched = matched.has(card.pairId);
            const isSelected = selected === card.id;
            const isWrong = wrong?.includes(card.id);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handlePick(card)}
                disabled={isMatched}
                className="relative flex aspect-square items-center justify-center rounded-2xl border-2 text-2xl font-bold transition-all"
                style={{
                  background: isMatched
                    ? "var(--highlight-correct)"
                    : isWrong
                      ? "var(--highlight-error)"
                      : isSelected
                        ? "var(--accent)"
                        : "var(--background)",
                  borderColor: isSelected ? "var(--primary)" : "var(--border)",
                  color: "var(--foreground)",
                  transform: isSelected ? "scale(1.04)" : "scale(1)",
                }}
              >
                {card.text}
                {isMatched && (
                  <Check
                    className="absolute right-2 top-2 h-5 w-5"
                    style={{ color: "var(--success)" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {won && (
          <div className="mt-6 rounded-2xl bg-muted p-5 text-center">
            <p className="text-xl font-semibold text-foreground">🎉 Well done!</p>
            <p className="mt-1 text-muted-foreground">
              Solved in {moves} moves. Practice a little every day.
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
