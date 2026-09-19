import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export const THEME_STORAGE_KEY = "pluscare-theme"; // 'light' | 'dark' | 'system'

const getSystemDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export function ThemeProvider({ children }) {
  // Default to the OS / browser theme ("system")
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || "system";
    } catch {
      return "system";
    }
  });
  const [systemDark, setSystemDark] = useState(getSystemDark);

  // Follow OS theme changes live while in "system" mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved = mode === "system" ? (systemDark ? "dark" : "light") : mode;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }, [mode, resolved]);

  const value = useMemo(
    () => ({ mode, setMode, resolved, isDark: resolved === "dark" }),
    [mode, resolved]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
