-- ДомUSA — схема базы данных Supabase (Postgres).
-- Применяется через Supabase SQL Editor или `supabase db push` (см. README_RU.md).
--
-- Модель авторизации: пользователь заходит через Telegram Mini App.
-- На клиенте вызывается supabase.auth.signInAnonymously() — Supabase создаёт
-- настоящую сессию (auth.uid()), без пароля. Затем Edge Function
-- `telegram-link` проверяет подпись initData Telegram и привязывает
-- telegram_id/имя/фото к этому auth.uid() в таблице profiles. Дальше все
-- RLS-политики работают как обычно, через auth.uid().

create extension if not exists "pgcrypto";

-- ---------- profiles ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  telegram_id bigint unique,
  telegram_username text,
  name text not null default '',
  photo_url text,
  is_host boolean not null default false,
  listings_published integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Профили видны всем" on public.profiles
  for select using (true);

create policy "Пользователь редактирует свой профиль" on public.profiles
  for update using (auth.uid() = id);

create policy "Пользователь создаёт свой профиль" on public.profiles
  for insert with check (auth.uid() = id);

-- ---------- listings ----------

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  city text not null,
  district text not null,
  title text not null,
  description text not null default '',
  price integer not null check (price > 0),
  term text not null check (term in ('day', 'month')),
  deposit boolean not null default true,
  type text not null default 'Отдельная комната',
  tags text[] not null default '{}',
  amenities text[] not null default '{}',
  rules jsonb not null default '[]', -- [{ "ok": true, "text": "Можно с питомцем" }, ...]
  photos text[] not null default '{}', -- пути в Supabase Storage (bucket "listing-photos")
  rating numeric(3, 2) not null default 0,
  reviews integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists listings_city_idx on public.listings (city);
create index if not exists listings_author_idx on public.listings (author_id);

alter table public.listings enable row level security;

create policy "Опубликованные объявления видны всем" on public.listings
  for select using (is_published = true or auth.uid() = author_id);

create policy "Автор создаёт объявление от своего имени" on public.listings
  for insert with check (auth.uid() = author_id);

create policy "Автор редактирует своё объявление" on public.listings
  for update using (auth.uid() = author_id);

create policy "Автор удаляет своё объявление" on public.listings
  for delete using (auth.uid() = author_id);

-- ---------- favorites (избранное) ----------

create table if not exists public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.favorites enable row level security;

create policy "Пользователь видит своё избранное" on public.favorites
  for select using (auth.uid() = user_id);

create policy "Пользователь добавляет в избранное от своего имени" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "Пользователь удаляет из своего избранного" on public.favorites
  for delete using (auth.uid() = user_id);

-- ---------- bookings (заявки на бронирование) ----------

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  guest_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  message text,
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy "Гость и хозяин видят бронирование" on public.bookings
  for select using (
    auth.uid() = guest_id
    or auth.uid() = (select author_id from public.listings where id = listing_id)
  );

create policy "Гость создаёт заявку от своего имени" on public.bookings
  for insert with check (auth.uid() = guest_id);

create policy "Гость и хозяин меняют статус заявки" on public.bookings
  for update using (
    auth.uid() = guest_id
    or auth.uid() = (select author_id from public.listings where id = listing_id)
  );

-- ---------- Storage: фото объявлений ----------
-- Создайте bucket "listing-photos" (Storage → New bucket, Public bucket = on)
-- и примените политики ниже (Storage → Policies), либо выполните SQL:

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "Фото объявлений видны всем" on storage.objects
  for select using (bucket_id = 'listing-photos');

create policy "Авторизованный пользователь загружает фото" on storage.objects
  for insert with check (bucket_id = 'listing-photos' and auth.role() = 'authenticated');
