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

export const AMENITIES = [
  "Wi-Fi",
  "Парковка",
  "Стиральная машина",
  "Кондиционер",
  "Своя ванная",
  "Мебель",
  "Питомцы",
] as const;

export interface PriceBand {
  label: string;
  min: number;
  max: number;
  day?: boolean;
}

export const PRICE_BANDS: PriceBand[] = [
  { label: "до $900", min: 0, max: 900 },
  { label: "$900–1200", min: 900, max: 1200 },
  { label: "$1200+", min: 1200, max: 99999 },
  { label: "посуточно до $100", min: 0, max: 100, day: true },
];

export type CategoryKey = "all" | "room" | "day" | "month" | "nodep";

export interface Category {
  k: CategoryKey;
  label: string;
  w: string;
  h: string;
  radius: string;
  rot: string;
}

export const CATEGORIES: Category[] = [
  { k: "all", label: "Все", w: "15px", h: "15px", radius: "8px", rot: "0deg" },
  { k: "room", label: "Комнаты", w: "16px", h: "12px", radius: "3px", rot: "0deg" },
  { k: "day", label: "Посуточно", w: "14px", h: "14px", radius: "2px", rot: "45deg" },
  { k: "month", label: "Долгосрочно", w: "16px", h: "16px", radius: "4px", rot: "0deg" },
  { k: "nodep", label: "Без депозита", w: "16px", h: "9px", radius: "5px", rot: "0deg" },
];

export type TabKey = "search" | "saved" | "add" | "profile";

export const TABS: { k: TabKey; label: string }[] = [
  { k: "search", label: "Поиск" },
  { k: "saved", label: "Избранное" },
  { k: "add", label: "Объявления" },
  { k: "profile", label: "Профиль" },
];

export const ACCENT_OPTIONS = ["#2f6f5e", "#b4553a", "#3a5fb4", "#1c1815"] as const;
export const DEFAULT_ACCENT = ACCENT_OPTIONS[0];

export const DEFAULT_HOUSE_RULES = [
  { ok: false, text: "Не курить в доме" },
  { ok: true, text: "Можно с питомцем" },
  { ok: true, text: "Тишина после 23:00" },
];
