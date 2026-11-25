"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const subscribeToTheme = (callback: () => void) => {
  window.addEventListener("trellis-theme-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("trellis-theme-change", callback);
    window.removeEventListener("storage", callback);
  };
};

const getThemeSnapshot = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => "light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("trellis-theme");
    const initialTheme: Theme =
      savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    window.dispatchEvent(new CustomEvent("trellis-theme-change", { detail: initialTheme }));
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("trellis-theme", nextTheme);
    window.dispatchEvent(new CustomEvent("trellis-theme-change", { detail: nextTheme }));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="grid h-10 w-10 place-items-center rounded-lg border border-[#e5e9e6] bg-white text-[#526174] transition hover:bg-[#f4f6fa] dark:border-[#26334a] dark:bg-[#111b2d] dark:text-[#d4deed] dark:hover:bg-[#18243a]"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
