import { ALL_LISTINGS, CITY_RAILS } from "../data/listings";
import type { Listing, NewListingDraft } from "../types/listing";

// Слой доступа к данным. Сейчас работает на моках из src/data/listings.ts —
// когда будет готов проект Supabase, замените тела этих функций на запросы
// через src/lib/supabase.ts (клиент уже подготовлен). Сигнатуры функций
// возвращают Promise специально, чтобы экраны уже сейчас были написаны
// в асинхронном стиле и не потребовали переделки.

const FAKE_LATENCY = 120;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), FAKE_LATENCY));
}

export const listingsRepo = {
  async getRails() {
    return delay(CITY_RAILS);
  },

  async getById(id: string): Promise<Listing | undefined> {
    return delay(ALL_LISTINGS.find((l) => l.id === id));
  },

  async publish(draft: NewListingDraft): Promise<Listing> {
    // TODO(supabase): INSERT в таблицу listings от лица текущего пользователя
    // (author_id = auth.uid()), затем вернуть созданную запись.
    const created: Listing = {
      id: `local-${Date.now()}`,
      city: draft.city,
      district: draft.district,
      title: draft.title,
      price: Number(draft.price) || 0,
      term: draft.term === "Посуточно" ? "day" : "month",
      rating: 0,
      reviews: 0,
      tags: draft.deposit === "Нет" ? ["Без депозита"] : [],
      type: "Отдельная комната",
      host: "Вы",
      hostSince: new Date().getFullYear(),
      photos: [],
      description: draft.desc,
      amenities: draft.amenities,
      rules: [],
    };
    return delay(created);
  },
};
