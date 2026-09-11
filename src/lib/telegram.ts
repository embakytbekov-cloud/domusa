import WebApp from "@twa-dev/sdk";
import type { WebApp as TelegramWebApp } from "@twa-dev/types";
import type { TelegramUser } from "../types/listing";

// ВАЖНО: для ЧТЕНИЯ живого состояния (initDataUnsafe/initData/
// LocationManager/openInvoice) здесь и во всех остальных местах
// приложения НЕ используется сам объект `WebApp`, полученный дефолтным
// экспортом `@twa-dev/sdk`. В продакшен-сборке (vite build → Rollup)
// интероп CJS/ESM этого пакета даёт объект, который не совпадает по
// ссылке с настоящим window.Telegram.WebApp (проверено отладкой:
// экспортированный WebApp оказывается обёрнут в { default: ... }, и его
// initDataUnsafe/initData читаются как undefined, даже когда в
// window.Telegram.WebApp уже лежат реальные данные). Из-за этого не
// работали не только определение пользователя, но и геолокация
// (src/lib/geolocation.ts) и оплата (src/lib/payments.ts) — все три
// молча "проглатывали" ошибку через try/catch.
//
// При этом сам импорт `WebApp` из "@twa-dev/sdk" мы оставляем и вызываем
// его методы в initTelegram() ниже — не потому что доверяем этому
// конкретному объекту, а потому что использование импортированного
// значения не даёт сборщику удалить его как "неиспользуемый побочный
// эффект": package.json пакета помечает как side-effect-ful только
// internal dist/telegram-web-apps.js, и side-effect-only `import
// "@twa-dev/sdk"` (без использования значения) в проде оказывался
// вытеснен tree-shaking'ом Rollup — а вместе с ним пропадала и
// гарантия, что window.Telegram.WebApp вообще будет создан (в
// окружениях, где внешний <script src="https://telegram.org/..."> из
// index.html недоступен). Поэтому: WebApp.ready()/.expand() ниже держат
// импорт "живым" для сборщика, а getWebApp() ниже — источник истины для
// всех реальных чтений состояния.
export function getWebApp(): TelegramWebApp | undefined {
  return (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
}

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
    const u = getWebApp()?.initDataUnsafe?.user;
    if (!u) return null;
    return {
      id: u.id,
      name: [u.first_name, u.last_name].filter(Boolean).join(" ") || u.first_name,
      first: u.first_name,
      username: u.username || "",
      photo: u.photo_url || "",
    };
  } catch {
    // вне Telegram initDataUnsafe недоступен
    return null;
  }
}

// initData — подписанная Telegram строка, которую нужно передать на бэкенд
// (Supabase Edge Function telegram-link) для проверки подлинности
// пользователя по HMAC с секретом бота — см. src/lib/auth.ts.
export function getTelegramInitData(): string {
  try {
    return getWebApp()?.initData || "";
  } catch {
    return "";
  }
}

export function isInsideTelegram(): boolean {
  try {
    return Boolean(getWebApp()?.initData);
  } catch {
    return false;
  }
}

// Гонка инициализации: скрипт telegram-web-app.js подключён в index.html
// и выполняется до React, но сам нативный клиент Telegram (особенно
// Android-WebView и холодный старт) иногда заполняет
// WebApp.initDataUnsafe.user не синхронно с загрузкой скрипта, а с
// небольшой асинхронной задержкой. Если проверить getTelegramUser() ровно
// один раз в момент монтирования (как раньше), можно словить null именно
// в этот короткий зазор — и приложение навсегда закрепляет пользователя
// как "Гостя" до перезапуска, хотя на деле мы внутри Telegram.
//
// Поэтому вместо одной проверки опрашиваем WebApp.initDataUnsafe.user
// с небольшим интервалом в течение короткого окна на старте; как только
// данные появляются — резолвим сразу, не дожидаясь таймаута.
export function waitForTelegramUser(timeoutMs = 3000, intervalMs = 150): Promise<TelegramUser | null> {
  return new Promise((resolve) => {
    const immediate = getTelegramUser();
    if (immediate) {
      resolve(immediate);
      return;
    }

    const start = Date.now();
    const timer = setInterval(() => {
      const user = getTelegramUser();
      if (user || Date.now() - start >= timeoutMs) {
        clearInterval(timer);
        resolve(user);
      }
    }, intervalMs);
  });
}
