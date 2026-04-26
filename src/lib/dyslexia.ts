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

  const suggestion =
    level === "Low"
      ? "Try the Word Match game to keep your skills sharp!"
      : level === "Medium"
        ? "Practice the Word Match game — it builds phonics and pattern recognition."
        : "Start with the Word Match game daily, then try reading the sentence aloud again.";

  return {
    level,
    accuracy,
    totalExpected,
    errors: { incorrect, missing, extra },
    feedback,
    suggestion,
  };
}
