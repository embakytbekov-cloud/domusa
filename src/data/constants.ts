// Города и удобства — имена собственные и канонические ключи, они не
// переводятся построчно: CITIES это топонимы (одинаковые во всех языках
// интерфейса), а AMENITIES — стабильные ключи, для которых подпись берётся
// из словаря переводов через t(`amenity.${key}`) (см. src/i18n/).
export const CITIES = [
  "Лос-Анджелес",
  "Сан-Франциско",
  "Сан-Диего",
  "Сакраменто",
  "Чикаго",
  "Майами",
  "Нью-Йорк",
  "Хьюстон",
  "Сиэтл",
  "Бостон",
  "Остин",
  "Филадельфия",
] as const;

export const AMENITIES = ["wifi", "parking", "washer", "ac", "ownBathroom", "furniture", "pets"] as const;

export interface PriceBand {
  id: "under900" | "from900to1200" | "over1200" | "dayUnder100";
  min: number;
  max: number;
  day?: boolean;
}

export const PRICE_BANDS: PriceBand[] = [
  { id: "under900", min: 0, max: 900 },
  { id: "from900to1200", min: 900, max: 1200 },
  { id: "over1200", min: 1200, max: 99999 },
  { id: "dayUnder100", min: 0, max: 100, day: true },
];

export type CategoryKey = "all" | "room" | "day" | "month" | "nodep";

export interface Category {
  k: CategoryKey;
  w: string;
  h: string;
  radius: string;
  rot: string;
}

// label больше не хранится здесь — подпись категории берётся из словаря
// переводов по ключу t(`category.${k}`), чтобы значение (k) и его подпись
// на экране не были завязаны на один язык.
export const CATEGORIES: Category[] = [
  { k: "all", w: "15px", h: "15px", radius: "8px", rot: "0deg" },
  { k: "room", w: "16px", h: "12px", radius: "3px", rot: "0deg" },
  { k: "day", w: "14px", h: "14px", radius: "2px", rot: "45deg" },
  { k: "month", w: "16px", h: "16px", radius: "4px", rot: "0deg" },
  { k: "nodep", w: "16px", h: "9px", radius: "5px", rot: "0deg" },
];

export type TabKey = "search" | "saved" | "add" | "profile";

// Аналогично label вкладок берётся из словаря по ключу t(`nav.${k}`).
export const TABS: { k: TabKey }[] = [{ k: "search" }, { k: "saved" }, { k: "add" }, { k: "profile" }];

export const ACCENT_OPTIONS = ["#2f6f5e", "#b4553a", "#3a5fb4", "#1c1815"] as const;
export const DEFAULT_ACCENT = ACCENT_OPTIONS[0];

export const DEFAULT_HOUSE_RULES = [
  { ok: false, text: "Не курить в доме" },
  { ok: true, text: "Можно с питомцем" },
  { ok: true, text: "Тишина после 23:00" },
];
