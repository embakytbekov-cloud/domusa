import { createClient } from "@supabase/supabase-js";

// Заполните .env (скопируйте .env.example) значениями из вашего проекта
// Supabase: Project Settings → API → Project URL / anon public key.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anonKey);

// Пока Supabase не подключён (нет .env), клиент не создаётся — приложение
// продолжает работать на моках из src/lib/repo.ts. Как только переменные
// окружения заданы, можно постепенно переводить repo.ts на реальные запросы.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
