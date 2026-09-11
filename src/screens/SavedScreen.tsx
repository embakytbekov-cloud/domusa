import { ALL_LISTINGS } from "../data/listings";
import { useAppStore } from "../store/appStore";
import { useT } from "../i18n";

export function SavedScreen() {
  const saved = useAppStore((s) => s.saved);
  const openDetail = useAppStore((s) => s.openDetail);
  const savedListings = ALL_LISTINGS.filter((l) => saved.includes(l.id));
  const t = useT();

  return (
    <div style={{ animation: "fadeIn .25s ease", padding: "18px 20px 96px" }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.6px", marginBottom: 16 }}>{t("saved.title")}</div>

      {savedListings.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {savedListings.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => openDetail(l.id)}
              style={{ display: "flex", gap: 13, cursor: "pointer", padding: 10, borderRadius: 18, background: "#fff", border: "1px solid var(--ink-08)", textAlign: "left" }}
            >
              <div style={{ width: 92, height: 92, borderRadius: 14, overflow: "hidden", flex: "none", background: "var(--card-muted)" }}>
                <img src={l.photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>{l.district}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-50)", fontWeight: 500, lineHeight: 1.3 }}>{l.title}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>
                  ${l.price} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-50)" }}>{l.term === "day" ? t("listing.perDay") : t("listing.perMonth")}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, border: "2px dashed var(--ink-25)" }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{t("saved.emptyTitle")}</div>
          <div style={{ fontSize: 13, color: "var(--ink-50)", fontWeight: 500, maxWidth: 220, lineHeight: 1.5 }}>{t("saved.emptySub")}</div>
        </div>
      )}
    </div>
  );
}
