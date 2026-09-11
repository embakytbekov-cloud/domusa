// Список языков, поддерживаемых приложением, и их коды.
// Порядок в LANGUAGES — это порядок, в котором языки показываются
// в выборе языка в Профиле (см. src/components/LanguageSheet.tsx).

export type LanguageCode = "ky" | "kk" | "uz" | "uk" | "tr" | "en" | "ru";

export interface LanguageInfo {
  code: LanguageCode;
  nativeName: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: "ky", nativeName: "Кыргызча" },
  { code: "kk", nativeName: "Қазақша" },
  { code: "uz", nativeName: "O'zbekcha" },
  { code: "uk", nativeName: "Українська" },
  { code: "tr", nativeName: "Türkçe" },
  { code: "en", nativeName: "English" },
  { code: "ru", nativeName: "Русский" },
];

export const DEFAULT_LANGUAGE: LanguageCode = "ru";

export function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGES.some((l) => l.code === value);
}
