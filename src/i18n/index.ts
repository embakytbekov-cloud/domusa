import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LANGUAGE, type LanguageCode } from "./languages";
import { DICTS } from "./translations";
import type { TranslationKey } from "./types";

export { LANGUAGES, DEFAULT_LANGUAGE, isLanguageCode } from "./languages";
export type { LanguageCode, LanguageInfo } from "./languages";
export type { TranslationKey } from "./types";

// Хранилище выбранного языка. persist(...) сохраняет выбор в localStorage
// под ключом "domusa-language", поэтому при повторном открытии Telegram
// Mini App язык, выбранный пользователем, применяется автоматически —
// без запроса к серверу и без перезагрузки страницы.
interface I18nState {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (language) => set({ language }),
    }),
    { name: "domusa-language" }
  )
);

function resolve(dict: unknown, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), dict);
  return typeof value === "string" ? value : path;
}

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  let result = str;
  for (const [key, value] of Object.entries(vars)) {
    result = result.split(`{${key}}`).join(String(value));
  }
  return result;
}

// translate — чистая функция без React: переводит строку по коду языка.
// Используется как в компонентах (через useT), так и в src/store/appStore.ts,
// где вызовы идут из обычных функций-экшенов, а не из тела компонента.
export function translate(language: LanguageCode, key: TranslationKey, vars?: Record<string, string | number>): string {
  const dict = DICTS[language] ?? DICTS[DEFAULT_LANGUAGE];
  return interpolate(resolve(dict, key), vars);
}

// t(key, vars) — переводит строку на текущий выбранный язык, читая его
// напрямую из стора. Годится для использования вне React-компонентов.
export function t(key: TranslationKey, vars?: Record<string, string | number>): string {
  return translate(useI18nStore.getState().language, key, vars);
}

// useT() — React-хук: подписывает компонент на смену языка, поэтому при
// выборе нового языка в Профиле все использующие его компоненты
// перерисовываются мгновенно, без перезагрузки страницы.
export function useT() {
  const language = useI18nStore((s) => s.language);
  return (key: TranslationKey, vars?: Record<string, string | number>) => translate(language, key, vars);
}
