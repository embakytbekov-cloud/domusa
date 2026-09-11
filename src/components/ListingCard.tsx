import type { Listing } from "../types/listing";
import { useAppStore } from "../store/appStore";
import { useT } from "../i18n";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const openDetail = useAppStore((s) => s.openDetail);
  const saved = useAppStore((s) => s.saved.includes(listing.id));
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  const t = useT();

  const unit = listing.term === "day" ? t("listing.perDay") : t("listing.perMonth");
  const badge = listing.term === "day" ? t("listing.badgeDay") : t("listing.badgeMonth");

  return (
    <div
      onClick={() => openDetail(listing.id)}
      style={{ flex: "none", width: 168, display: "flex", flexDirection: "column", gap: 7, cursor: "pointer", scrollSnapAlign: "start" }}
    >
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "var(--card-muted)", height: 138 }}>
        <img src={listing.photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSaved(listing.id);
          }}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 30,
            height: 30,
            borderRadius: 15,
            background: "rgba(253,252,250,.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 800,
            color: saved ? "var(--accent)" : "var(--ink)",
            backdropFilter: "blur(6px)",
          }}
        >
          {saved ? "♥" : "♡"}
        </button>
        <div
          style={{
            position: "absolute",
            left: 10,
            top: 10,
            padding: "5px 9px",
            borderRadius: 11,
            background: "rgba(253,252,250,.94)",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: ".3px",
            textTransform: "uppercase",
            color: "var(--ink)",
          }}
        >
          {badge}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {listing.district}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-70)", flex: "none" }}>★ {listing.rating}</div>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--ink-50)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {listing.title}
        </div>
        <div style={{ display: "flex", gap: 5, marginTop: 3, overflow: "hidden" }}>
          {listing.tags.map((t) => (
            <div key={t} style={{ padding: "3px 7px", borderRadius: 9, background: "var(--ink-05)", fontSize: 10, fontWeight: 700, color: "var(--ink-70)", whiteSpace: "nowrap" }}>
              {t}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 5, fontSize: 14, fontWeight: 800, color: "var(--ink)", whiteSpace: "nowrap" }}>
          ${listing.price} <span style={{ fontSize: 11.5, fontWeight: 500, color: "var(--ink-50)" }}>{unit}</span>
        </div>
      </div>
    </div>
  );
}
