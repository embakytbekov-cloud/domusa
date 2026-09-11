// Приблизительные координаты городов из CITIES (src/data/constants.ts).
// Используются для:
//  1) определения ближайшего города к пользователю (геолокация Telegram),
//  2) построения приблизительной метки на карте объявления (src/components/ListingMap.tsx) —
//     точный адрес по продукту не раскрывается до бронирования, поэтому
//     карта всегда показывает круг/метку на уровне города, а не точный дом.

export interface CityCoord {
  city: string;
  lat: number;
  lng: number;
}

export const CITY_COORDS: CityCoord[] = [
  { city: "Лос-Анджелес", lat: 34.0522, lng: -118.2437 },
  { city: "Сан-Франциско", lat: 37.7749, lng: -122.4194 },
  { city: "Сан-Диего", lat: 32.7157, lng: -117.1611 },
  { city: "Сакраменто", lat: 38.5816, lng: -121.4944 },
  { city: "Чикаго", lat: 41.8781, lng: -87.6298 },
  { city: "Майами", lat: 25.7617, lng: -80.1918 },
  { city: "Нью-Йорк", lat: 40.7128, lng: -74.006 },
  { city: "Хьюстон", lat: 29.7604, lng: -95.3698 },
  { city: "Сиэтл", lat: 47.6062, lng: -122.3321 },
  { city: "Бостон", lat: 42.3601, lng: -71.0589 },
  { city: "Остин", lat: 30.2672, lng: -97.7431 },
  { city: "Филадельфия", lat: 39.9526, lng: -75.1652 },
];

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const a = s1 * s1 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * s2 * s2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Находит ближайший к точке (lat, lng) город из списка CITY_COORDS.
export function nearestCity(lat: number, lng: number): CityCoord | null {
  let best: CityCoord | null = null;
  let bestDist = Infinity;
  for (const c of CITY_COORDS) {
    const d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}

export function coordsForCity(city: string): CityCoord | undefined {
  return CITY_COORDS.find((c) => c.city === city);
}

// Небольшое стабильное (по строке district) смещение вокруг координат
// города — чтобы у разных районов одного города метки на карте не
// совпадали точь-в-точь, оставаясь при этом приблизительными.
export function approxDistrictCoord(city: string, district: string): { lat: number; lng: number } | null {
  const base = coordsForCity(city);
  if (!base) return null;
  let hash = 0;
  for (let i = 0; i < district.length; i++) hash = (hash * 31 + district.charCodeAt(i)) >>> 0;
  const angle = (hash % 360) * (Math.PI / 180);
  const radiusDeg = 0.02 + ((hash >> 8) % 100) / 10000; // ~1.5–3.5 км
  return {
    lat: base.lat + Math.sin(angle) * radiusDeg,
    lng: base.lng + Math.cos(angle) * radiusDeg,
  };
}
