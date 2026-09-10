import { supabase } from "./supabase";
import { getTelegramInitData } from "./telegram";

// Подтверждение профиля через Telegram (вызывается из gate-сценариев —
// см. useAppStore().confirmGate). Пока Supabase не подключён, функция
// просто ничего не делает и приложение остаётся на моках.
//
// Что происходит при реальном подключении:
//   1. Анонимный вход в Supabase — создаёт настоящую сессию (auth.uid())
//      без пароля и без формы регистрации.
//   2. Edge Function telegram-link (supabase/functions/telegram-link)
//      проверяет подпись initData и привязывает Telegram-профиль
//      к этому auth.uid() в таблице profiles (см. supabase/schema.sql).
export async function linkTelegramProfile(): Promise<boolean> {
  if (!supabase) return false;

  const initData = getTelegramInitData();
  if (!initData) return false;

  const { data: sessionData, error: signInError } = await supabase.auth.signInAnonymously();
  if (signInError || !sessionData.session) return false;

  const { error } = await supabase.functions.invoke("telegram-link", {
    body: { initData },
    headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
  });

  return !error;
}
