// Shared text-to-speech helpers + global mute state (persisted in localStorage).
import { useEffect, useState } from "react";

const MUTE_KEY = "readright:muted";

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MUTE_KEY) === "1";
}

export function setMuted(v: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MUTE_KEY, v ? "1" : "0");
  if (v && window.speechSynthesis) window.speechSynthesis.cancel();
  window.dispatchEvent(new Event("readright:mute-change"));
}

export function speak(text: string, rate = 0.9) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (isMuted()) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function useMuted(): [boolean, (v: boolean) => void] {
  const [muted, setMutedState] = useState<boolean>(() => isMuted());
  useEffect(() => {
    const sync = () => setMutedState(isMuted());
    window.addEventListener("readright:mute-change", sync);
    return () => window.removeEventListener("readright:mute-change", sync);
  }, []);
  return [muted, (v: boolean) => setMuted(v)];
}
