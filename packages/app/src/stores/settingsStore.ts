import { create } from "zustand";

export type Currency = "PYG" | "USD";

const STORAGE_KEY = "consientemente_currency";

function readStored(): Currency {
  try {
    if (typeof localStorage === "undefined") return "PYG";
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "USD" ? "USD" : "PYG";
  } catch {
    return "PYG";
  }
}

interface SettingsState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  currency: readStored(),
  setCurrency: (c) => {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, c);
    } catch {}
    set({ currency: c });
  },
}));
