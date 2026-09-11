import { CATEGORIES } from "../data/constants";
import { CITY_RAILS } from "../data/listings";
import { useAppStore } from "../store/appStore";
import { ListingCard } from "../components/ListingCard";
import { passFilters } from "../lib/filters";
import { ShapeIcon } from "../components/ShapeIcon";
import { useT } from "../i18n";

export function FeedScreen() {
  const category = useAppStore((s) => s.category);
  const setCategory = useAppStore((s) => s.setCategory);
  const cityFilter = useAppStore((s) => s.cityFilter);
  const bandFilter = useAppStore((s) => s.bandFilter);
  const openFilters = useAppStore((s) => s.openFilters);
  const t = useT();

  const rails = CITY_RAILS.map((r) => ({
    ...r,
    items: r.items.filter((l) => passFilters(l, category, cityFilter, bandFilter)),
  })).filter((r) => r.items.length > 0);

  const total = rails.reduce((sum, r) => sum + r.items.length, 0);
  const searchTitle = cityFilter.length ? cityFilter.join(", ") : t("feed.searchPlaceholder");
  const searchSub = t("feed.resultsCount", { count: total });

  return (
    <div style={{ animation: "fadeIn .25s ease", paddingBottom: 96 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 18px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 9, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 11, height: 11, border: "2px solid var(--surface)", borderRadius: 2, transform: "rotate(45deg)" }} />
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.7px", color: "var(--ink)" }}>
            Дом<span style={{ color: "var(--accent)" }}>USA</span>
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-45)", letterSpacing: ".2px" }}>{t("feed.tagline")}</div>
      </div>

      <div style={{ position: "sticky", top: 0, zIndex: 5, background: "var(--surface)", padding: "2px 18px 0" }}>
        <button
          type="button"
          onClick={openFilters}
          style={{
            height: 54,
            width: "100%",
            border: "1px solid var(--ink-10)",
            borderRadius: 28,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 8px 0 18px",
            background: "#fff",
            boxShadow: "0 4px 16px -4px rgba(40,30,24,.16)",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ width: 15, height: 15, borderRadius: 8, border: "2px solid var(--ink)", flex: "none" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.2px" }}>{searchTitle}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-50)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{searchSub}</div>
          </div>
          <div style={{ width: 38, height: 38, flex: "none", borderRadius: 19, background: "var(--ink-05)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
            <div style={{ width: 14, height: 1.6, background: "var(--ink)" }} />
            <div style={{ width: 9, height: 1.6, background: "var(--ink)" }} />
            <div style={{ width: 5, height: 1.6, background: "var(--ink)" }} />
          </div>
        </button>

        <div style={{ display: "flex", gap: 22, overflowX: "auto", padding: "12px 0 0", borderBottom: "1px solid var(--ink-08)" }}>
          {CATEGORIES.map((c) => {
            const on = category === c.k;
            return (
              <button
                key={c.k}
                type="button"
                onClick={() => setCategory(c.k)}
                style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, cursor: "pointer", paddingBottom: 9, borderBottom: `2px solid ${on ? "var(--ink)" : "transparent"}`, opacity: on ? 1 : 0.5 }}
              >
                <ShapeIcon size={24} w={c.w} h={c.h} radius={c.radius} rotate={c.rot} color="var(--ink)" />
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap" }}>{t(`category.${c.k}`)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {rails.map((r) => (
        <div key={r.key} style={{ padding: "16px 0 2px", animation: "rise .3s ease" }}>
          <div style={{ padding: "0 18px 2px", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.4px" }}>{r.title}</div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-50)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.sub}</div>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)", textDecoration: "underline", flex: "none", cursor: "pointer" }}>{t("feed.viewAll")}</div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              padding: "11px 18px 2px",
              scrollSnapType: "x mandatory",
              // scroll-padding, а не просто padding — иначе snap прижимает
              // карточки вплотную к краю экрана после прокрутки.
              scrollPaddingLeft: 18,
              scrollPaddingRight: 18,
            }}
          >
            {r.items.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </div>
      ))}

      {rails.length === 0 && (
        <div style={{ padding: "80px 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, border: "2px dashed var(--ink-25)" }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{t("feed.emptyTitle")}</div>
          <div style={{ fontSize: 13, color: "var(--ink-50)", fontWeight: 500 }}>{t("feed.emptySub")}</div>
        </div>
      )}
    </div>
  );
}
