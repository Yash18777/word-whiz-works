// Local-only history of reading attempts to power the Improvement Report.
import type { RiskAssessment, RiskLevel } from "./dyslexia";

const KEY = "readright:history";
const MAX = 20;

export interface AttemptRecord {
  ts: number;
  sentence: string;
  accuracy: number; // 0..1
  level: RiskLevel;
  errors: { incorrect: number; missing: number; extra: number };
}

export function loadHistory(): AttemptRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AttemptRecord[]) : [];
  } catch {
    return [];
  }
}

export function recordAttempt(sentence: string, a: RiskAssessment) {
  if (typeof window === "undefined") return;
  const list = loadHistory();
  list.push({
    ts: Date.now(),
    sentence,
    accuracy: a.accuracy,
    level: a.level,
    errors: a.errors,
  });
  const trimmed = list.slice(-MAX);
  window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  window.dispatchEvent(new Event("readright:history-change"));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("readright:history-change"));
}

export interface ImprovementSummary {
  attempts: number;
  bestAccuracy: number;
  averageAccuracy: number;
  recentAccuracy: number; // last 3 avg
  earlierAccuracy: number; // prior 3 avg
  trend: "up" | "down" | "flat" | "new";
  delta: number; // recent - earlier
  totalErrors: number;
  topIssue: "incorrect" | "missing" | "extra" | null;
  message: string;
}

export function summarize(list: AttemptRecord[]): ImprovementSummary {
  const attempts = list.length;
  if (attempts === 0) {
    return {
      attempts: 0,
      bestAccuracy: 0,
      averageAccuracy: 0,
      recentAccuracy: 0,
      earlierAccuracy: 0,
      trend: "new",
      delta: 0,
      totalErrors: 0,
      topIssue: null,
      message: "Take your first reading test to start your progress chart!",
    };
  }
  const avg = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);
  const accs = list.map((a) => a.accuracy);
  const bestAccuracy = Math.max(...accs);
  const averageAccuracy = avg(accs);
  const recent = list.slice(-3);
  const earlier = list.slice(-6, -3);
  const recentAccuracy = avg(recent.map((a) => a.accuracy));
  const earlierAccuracy = avg(earlier.map((a) => a.accuracy));
  const delta = earlier.length === 0 ? 0 : recentAccuracy - earlierAccuracy;
  let trend: ImprovementSummary["trend"] = "flat";
  if (earlier.length === 0) trend = "new";
  else if (delta > 0.05) trend = "up";
  else if (delta < -0.05) trend = "down";

  const totals = list.reduce(
    (acc, a) => ({
      incorrect: acc.incorrect + a.errors.incorrect,
      missing: acc.missing + a.errors.missing,
      extra: acc.extra + a.errors.extra,
    }),
    { incorrect: 0, missing: 0, extra: 0 },
  );
  const totalErrors = totals.incorrect + totals.missing + totals.extra;
  let topIssue: ImprovementSummary["topIssue"] = null;
  if (totalErrors > 0) {
    const entries = Object.entries(totals) as Array<["incorrect" | "missing" | "extra", number]>;
    topIssue = entries.sort((a, b) => b[1] - a[1])[0][0];
  }

  let message = "";
  if (trend === "new") message = `Nice start! You scored ${Math.round(recentAccuracy * 100)}%. Keep practicing to see your progress.`;
  else if (trend === "up") message = `🚀 Awesome — you improved by ${Math.round(delta * 100)}% recently!`;
  else if (trend === "down") message = `You dipped a little. Try a slower sentence and play a brain game first.`;
  else message = `Steady going! Try a harder sentence to push your score up.`;

  return {
    attempts,
    bestAccuracy,
    averageAccuracy,
    recentAccuracy,
    earlierAccuracy,
    trend,
    delta,
    totalErrors,
    topIssue,
    message,
  };
}
