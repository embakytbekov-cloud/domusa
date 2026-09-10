import type { CityRail, HouseRule, Listing } from "../types/listing";
import { DEFAULT_HOUSE_RULES } from "./constants";

// Мок-данные для разработки UI. Форма объекта соответствует таблице `listings`
// в Supabase (см. supabase/schema.sql) — когда подключим бэкенд, эта функция
// заменяется на запрос listingsRepo.getRails() из src/lib/repo.ts, а сами
// компоненты экранов менять не придётся.

let autoId = 0;
const nextId = () => String(++autoId);

function seedPhotos(seed: string): string[] {
  return [1, 2, 3].map((i) => `https://picsum.photos/seed/${seed}${i}/600/600`);
}

interface MakeOptions {
  type?: string;
  host?: string;
  description?: string;
  amenities?: string[];
  rules?: HouseRule[];
}

function mk(
  city: string,
  district: string,
  title: string,
  price: number,
  term: "day" | "month",
  rating: number,
  reviews: number,
  tags: string[],
  seed: string,
  opts: MakeOptions = {}
): Listing {
  return {
    id: nextId(),
    city,
    district,
    title,
    price,
    term,
    rating,
    reviews,
    tags,
    type: opts.type ?? (term === "day" ? "Жильё целиком" : "Отдельная комната"),
    host: opts.host ?? "Ирина",
    hostSince: 2023,
    photos: seedPhotos(seed),
    description:
      opts.description ??
      "Уютное жильё в русскоязычном районе. Рядом магазины, транспорт и школа. Хозяин говорит по-русски и помогает с обустройством на новом месте.",
    amenities: opts.amenities ?? ["Wi-Fi", "Кухня", "Стиральная машина", "Кондиционер", "Парковка", "Рабочий стол"],
    rules: opts.rules ?? DEFAULT_HOUSE_RULES,
  };
}

export const CITY_RAILS: CityRail[] = [
  {
    key: "ca",
    title: "Калифорния",
    sub: "Лос-Анджелес · Сан-Франциско · Сакраменто · Сан-Диего",
    items: [
      mk("Лос-Анджелес", "West Hollywood", "Комната в доме с бассейном", 1250, "month", 4.92, 38, ["Wi-Fi", "Парковка"], "lax1"),
      mk("Лос-Анджелес", "Santa Monica", "Студия в двух шагах от пирса", 145, "day", 4.97, 21, ["Без депозита", "Wi-Fi"], "lax2"),
      mk("Сан-Франциско", "Richmond District", "Комната у Golden Gate Park", 1450, "month", 4.88, 44, ["Wi-Fi", "Счета вкл."], "sf1"),
      mk("Сакраменто", "Arden-Arcade", "Комната в тихом районе", 820, "month", 4.79, 26, ["Без депозита", "Парковка"], "sac1"),
      mk("Сан-Диего", "Pacific Beach", "Апартаменты у океана", 120, "day", 4.95, 33, ["Wi-Fi", "Парковка"], "sd1"),
      mk("Лос-Анджелес", "Koreatown", "Бюджетная комната у метро", 750, "month", 4.71, 64, ["Метро", "Мебель"], "lax3"),
    ],
  },
  {
    key: "chi",
    title: "Чикаго",
    sub: "Ukrainian Village · Rogers Park · Skokie",
    items: [
      mk("Чикаго", "Ukrainian Village", "Комната в кирпичном доме", 890, "month", 4.86, 31, ["Wi-Fi", "Без депозита"], "chi1"),
      mk("Чикаго", "Rogers Park", "Апартаменты у озера", 95, "day", 4.81, 19, ["Wi-Fi", "Парковка"], "chi2"),
      mk("Чикаго", "Skokie", "Комната в семейном доме", 760, "month", 4.9, 27, ["Парковка", "Счета вкл."], "chi3"),
    ],
  },
  {
    key: "mia",
    title: "Майами, Флорида",
    sub: "Sunny Isles · Hallandale · Aventura",
    items: [
      mk("Майами", "Sunny Isles Beach", "Комната в кондо с видом на океан", 1400, "month", 4.94, 22, ["Бассейн", "Wi-Fi"], "mia1"),
      mk("Майами", "Hallandale Beach", "Студия посуточно у пляжа", 110, "day", 4.89, 47, ["Без депозита", "Wi-Fi"], "mia2"),
      mk("Майами", "Aventura", "Комната рядом с молом", 1050, "month", 4.83, 18, ["Парковка", "Кухня"], "mia3"),
    ],
  },
  {
    key: "ny",
    title: "Нью-Йорк",
    sub: "Бруклин · Брайтон-Бич · Шипсхед-Бей",
    items: [
      mk("Нью-Йорк", "Brighton Beach", "Комната в двух шагах от променада", 1150, "month", 4.87, 56, ["Метро", "Wi-Fi"], "ny1"),
      mk("Нью-Йорк", "Sheepshead Bay", "Отдельная спальня в квартире", 1290, "month", 4.9, 34, ["Без депозита", "Кухня"], "ny2"),
      mk("Нью-Йорк", "Bay Ridge", "Апартаменты посуточно", 130, "day", 4.92, 29, ["Wi-Fi", "Мебель"], "ny3"),
      mk("Нью-Йорк", "Midwood", "Комната в частном доме", 980, "month", 4.76, 41, ["Парковка", "Счета вкл."], "ny4"),
    ],
  },
  {
    key: "hou",
    title: "Хьюстон, Техас",
    sub: "Katy · Sugar Land · Memorial",
    items: [
      mk("Хьюстон", "Katy", "Комната в новом доме", 700, "month", 4.85, 23, ["Парковка", "Wi-Fi"], "hou1"),
      mk("Хьюстон", "Sugar Land", "Студия с отдельным входом", 85, "day", 4.8, 16, ["Без депозита", "Кухня"], "hou2"),
      mk("Хьюстон", "Memorial", "Спальня с ванной комнатой", 950, "month", 4.91, 30, ["Своя ванная", "Парковка"], "hou3"),
    ],
  },
  {
    key: "sea",
    title: "Сиэтл",
    sub: "Bellevue · Redmond · Kirkland",
    items: [
      mk("Сиэтл", "Bellevue", "Комната рядом с кампусом", 1150, "month", 4.88, 25, ["Wi-Fi", "Счета вкл."], "sea1"),
      mk("Сиэтл", "Redmond", "Спальня в доме IT-семьи", 1250, "month", 4.91, 19, ["Парковка", "Кухня"], "sea2"),
      mk("Сиэтл", "Kirkland", "Студия посуточно у озера", 105, "day", 4.86, 24, ["Без депозита", "Wi-Fi"], "sea3"),
    ],
  },
  {
    key: "bos",
    title: "Бостон",
    sub: "Brookline · Allston · Newton",
    items: [
      mk("Бостон", "Brookline", "Комната в викторианском доме", 1300, "month", 4.93, 37, ["Метро", "Кухня"], "bos1"),
      mk("Бостон", "Allston", "Студенческая комната у метро", 980, "month", 4.75, 42, ["Метро", "Мебель"], "bos2"),
      mk("Бостон", "Newton", "Спальня в тихом пригороде", 1180, "month", 4.89, 21, ["Парковка", "Wi-Fi"], "bos3"),
    ],
  },
  {
    key: "aus",
    title: "Остин",
    sub: "North Loop · Domain · East Austin",
    items: [
      mk("Остин", "North Loop", "Студия посуточно", 90, "day", 4.84, 20, ["Без депозита", "Парковка"], "aus1"),
      mk("Остин", "The Domain", "Комната в новом комплексе", 890, "month", 4.87, 26, ["Бассейн", "Парковка"], "aus2"),
      mk("Остин", "East Austin", "Комната в доме с двором", 760, "month", 4.79, 31, ["Wi-Fi", "Питомцы"], "aus3"),
    ],
  },
  {
    key: "phl",
    title: "Филадельфия",
    sub: "Northeast Philly · Bustleton · Center City",
    items: [
      mk("Филадельфия", "Northeast Philly", "Комната в тихом квартале", 690, "month", 4.77, 28, ["Парковка", "Мебель"], "phl1"),
      mk("Филадельфия", "Bustleton", "Спальня в русском районе", 740, "month", 4.82, 35, ["Без депозита", "Кухня"], "phl2"),
      mk("Филадельфия", "Center City", "Апартаменты посуточно", 115, "day", 4.9, 17, ["Wi-Fi", "Метро"], "phl3"),
    ],
  },
];

export const ALL_LISTINGS: Listing[] = CITY_RAILS.flatMap((r) => r.items);
