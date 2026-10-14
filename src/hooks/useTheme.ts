import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

export const THEME_KEY = "mdns.theme";

/**
 * HTML root elementiga tanlangan mavzuni qo'llash va localStorage ga saqlash
 */
export function applyTheme(theme: Theme): void {
  try {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

/**
 * Mavzuni standart DARK holatiga qaytarish (masalan: logout yoki tizimga qayta kirishda)
 */
export function resetThemeToDark(): void {
  applyTheme("dark");
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      // ignore
    }
    return "dark";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const resetToDark = () => {
    setThemeState("dark");
    resetThemeToDark();
  };

  return {
    theme,
    toggleTheme,
    setTheme: setThemeState,
    resetToDark,
  };
}

export default useTheme;
