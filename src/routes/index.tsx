import { createFileRoute } from "@tanstack/react-router";
import { Brain } from "lucide-react";
import { SpeechTest } from "@/components/SpeechTest";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ReadRight — Dyslexia Screening for Children" },
      {
        name: "description",
        content:
          "A gentle, dyslexia-friendly speech screening tool for children. Read a sentence aloud and get instant feedback plus a fun word-match activity.",
      },
      { property: "og:title", content: "ReadRight — Dyslexia Screening for Children" },
      {
        property: "og:description",
        content:
          "Read a sentence, speak it aloud, and get instant friendly feedback with a practice game.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 md:py-16">
      <header className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-medium text-primary border border-border">
          <Brain className="h-4 w-4" /> Friendly screening · No data leaves your device
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          ReadRight
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          A gentle dyslexia screening for children. Read the sentence aloud, and we’ll show what
          went well and where to practice.
        </p>
      </header>

      <SpeechTest />

      <footer className="mx-auto mt-16 max-w-3xl text-center text-xs text-muted-foreground">
        ReadRight is an educational screening tool, not a medical diagnosis.
      </footer>
    </main>
  );
}
