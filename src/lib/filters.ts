import { PRICE_BANDS, type CategoryKey } from "../data/constants";
import type { Listing } from "../types/listing";

export function passFilters(l: Listing, category: CategoryKey, cityFilter: string[], bandFilter: number[]): boolean {
  if (category === "day" && l.term !== "day") return false;
  if (category === "month" && l.term !== "month") return false;
  if (category === "room" && l.type !== "Отдельная комната") return false;
  if (category === "nodep" && !l.tags.includes("Без депозита")) return false;
  if (cityFilter.length && !cityFilter.includes(l.city)) return false;
  if (
    bandFilter.length &&
    !bandFilter.some((i) => {
      const b = PRICE_BANDS[i];
      if (!b) return false;
      if (b.day && l.term !== "day") return false;
      return l.price >= b.min && l.price < b.max;
    })
  )
    return false;
  return true;
}
