// Основные типы данных приложения ДомUSA.
// Эти же формы полей будут соответствовать таблицам в Supabase (см. supabase/schema.sql),
// поэтому при переходе с моков на реальные данные типы менять не придётся.

export type RentTerm = "day" | "month";

export interface HouseRule {
  ok: boolean;
  text: string;
}

export interface Listing {
  id: string;
  city: string;
  district: string;
  title: string;
  price: number;
  term: RentTerm;
  rating: number;
  reviews: number;
  tags: string[];
  type: string;
  host: string;
  hostSince: number;
  photos: string[];
  description: string;
  amenities: string[];
  rules: HouseRule[];
}

export interface CityRail {
  key: string;
  title: string;
  sub: string;
  items: Listing[];
}

export interface TelegramUser {
  id: number;
  name: string;
  first: string;
  username: string;
  photo: string;
}

export type NewListingDraft = {
  title: string;
  city: string;
  district: string;
  term: RentTerm;
  price: string;
  deposit: boolean;
  desc: string;
  photos: number;
  amenities: string[];
};
