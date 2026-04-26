import { createFileRoute } from "@tanstack/react-router";
import { LogOut, Sparkles, Star, Trophy, Wand2 } from "lucide-react";
import { SpeechTest } from "@/components/SpeechTest";
import { GamesHub } from "@/components/GamesHub";
import { ImprovementReport } from "@/components/ImprovementReport";
import { LoginScreen } from "@/components/LoginScreen";
import { clearUser, useUser } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Uplexia — Fun Dyslexia Games & Reading Test for Kids" },
      {
        name: "description",
        content:
          "Uplexia is a playful app that screens for dyslexia signs and recommends fun brain games — Word Match, Letter Flip, Sound Match, and Word Builder.",
      },
      { property: "og:title", content: "Uplexia — Fun Dyslexia Games for Kids" },
      {
        property: "og:description",
        content:
          "Read sentences aloud, get an AI-powered game recommendation, and train phonics with 4 colorful brain games.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const user = useUser();

  if (!user) return <LoginScreen />;

  return (
    <main
      className="min-h-screen px-4 py-10 md:py-14"
      style={{ background: "var(--gradient-sky)" }}
    >
      {/* Top bar */}
      <div className="mx-auto mb-8 flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{user.avatar}</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Hello, reader
            </p>
            <p className="text-sm font-extrabold text-foreground">{user.name}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("Sign out of Uplexia?")) clearUser();
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>

      {/* Hero / fancy main menu */}
      <header className="mx-auto mb-12 max-w-4xl">
        <div
          className="relative overflow-hidden rounded-[2rem] border-2 border-border p-8 md:p-12"
          style={{
            background: "var(--gradient-fun)",
            boxShadow: "var(--shadow-pop)",
          }}
        >
          <div
            aria-hidden
            className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30"
            style={{ background: "var(--fun-pink)" }}
          />
          <div
            aria-hidden
            className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full opacity-30"
            style={{ background: "var(--fun-mint)" }}
          />
          <div className="relative">
            <h1
              className="text-5xl font-extrabold tracking-tight md:text-7xl"
              style={{ color: "var(--primary-foreground)" }}
            >
              Hi {user.name}! <span className="inline-block">👋</span>
            </h1>
            <h2
              className="mt-1 text-2xl font-extrabold md:text-3xl"
              style={{ color: "var(--primary-foreground)", opacity: 0.95 }}
            >
              Welcome to <span className="underline decoration-wavy">Uplexia</span> 🦉
            </h2>
            <p
              className="mt-4 max-w-xl text-base md:text-lg"
              style={{ color: "var(--primary-foreground)", opacity: 0.95 }}
            >
              Read a sentence out loud and our smart coach will pick the perfect
              brain game for you. Ready to level up?
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#test"
                className="inline-flex items-center gap-2 rounded-full bg-card px-5 py-2.5 text-sm font-bold text-foreground transition-transform hover:scale-105"
              >
                <Wand2 className="h-4 w-4 text-primary" /> Start reading test
              </a>
              <a
                href="#games"
                className="inline-flex items-center gap-2 rounded-full border-2 border-card bg-transparent px-5 py-2.5 text-sm font-bold transition-transform hover:scale-105"
                style={{ color: "var(--primary-foreground)" }}
              >
                <Sparkles className="h-4 w-4" /> Jump to games
              </a>
            </div>
          </div>
        </div>

        {/* Mini info chips */}
        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-3 gap-3">
          <Chip icon={<Star className="h-4 w-4" />} label="Read aloud" bg="var(--fun-sky)" />
          <Chip icon={<Wand2 className="h-4 w-4" />} label="AI picks a game" bg="var(--fun-mint)" />
          <Chip icon={<Trophy className="h-4 w-4" />} label="Track progress" bg="var(--fun-orange)" />
        </div>
      </header>

      <div id="test">
        <SpeechTest />
      </div>

      <div className="mx-auto mt-12 max-w-4xl">
        <ImprovementReport />
      </div>

      <div id="games" className="mx-auto my-16 max-w-4xl">
        <div
          className="rounded-3xl border-2 border-border p-6 md:p-10"
          style={{ background: "var(--card)", boxShadow: "var(--shadow-pop)" }}
        >
          <GamesHub />
        </div>
      </div>

      <footer className="mx-auto mt-10 max-w-3xl text-center text-xs text-muted-foreground">
        🌈 Uplexia is a fun learning tool, not a medical diagnosis. If you're worried,
        please talk to a teacher or specialist.
      </footer>
    </main>
  );
}

function Chip({
  icon,
  label,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  bg: string;
}) {
  return (
    <div
      className="flex items-center justify-center gap-2 rounded-2xl border-2 border-border px-3 py-2 text-xs font-bold text-foreground md:text-sm"
      style={{ background: bg }}
    >
      {icon} {label}
    </div>
  );
}
