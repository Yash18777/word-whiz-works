// Dyslexia screening: text comparison + risk scoring helpers.
// All logic is deterministic and runs in the browser.

export const TEST_SENTENCES = [
  "The cat sat on the soft red mat.",
  "My puppy loves to run in the park.",
  "The yellow sun is hot and bright.",
  "I see a big blue fish in the pond.",
  "She sells seashells by the sunny seashore.",
  "A tiny mouse ate the yummy cheese.",
  "The quick brown fox jumps over the lazy dog.",
  "Peter Piper picked a peck of pickled peppers.",
  "A big black bug bit a big black bear.",
  "Ten green frogs hop on the wet log.",
  "The happy bee buzzed by the pink flower.",
  "We had fun making a snowman in the cold.",
  // New kid-friendly sentences
  "Mom baked a warm apple pie for me.",
  "The little duck swims with its mommy.",
  "I can ride my bike up the green hill.",
  "Stars twinkle high above the quiet town.",
  "The red balloon floated into the cloudy sky.",
  "Dad reads a funny story before bedtime.",
  "Six silly seals splashed in the salty sea.",
  "The kind girl gave bread to the hungry birds.",
  "A shiny yellow bus took us to the zoo.",
  "Grandma knits cozy socks with soft pink yarn.",
  "The brave knight rode a white horse to the castle.",
  "We picked sweet strawberries from the garden today.",
  "Tiny ants march in a long line on the path.",
  "The owl hoots when the moon is bright and round.",
];

export type WordStatus = "correct" | "incorrect" | "missing" | "extra";

export interface WordResult {
  expected: string | null;
  spoken: string | null;
  status: WordStatus;
}

const normalize = (w: string) =>
  w
    .toLowerCase()
    .replace(/[.,!?;:"'()\[\]]/g, "")
    .trim();

// Classic LCS-based diff so order matters and we can detect missing/extra/incorrect.
export function compareSentences(expected: string, spoken: string): WordResult[] {
  const exp = expected.split(/\s+/).filter(Boolean);
  const spo = spoken.split(/\s+/).filter(Boolean);
  const e = exp.map(normalize);
  const s = spo.map(normalize);

  const m = e.length;
  const n = s.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = e[i - 1] === s[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const out: WordResult[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (e[i - 1] === s[j - 1]) {
      out.unshift({ expected: exp[i - 1], spoken: spo[j - 1], status: "correct" });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      out.unshift({ expected: exp[i - 1], spoken: null, status: "missing" });
      i--;
    } else {
      out.unshift({ expected: null, spoken: spo[j - 1], status: "extra" });
      j--;
    }
  }
  while (i > 0) {
    out.unshift({ expected: exp[i - 1], spoken: null, status: "missing" });
    i--;
  }
  while (j > 0) {
    out.unshift({ expected: null, spoken: spo[j - 1], status: "extra" });
    j--;
  }

  // Promote adjacent missing+extra pairs into a single "incorrect" word
  // (helps catch substitutions like "was" -> "saw").
  for (let k = 0; k < out.length - 1; k++) {
    const a = out[k];
    const b = out[k + 1];
    if (
      (a.status === "missing" && b.status === "extra") ||
      (a.status === "extra" && b.status === "missing")
    ) {
      const expWord = a.status === "missing" ? a.expected : b.expected;
      const spoWord = a.status === "extra" ? a.spoken : b.spoken;
      out.splice(k, 2, { expected: expWord, spoken: spoWord, status: "incorrect" });
    }
  }
  return out;
}

export type RiskLevel = "Low" | "Medium" | "High";

export interface RiskAssessment {
  level: RiskLevel;
  accuracy: number;
  totalExpected: number;
  errors: { incorrect: number; missing: number; extra: number };
  feedback: string;
  suggestion: string;
  recommendedGame?: "match" | "flip" | "sound" | "builder";
}

export function assessRisk(results: WordResult[]): RiskAssessment {
  const totalExpected = results.filter((r) => r.expected !== null).length;
  const incorrect = results.filter((r) => r.status === "incorrect").length;
  const missing = results.filter((r) => r.status === "missing").length;
  const extra = results.filter((r) => r.status === "extra").length;
  const errors = incorrect + missing + Math.floor(extra / 2);
  const accuracy = totalExpected === 0 ? 0 : Math.max(0, 1 - errors / totalExpected);

  let level: RiskLevel = "Low";
  if (accuracy < 0.6) level = "High";
  else if (accuracy < 0.85) level = "Medium";

  let feedback = "Great reading! Your speech matched the sentence very closely.";
  if (level === "Medium") {
    feedback =
      missing > incorrect
        ? "You skipped a few words. This can be linked to tracking lines while reading."
        : "Some words were swapped. You may have difficulty with similar-sounding letters or phonics.";
  } else if (level === "High") {
    feedback =
      "You may have difficulty with phonics or visually similar letters (b/d, p/q, was/saw). A short daily practice can help a lot.";
  }

  const rec = recommendGame({ incorrect, missing, extra }, accuracy);
  const suggestion = rec.reason;

  return {
    level,
    accuracy,
    totalExpected,
    errors: { incorrect, missing, extra },
    feedback,
    suggestion,
    recommendedGame: rec.game,
  };
}

export type GameId = "match" | "flip" | "sound" | "builder";

export interface GameRecommendation {
  game: GameId;
  title: string;
  reason: string;
}

// Lightweight on-device "AI" recommender — picks the best game based on the
// dominant error pattern in the latest reading attempt.
export function recommendGame(
  errors: { incorrect: number; missing: number; extra: number },
  accuracy: number,
): GameRecommendation {
  const { incorrect, missing, extra } = errors;
  const total = incorrect + missing + extra;

  if (total === 0 || accuracy >= 0.95) {
    return {
      game: "match",
      title: "Word Match",
      reason: "Amazing reading! Try Word Match to keep your sharp eye for tricky look-alike words.",
    };
  }
  if (incorrect >= missing && incorrect >= extra) {
    return {
      game: "flip",
      title: "Letter Flip",
      reason: "You swapped a few words. Letter Flip trains b/d/p/q and mirror words like was/saw.",
    };
  }
  if (missing >= incorrect && missing >= extra) {
    return {
      game: "builder",
      title: "Word Builder",
      reason: "You skipped a few words. Word Builder helps you slow down and rebuild words letter by letter.",
    };
  }
  return {
    game: "sound",
    title: "Sound Match",
    reason: "You added extra words. Sound Match trains your ear so you only say what you read.",
  };
}
