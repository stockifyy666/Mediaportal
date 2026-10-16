"use client";

import { LuMoon, LuSun } from "react-icons/lu";

export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      // Storage unavailable (private mode) — the toggle still works for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className={`rounded-lg p-2 text-muted transition hover:bg-surface-hover hover:text-fg ${className}`}
    >
      {/* Moon in light mode, sun in dark mode */}
      <LuMoon className="h-4 w-4 dark:hidden" aria-hidden="true" />
      <LuSun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
    </button>
  );
}
