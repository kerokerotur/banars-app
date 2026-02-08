import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";

  // Actions
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      resolvedTheme: "light",

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      initializeTheme: () => {
        const stored = localStorage.getItem("theme-storage");
        if (stored) {
          try {
            const { state } = JSON.parse(stored);
            applyTheme(state.theme);
          } catch (error) {
            console.error("テーマの読み込みに失敗しました:", error);
            applyTheme("system");
          }
        } else {
          applyTheme("system");
        }
      },
    }),
    {
      name: "theme-storage",
    }
  )
);

/**
 * テーマを適用
 */
function applyTheme(theme: Theme) {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}
