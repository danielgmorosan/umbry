import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
}

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      toggle: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        apply(next);
        set({ theme: next });
      },
      set: (t) => {
        apply(t);
        set({ theme: t });
      },
    }),
    {
      name: "gossip-theme",
      onRehydrateStorage: () => (state) => {
        if (state) apply(state.theme);
      },
    },
  ),
);
