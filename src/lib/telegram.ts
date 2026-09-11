import WebApp from "@twa-dev/sdk";
import type { TelegramUser } from "../types/listing";

// Обёртка над Telegram WebApp SDK. Внутри Telegram initDataUnsafe.user
// заполнен реальными данными пользователя (id, имя, фамилия, юзернейм,
// фото профиля) — их и читаем. Вне Telegram (обычный браузер) реальных
// данных нет: раньше здесь подставлялся фиктивный пользователь "Алексей
// Ковалёв", из-за чего экраны можно было пройти без настоящей Supabase-
// сессии и позже ловить "Нет активной сессии Supabase" при загрузке фото
// или публикации. Теперь никакого фолбэка нет — getTelegramUser()
// возвращает null, и действия, требующие профиля, явно просят открыть
// приложение в Telegram (см. gate() в src/store/appStore.ts).

export function initTelegram() {
  try {
    WebApp.ready();
    WebApp.expand();
  } catch {
    // Не в Telegram — просто пропускаем, приложение продолжит работать как обычный веб-сайт.
  }
}

export function getTelegramUser(): TelegramUser | null {
  try {
    const u = WebApp.initDataUnsafe?.user;
    if (!u) return null;
    return {
      id: u.id,
      name: [u.first_name, u.last_name].filter(Boolean).join(" ") || u.first_name,
      first: u.first_name,
      username: u.username || "",
      photo: u.photo_url || "",
    };
  } catch {
    // вне Telegram WebApp.initDataUnsafe недоступен
    return null;
  }
}

// initData — подписанная Telegram строка, которую нужно передать на бэкенд
// (Supabase Edge Function telegram-link) для проверки подлинности
// пользователя по HMAC с секретом бота — см. src/lib/auth.ts.
export function getTelegramInitData(): string {
  try {
    return WebApp.initData || "";
  } catch {
    return "";
  }
}

export function isInsideTelegram(): boolean {
  try {
    return Boolean(WebApp.initData);
  } catch {
    return false;
  }
}
