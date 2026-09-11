import WebApp from "@twa-dev/sdk";
import { nearestCity } from "../data/cityCoords";

// Геолокация пользователя через нативный Telegram LocationManager (Bot API
// 8.0+, поддерживается @twa-dev/sdk ^8). В отличие от обычного
// navigator.geolocation, LocationManager использует системный диалог
// разрешений Telegram и работает единообразно в iOS/Android-клиентах Mini
// App. Вне Telegram (обычный браузер при разработке) используем
// navigator.geolocation как запасной вариант.
//
// Используется на старте приложения, чтобы определить ближайший к
// пользователю город из CITY_COORDS и поднять его рейл в ленте наверх —
// это единственное, для чего приложению нужна геолокация (см.
// requestNearestCity ниже и её использование в useAppStore.initUser).

export interface GeoResult {
  lat: number;
  lng: number;
}

function getLocationViaTelegram(): Promise<GeoResult | null> {
  return new Promise((resolve) => {
    const lm = WebApp.LocationManager;
    if (!lm) {
      resolve(null);
      return;
    }
    try {
      lm.init((isInitialized) => {
        if (!isInitialized || !lm.isLocationAvailable) {
          resolve(null);
          return;
        }
        lm.getLocation((data) => {
          resolve(data ? { lat: data.latitude, lng: data.longitude } : null);
        });
      });
    } catch {
      resolve(null);
    }
  });
}

function getLocationViaBrowser(): Promise<GeoResult | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 6000, maximumAge: 10 * 60 * 1000 }
    );
  });
}

export async function requestUserLocation(): Promise<GeoResult | null> {
  const viaTelegram = await getLocationViaTelegram();
  if (viaTelegram) return viaTelegram;
  return getLocationViaBrowser();
}

// Определяет ближайший к пользователю город приложения (из CITIES) по его
// текущей геопозиции. Возвращает null, если разрешение не дано или
// геолокация недоступна — тогда лента просто остаётся в порядке по
// умолчанию (без ошибок и без повторных запросов).
export async function requestNearestCity(): Promise<string | null> {
  const loc = await requestUserLocation();
  if (!loc) return null;
  const nearest = nearestCity(loc.lat, loc.lng);
  return nearest?.city ?? null;
}
