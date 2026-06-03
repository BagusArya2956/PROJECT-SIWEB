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
    <div className="rounded-[22px] border border-[#dce8da] bg-[#f7fbf5] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#69766d]">
        Tema Tampilan
      </p>
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`mt-2 flex h-10 w-full items-center rounded-full border p-1 transition ${
          isDark
            ? "justify-end border-[#9df28f] bg-[#173322]"
            : "justify-start border-[#cfded0] bg-white"
        }`}
        aria-pressed={isDark}
        aria-label={isDark ? "Nonaktifkan mode gelap" : "Aktifkan mode gelap"}
      >
        <span className="inline-flex h-8 min-w-[112px] items-center justify-center rounded-full bg-[#1b7a37] px-4 text-[12px] font-bold text-white shadow-[0_8px_18px_rgba(27,122,55,0.2)]">
          {isDark ? "Mode Gelap" : "Mode Terang"}
        </span>
      </button>
    </div>
  );
}
