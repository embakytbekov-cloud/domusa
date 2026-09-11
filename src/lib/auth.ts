import { supabase } from "./supabase";
import { getTelegramInitData } from "./telegram";

// Подтверждение профиля через Telegram (вызывается из useAppStore().confirmGate,
// которая теперь ждёт результат и не пускает пользователя дальше, пока
// сессия не создана по-настоящему — иначе загрузка фото/публикация падали
// с "Нет активной сессии Supabase"). Пока Supabase не подключён (нет .env),
// функция просто возвращает false и приложение остаётся на моках.
//
// Что происходит при реальном подключении:
//   1. Если в этом браузере/WebView уже есть активная Supabase-сессия
//      (supabase-js хранит её в localStorage) — переиспользуем её вместо
//      того, чтобы плодить новую анонимную учётку на каждое открытие
//      Gate-модалки для одного и того же Telegram-пользователя.
//   2. Иначе — анонимный вход в Supabase, создающий настоящую сессию
//      (auth.uid()) без пароля и без формы регистрации.
//   3. Edge Function telegram-link (supabase/functions/telegram-link)
//      проверяет подпись initData и привязывает реальный Telegram-профиль
//      (telegram_id, имя, фамилия, username) к этому auth.uid() в таблице
//      profiles (см. supabase/schema.sql).
export async function linkTelegramProfile(): Promise<boolean> {
  if (!supabase) return false;

  const initData = getTelegramInitData();
  if (!initData) return false;

  let session = (await supabase.auth.getSession()).data.session;
  if (!session) {
    const { data: sessionData, error: signInError } = await supabase.auth.signInAnonymously();
    if (signInError || !sessionData.session) return false;
    session = sessionData.session;
  }

  const { error } = await supabase.functions.invoke("telegram-link", {
    body: { initData },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  return !error;
}
