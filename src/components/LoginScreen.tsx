import { useState, type FormEvent } from "react";
import { Sparkles, Rocket } from "lucide-react";
import { saveUser } from "@/lib/auth";

const AVATARS = ["🦉", "🦊", "🐼", "🦄", "🐯", "🐸", "🐵", "🐨"];

export function LoginScreen() {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Please enter your name (at least 2 letters).");
      return;
    }
    saveUser({ name: trimmed, avatar, since: Date.now() });
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{ background: "var(--gradient-sky)" }}
    >
      <div
        className="w-full max-w-lg rounded-3xl border-2 border-border p-8 md:p-10"
        style={{ background: "var(--card)", boxShadow: "var(--shadow-pop)" }}
      >
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full text-5xl"
            style={{ background: "var(--gradient-fun)" }}
          >
            🦉
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Welcome to <span style={{ color: "var(--primary)" }}>Uplexia</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Let's set up your reading adventure!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground"
            >
              <Sparkles className="h-4 w-4 text-primary" /> What's your name?
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g. Alex"
              autoFocus
              className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-lg font-semibold text-foreground outline-none transition focus:border-primary"
            />
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-foreground">
              Pick your reading buddy
            </p>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  aria-pressed={avatar === a}
                  className="flex h-14 items-center justify-center rounded-2xl border-2 text-3xl transition-transform hover:scale-110"
                  style={{
                    borderColor: avatar === a ? "var(--primary)" : "var(--border)",
                    background:
                      avatar === a ? "var(--fun-mint)" : "var(--background)",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-lg font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
            style={{
              background: "var(--gradient-fun)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <Rocket className="h-5 w-5" /> Start my adventure
          </button>

          <p className="text-center text-xs text-muted-foreground">
            🔒 Your name stays on this device — nothing is sent anywhere.
          </p>
        </form>
      </div>
    </main>
  );
}
