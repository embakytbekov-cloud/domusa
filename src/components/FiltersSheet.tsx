import { CITIES, PRICE_BANDS } from "../data/constants";
import { useAppStore } from "../store/appStore";
import { Chip } from "./Chip";
import { ALL_LISTINGS } from "../data/listings";
import { passFilters } from "../lib/filters";
import { useT } from "../i18n";

export function FiltersSheet() {
  const open = useAppStore((s) => s.filtersOpen);
  const close = useAppStore((s) => s.closeFilters);
  const cityFilter = useAppStore((s) => s.cityFilter);
  const bandFilter = useAppStore((s) => s.bandFilter);
  const category = useAppStore((s) => s.category);
  const toggleCity = useAppStore((s) => s.toggleCity);
  const toggleBand = useAppStore((s) => s.toggleBand);
  const resetFilters = useAppStore((s) => s.resetFilters);
  const t = useT();

  if (!open) return null;

  const total = ALL_LISTINGS.filter((l) => passFilters(l, category, cityFilter, bandFilter)).length;

  return (
    <>
      <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(20,16,13,.4)", animation: "fadeIn .2s ease", zIndex: 45 }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: "88%",
          overflowY: "auto",
          background: "var(--surface)",
          borderRadius: "24px 24px 0 0",
          padding: "10px 20px 28px",
          animation: "sheetUp .28s cubic-bezier(.22,1,.36,1)",
          zIndex: 46,
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 2, background: "var(--ink-14)", margin: "0 auto 16px" }} />
        <div style={{ fontSize: 19, fontWeight: 800, color: "var(--ink)", marginBottom: 16, letterSpacing: "-.4px" }}>{t("filters.title")}</div>

        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-70)", marginBottom: 10 }}>{t("filters.city")}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {CITIES.map((c) => (
            <Chip key={c} label={c} active={cityFilter.includes(c)} onClick={() => toggleCity(c)} />
          ))}
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-70)", marginBottom: 10 }}>{t("filters.price")}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {PRICE_BANDS.map((b, i) => (
            <Chip key={b.id} label={t(`priceBand.${b.id}`)} active={bandFilter.includes(i)} onClick={() => toggleBand(i)} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button type="button" onClick={resetFilters} style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", textDecoration: "underline" }}>
            {t("filters.reset")}
          </button>
          <button type="button" onClick={close} className="pill-btn" style={{ flex: 1, height: 50 }}>
            {t("filters.show", { count: total })}
          </button>
        </div>
      </div>
    </>
  );
}
