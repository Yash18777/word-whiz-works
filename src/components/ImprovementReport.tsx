import { useEffect, useState } from "react";
import { Award, Eraser, TrendingDown, TrendingUp, Minus, Sparkles } from "lucide-react";
import { clearHistory, loadHistory, summarize, type AttemptRecord } from "@/lib/history";

export function ImprovementReport() {
  const [list, setList] = useState<AttemptRecord[]>(() => loadHistory());

  useEffect(() => {
    const sync = () => setList(loadHistory());
    window.addEventListener("readright:history-change", sync);
    return () => window.removeEventListener("readright:history-change", sync);
  }, []);

  const summary = summarize(list);
  const recent = list.slice(-8);
  const max = Math.max(0.1, ...recent.map((a) => a.accuracy));

  const trendColor =
    summary.trend === "up"
      ? "var(--success)"
      : summary.trend === "down"
        ? "var(--danger)"
        : "var(--primary)";

  const TrendIcon =
    summary.trend === "up" ? TrendingUp : summary.trend === "down" ? TrendingDown : Minus;

  return (
    <section
      className="rounded-3xl border-2 border-border p-6 md:p-8"
      style={{ background: "var(--card)", boxShadow: "var(--shadow-pop)" }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-extrabold text-foreground">
            📈 Your Improvement Report
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tracks the last {Math.max(list.length, 1)} reading attempt
            {list.length === 1 ? "" : "s"} on this device.
          </p>
        </div>
        {list.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Clear all your saved attempts?")) clearHistory();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
          >
            <Eraser className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>

      {summary.attempts === 0 ? (
        <div className="rounded-2xl bg-muted p-6 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-2 text-base text-foreground">{summary.message}</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat
              label="Attempts"
              value={String(summary.attempts)}
              bg="var(--fun-sky)"
              icon={<Sparkles className="h-4 w-4" />}
            />
            <Stat
              label="Best score"
              value={`${Math.round(summary.bestAccuracy * 100)}%`}
              bg="var(--fun-mint)"
              icon={<Award className="h-4 w-4" />}
            />
            <Stat
              label="Average"
              value={`${Math.round(summary.averageAccuracy * 100)}%`}
              bg="var(--fun-orange)"
              icon={<Minus className="h-4 w-4" />}
            />
            <Stat
              label="Recent trend"
              value={
                summary.trend === "new"
                  ? "—"
                  : `${summary.delta >= 0 ? "+" : ""}${Math.round(summary.delta * 100)}%`
              }
              bg="var(--fun-pink)"
              icon={<TrendIcon className="h-4 w-4" />}
            />
          </div>

          {/* Bar chart */}
          <div className="mt-6 rounded-2xl bg-muted p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Last {recent.length} attempt{recent.length === 1 ? "" : "s"} — accuracy
            </p>
            <div className="flex h-32 items-end gap-2">
              {recent.map((a, i) => {
                const h = Math.max(6, Math.round((a.accuracy / max) * 100));
                const color =
                  a.level === "Low"
                    ? "var(--success)"
                    : a.level === "Medium"
                      ? "var(--warning)"
                      : "var(--danger)";
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-foreground">
                      {Math.round(a.accuracy * 100)}%
                    </span>
                    <div
                      className="w-full rounded-t-lg transition-all"
                      style={{ height: `${h}%`, background: color, minHeight: "6px" }}
                      title={new Date(a.ts).toLocaleString()}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insight */}
          <div
            className="mt-5 flex items-start gap-3 rounded-2xl p-4"
            style={{ background: trendColor, color: "var(--primary-foreground)" }}
          >
            <TrendIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">{summary.message}</p>
              {summary.topIssue && (
                <p className="mt-1 text-sm opacity-90">
                  Most common issue:{" "}
                  <strong>
                    {summary.topIssue === "incorrect"
                      ? "swapped words"
                      : summary.topIssue === "missing"
                        ? "skipped words"
                        : "extra words"}
                  </strong>
                  . Try the{" "}
                  {summary.topIssue === "incorrect"
                    ? "Letter Flip"
                    : summary.topIssue === "missing"
                      ? "Word Builder"
                      : "Sound Match"}{" "}
                  game to practice.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  bg,
  icon,
}: {
  label: string;
  value: string;
  bg: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border-2 border-border p-3"
      style={{ background: bg }}
    >
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground/70">
        {icon} {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-foreground">{value}</p>
    </div>
  );
}
