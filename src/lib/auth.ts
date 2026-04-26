// Lightweight client-side "login" — stores the kid's name + avatar in
// localStorage so the app can greet them. Not a real auth system.
import { useEffect, useState } from "react";

const KEY = "uplexia:user";

export interface UplexiaUser {
  name: string;
  avatar: string; // emoji
  since: number;
}

export function loadUser(): UplexiaUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UplexiaUser) : null;
  } catch {
    return null;
  }
}

export function saveUser(u: UplexiaUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(u));
  window.dispatchEvent(new Event("uplexia:user-change"));
}

export function clearUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("uplexia:user-change"));
}

export function useUser(): UplexiaUser | null {
  const [user, setUser] = useState<UplexiaUser | null>(() => loadUser());
  useEffect(() => {
    const sync = () => setUser(loadUser());
    window.addEventListener("uplexia:user-change", sync);
    return () => window.removeEventListener("uplexia:user-change", sync);
  }, []);
  return user;
}
