import { es } from "./es";
import { en } from "./en";
import { it } from "./it";

export type Language = "es" | "en" | "it";
export type TranslationKeys = typeof es;

const translations: Record<Language, TranslationKeys> = { es, en, it };

let currentLanguage: Language = "es";

export function setLanguage(lang: Language) {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(path: string, params?: Record<string, string | number>): string {
  const keys = path.split(".");
  let value: any = translations[currentLanguage];
  for (const key of keys) {
    value = value?.[key];
  }
  if (typeof value !== "string") return path;
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, k) => (params[k] != null ? String(params[k]) : `{${k}}`));
  }
  return value;
}

export function getAllTranslations(): TranslationKeys {
  return translations[currentLanguage];
}
