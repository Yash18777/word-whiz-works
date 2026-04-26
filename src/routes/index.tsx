import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { SpeechTest } from "@/components/SpeechTest";
import { GamesHub } from "@/components/GamesHub";
import { ImprovementReport } from "@/components/ImprovementReport";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ReadRight — Fun Dyslexia Games & Reading Test for Kids" },
      {
        name: "description",
        content:
          "A playful, kid-friendly app that screens for dyslexia signs and offers fun brain games — Word Match, Letter Flip, Sound Match, and Word Builder.",
      },
      { property: "og:title", content: "ReadRight — Fun Dyslexia Games for Kids" },
      {
        property: "og:description",
        content:
          "Read sentences aloud and play 4 brain games that train phonics, letter recognition and sound matching.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main
      className="min-h-screen px-4 py-10 md:py-14"
      style={{ background: "var(--gradient-sky)" }}
    >
      <header className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
        <div
          className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-border px-4 py-1.5 text-sm font-bold text-foreground"
          style={{ background: "var(--gradient-fun)", color: "var(--primary-foreground)" }}
        >
          <Sparkles className="h-4 w-4" /> Fun reading practice for kids
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground md:text-6xl">
          Read<span style={{ color: "var(--primary)" }}>Right</span> 🦉
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Read a sentence out loud, see how you did, then play 4 colorful brain games that
          help with letters and sounds!
        </p>
      </header>

      <SpeechTest />

      <div className="mx-auto my-16 max-w-4xl">
        <div
          className="rounded-3xl border-2 border-border p-6 md:p-10"
          style={{ background: "var(--card)", boxShadow: "var(--shadow-pop)" }}
        >
          <GamesHub />
        </div>
      </div>

      <footer className="mx-auto mt-10 max-w-3xl text-center text-xs text-muted-foreground">
        🌈 ReadRight is a fun learning tool, not a medical diagnosis. If you're worried,
        please talk to a teacher or specialist.
      </footer>
    </main>
  );
}
