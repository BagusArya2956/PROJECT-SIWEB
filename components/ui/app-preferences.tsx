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

export function ThemeModeButton({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useAppPreferences();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-[0_12px_26px_rgba(27,67,50,0.12)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(27,67,50,0.16)] active:scale-95 ${
        isDark
          ? "border-[#31513d] bg-[#101f16] text-[#d8f8dd]"
          : "border-[#dce8da] bg-white text-[#f59e0b]"
      } ${className}`}
      aria-pressed={isDark}
      aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      title={isDark ? "Mode gelap" : "Mode terang"}
    >
      <span
        key={theme}
        className="inline-flex transition duration-300 group-hover:rotate-12 group-hover:scale-110"
      >
        {isDark ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
      </span>
    </button>
  );
}

export function FooterThemeControl() {
  return <ThemeModeButton />;
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
