"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AppTheme = "light" | "dark";

const THEME_KEY = "shipin_theme";

type PreferenceContextValue = {
  theme: AppTheme;
  isDark: boolean;
  setTheme: (theme: AppTheme) => void;
};

const PreferenceContext = createContext<PreferenceContextValue | null>(null);

function readTheme(): AppTheme {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

function applyTheme(theme: AppTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = "id";
  document.documentElement.classList.toggle("shipin-dark", theme === "dark");
}

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>("light");

  useEffect(() => {
    const savedTheme = readTheme();
    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const setTheme = useCallback((nextTheme: AppTheme) => {
    setThemeState(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      setTheme
    }),
    [setTheme, theme]
  );

  return <PreferenceContext.Provider value={value}>{children}</PreferenceContext.Provider>;
}

export function useAppPreferences() {
  const context = useContext(PreferenceContext);
  if (!context) {
    throw new Error("useAppPreferences must be used inside AppPreferencesProvider");
  }
  return context;
}

export function FooterThemeControl() {
  const { theme, setTheme } = useAppPreferences();
  const isDark = theme === "dark";

  return (
    <div className="group w-full max-w-[240px] rounded-[18px] border border-[#dce8da] bg-white/72 p-3.5 shadow-[0_14px_34px_rgba(27,67,50,0.08)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-shipin-deep/25 hover:shadow-[0_18px_42px_rgba(27,67,50,0.12)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-shipin-deep/80">
          Tema
        </p>
        <p className="text-[12px] font-semibold text-shipin-text">
          {isDark ? "Gelap" : "Terang"}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`relative flex h-10 w-full items-center overflow-hidden rounded-full border p-1 transition duration-300 active:scale-[0.98] ${
          isDark
            ? "border-[#31513d] bg-[#101f16] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            : "border-[#cfded0] bg-[#f7faf5] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]"
        }`}
        aria-pressed={isDark}
        aria-label={isDark ? "Nonaktifkan mode gelap" : "Aktifkan mode gelap"}
      >
        <span className="pointer-events-none absolute inset-y-1 left-1 right-1 grid grid-cols-2">
          <span className={`inline-flex items-center justify-center transition duration-300 ${isDark ? "text-[#8a958d]" : "text-white"}`}>
            <SunIcon className="h-4 w-4" />
          </span>
          <span className={`inline-flex items-center justify-center transition duration-300 ${isDark ? "text-white" : "text-shipin-text"}`}>
            <MoonIcon className="h-4 w-4" />
          </span>
        </span>
        <span
          className={`relative h-8 w-1/2 rounded-full bg-shipin-deep shadow-[0_10px_24px_rgba(23,106,58,0.26)] transition duration-300 ease-out ${
            isDark ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <span className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_55%)]" />
        </span>
      </button>
    </div>
  );
}

function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
    </svg>
  );
}

function MoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
      <path d="M20.2 14.7A7.8 7.8 0 0 1 9.3 3.8 8.7 8.7 0 1 0 20.2 14.7Z" />
    </svg>
  );
}
