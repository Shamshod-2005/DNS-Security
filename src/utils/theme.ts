export type Theme = "dark" | "light";

export const THEME_KEY = "mdns.theme";

/**
 * Saqlangan mavzuni olish (default: dark)
 */
export function getStoredTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // LocalStorage xavfsizlik cheklovlari bo'lsa
  }
  return "dark";
}

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
 * Mavzuni standart DARK holatiga qaytarish (logout yoki 401 sessiya tugaganda)
 */
export function resetThemeToDark(): void {
  applyTheme("dark");
}
