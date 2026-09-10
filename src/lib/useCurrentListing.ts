import { useEffect, useState } from "react";
import { useAppStore } from "../store/appStore";
import { listingsRepo } from "./repo";
import type { Listing } from "../types/listing";

// Общий хук для экрана объявления и прилипающей нижней панели брони —
// обе части используют один и тот же загруженный объект, без дублирования запроса.
export function useCurrentListing(): Listing | null {
  const currentId = useAppStore((s) => s.currentId);
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!currentId) {
      setListing(null);
      return;
    }
    listingsRepo.getById(currentId).then((l) => {
      if (!cancelled) setListing(l ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [currentId]);

  return listing;
}
