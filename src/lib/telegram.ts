import WebApp from "@twa-dev/sdk";
import type { TelegramUser } from "../types/listing";

// Обёртка над Telegram WebApp SDK. Внутри Telegram initDataUnsafe.user
// заполнен автоматически; вне Telegram (обычный браузер при разработке)
// подставляем тестового пользователя, чтобы экраны можно было смотреть
// в обычном браузере командой `npm run dev`.

const FALLBACK_USER: TelegramUser = {
  id: 0,
  name: "Алексей Ковалёв",
  first: "Алексей",
  username: "alexk",
  photo: "",
};

export function initTelegram() {
  try {
    WebApp.ready();
    WebApp.expand();
  } catch {
    // Не в Telegram — просто пропускаем, приложение продолжит работать как обычный веб-сайт.
  }
}

export function getTelegramUser(): TelegramUser {
  try {
    const u = WebApp.initDataUnsafe?.user;
    if (u) {
      return {
        id: u.id,
        name: [u.first_name, u.last_name].filter(Boolean).join(" "),
        first: u.first_name || "друг",
        username: u.username || "",
        photo: u.photo_url || "",
      };
    }
  } catch {
    // вне Telegram WebApp.initDataUnsafe недоступен
  }
  return FALLBACK_USER;
}

// initData — подписанная Telegram строка, которую нужно передать на бэкенд
// (Supabase Edge Function) для проверки подлинности пользователя по HMAC
// с секретом бота. См. supabase/functions/telegram-auth в README_RU.md.
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
