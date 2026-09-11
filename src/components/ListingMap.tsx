import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { approxDistrictCoord, coordsForCity } from "../data/cityCoords";

interface ListingMapProps {
  city: string;
  district: string;
  height?: number;
}

// Лёгкая карта на OpenStreetMap (Leaflet, без API-ключа и без тяжёлого
// Google Maps SDK) — заменяет прежнюю статичную заглушку на детальном
// экране объявления. Показывает не точный дом, а приблизительный круг
// вокруг района: точный адрес по продукту раскрывается только после
// бронирования (см. "Точный адрес — после брони" рядом), поэтому метка
// нарочно размыта, а не точечная.
export function ListingMap({ city, district, height = 150 }: ListingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const point = approxDistrictCoord(city, district) ?? coordsForCity(city);
    if (!point) return;

    const map = L.map(containerRef.current, {
      center: [point.lat, point.lng],
      zoom: 13,
      zoomControl: false,
      // attributionControl остаётся включённым (по умолчанию) — это
      // требование политики использования тайлов OpenStreetMap.
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.circle([point.lat, point.lng], {
      radius: 700,
      color: "#2f6f5e",
      weight: 2,
      fillColor: "#2f6f5e",
      fillOpacity: 0.18,
    }).addTo(map);

    L.circleMarker([point.lat, point.lng], {
      radius: 6,
      color: "#fdfcfa",
      weight: 3,
      fillColor: "#2f6f5e",
      fillOpacity: 1,
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [city, district]);

  return <div ref={containerRef} style={{ width: "100%", height, background: "var(--card-muted)" }} />;
}
