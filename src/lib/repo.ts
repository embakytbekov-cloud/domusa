import { ALL_LISTINGS, CITY_RAILS } from "../data/listings";
import { CITIES } from "../data/constants";
import type { CityRail, Listing, NewListingDraft } from "../types/listing";
import { supabase, supabaseEnabled } from "./supabase";

// Слой доступа к данным. Когда Supabase подключён (.env заполнен —
// см. src/lib/supabase.ts), читаем и пишем реальные объявления в таблицу
// public.listings (см. supabase/schema.sql). Без .env приложение
// продолжает работать на моках из src/data/listings.ts — это удобно для
// разработки интерфейса без живого бэкенда.

const FAKE_LATENCY = 120;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), FAKE_LATENCY));
}

// Локально опубликованные объявления, когда Supabase не подключён —
// живут только в памяти вкладки, чтобы экран "Мои объявления" тоже можно
// было проверить без бэкенда.
const mockMyListings: Listing[] = [];

interface ListingRow {
  id: string;
  city: string;
  district: string;
  title: string;
  description: string;
  price: number;
  term: "day" | "month";
  deposit: boolean;
  type: string;
  tags: string[] | null;
  amenities: string[] | null;
  rules: { ok: boolean; text: string }[] | null;
  photos: string[] | null;
  rating: number | string | null;
  reviews: number | null;
  created_at: string;
  profiles?: { name: string | null; created_at?: string | null } | null;
}

function rowToListing(row: ListingRow): Listing {
  return {
    id: row.id,
    city: row.city,
    district: row.district,
    title: row.title,
    price: row.price,
    term: row.term,
    rating: Number(row.rating) || 0,
    reviews: row.reviews ?? 0,
    tags: row.tags ?? [],
    type: row.type,
    host: row.profiles?.name || "Хозяин",
    hostSince: row.profiles?.created_at
      ? new Date(row.profiles.created_at).getFullYear()
      : new Date(row.created_at).getFullYear(),
    photos: row.photos ?? [],
    description: row.description,
    amenities: row.amenities ?? [],
    rules: row.rules ?? [],
  };
}

const LISTING_SELECT = "*, profiles(name, created_at)";

async function currentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const listingsRepo = {
  async getRails(): Promise<CityRail[]> {
    if (supabaseEnabled && supabase) {
      const { data, error } = await supabase
        .from("listings")
        .select(LISTING_SELECT)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as unknown as ListingRow[];
      // Упрощённая группировка живых данных: один рейл на город (в отличие
      // от кураторских региональных рейлов в моках из src/data/listings.ts).
      return CITIES.map((city) => ({
        key: city,
        title: city,
        sub: "",
        items: rows.filter((r) => r.city === city).map(rowToListing),
      })).filter((rail) => rail.items.length > 0);
    }
    return delay(CITY_RAILS);
  },

  async getById(id: string): Promise<Listing | undefined> {
    // Лента (FeedScreen) намеренно остаётся на кураторских моках из
    // src/data/listings.ts (их id — простые числа "1", "2", ...), поэтому
    // сначала проверяем моки и только потом идём в реальную таблицу
    // Supabase (там id — UUID). Иначе, как только .env подключён, клик по
    // любому демо-объявлению на главной ленте вёл бы на пустой запрос к
    // живой (изначально пустой) базе и экран навсегда оставался бы на
    // "Загрузка…".
    const mock = ALL_LISTINGS.find((l) => l.id === id) ?? mockMyListings.find((l) => l.id === id);
    if (mock) return delay(mock);

    if (supabaseEnabled && supabase) {
      const { data, error } = await supabase.from("listings").select(LISTING_SELECT).eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? rowToListing(data as unknown as ListingRow) : undefined;
    }
    return undefined;
  },

  // Объявления текущего пользователя — используется и экраном "Мои
  // объявления" (см. AddScreen.tsx), и в appStore.publish() чтобы решить,
  // бесплатна ли следующая публикация (первая — бесплатно, дальше $3).
  async getMyListings(): Promise<Listing[]> {
    if (supabaseEnabled && supabase) {
      const uid = await currentUserId();
      if (!uid) return [];
      const { data, error } = await supabase
        .from("listings")
        .select(LISTING_SELECT)
        .eq("author_id", uid)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => rowToListing(r as unknown as ListingRow));
    }
    return delay([...mockMyListings]);
  },

  async publish(draft: NewListingDraft): Promise<Listing> {
    if (supabaseEnabled && supabase) {
      const uid = await currentUserId();
      if (!uid) throw new Error("Нет активной сессии Supabase — сначала подтвердите профиль через Telegram");
      const { data, error } = await supabase
        .from("listings")
        .insert({
          author_id: uid,
          city: draft.city,
          district: draft.district,
          title: draft.title,
          description: draft.desc,
          price: Number(draft.price) || 0,
          term: draft.term,
          deposit: draft.deposit,
          type: "Отдельная комната",
          tags: draft.deposit ? [] : ["Без депозита"],
          amenities: draft.amenities,
          photos: draft.photos,
        })
        .select(LISTING_SELECT)
        .single();
      if (error) throw error;
      return rowToListing(data as unknown as ListingRow);
    }

    const created: Listing = {
      id: `local-${Date.now()}`,
      city: draft.city,
      district: draft.district,
      title: draft.title,
      price: Number(draft.price) || 0,
      term: draft.term,
      rating: 0,
      reviews: 0,
      tags: draft.deposit ? [] : ["Без депозита"],
      type: "Отдельная комната",
      host: "Вы",
      hostSince: new Date().getFullYear(),
      photos: draft.photos,
      description: draft.desc,
      amenities: draft.amenities,
      rules: [],
    };
    mockMyListings.unshift(created);
    return delay(created);
  },

  // Опрашивает "Мои объявления" в ожидании записи, созданной вебхуком
  // Telegram-оплаты (см. supabase/functions/telegram-webhook) уже ПОСЛЕ
  // того, как Telegram.WebApp.openInvoice вернул статус "paid" на клиенте.
  // Возвращает новое объявление, как только оно появляется, либо null по
  // истечении таймаута (вебхук мог обработать платёж чуть позже — тогда
  // объявление просто появится в списке при следующем открытии экрана).
  async waitForNewListing(previousCount: number, timeoutMs = 12000): Promise<Listing | null> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const mine = await this.getMyListings();
      if (mine.length > previousCount) return mine[0] ?? null;
      await new Promise((r) => setTimeout(r, 1500));
    }
    return null;
  },
};
