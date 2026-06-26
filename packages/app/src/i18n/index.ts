import { es } from "./es";
import { en } from "./en";

export type Language = "es" | "en";
export type TranslationKeys = typeof es;

const translations: Record<Language, TranslationKeys> = { es, en };

let currentLanguage: Language = "es";

export function setLanguage(lang: Language) {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(path: string): string {
  const keys = path.split(".");
  let value: any = translations[currentLanguage];
  for (const key of keys) {
    value = value?.[key];
  }
  return typeof value === "string" ? value : path;
}

export function getAllTranslations(): TranslationKeys {
  return translations[currentLanguage];
}
