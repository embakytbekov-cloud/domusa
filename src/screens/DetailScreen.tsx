import { useAppStore } from "../store/appStore";
import { useCurrentListing } from "../lib/useCurrentListing";

export function DetailScreen() {
  const photoIndex = useAppStore((s) => s.photoIndex);
  const nextPhoto = useAppStore((s) => s.nextPhoto);
  const prevPhoto = useAppStore((s) => s.prevPhoto);
  const listing = useCurrentListing();

  if (!listing) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--ink-50)", fontSize: 13 }}>Загрузка…</div>;
  }

  const n = listing.photos.length;
  const photo = listing.photos[photoIndex % n];
  const hostInitials = listing.host.slice(0, 1) + listing.district.slice(0, 1);

  return (
    <div style={{ animation: "slideIn .28s ease", paddingBottom: 110 }}>
      <div style={{ position: "relative", aspectRatio: "1/1", background: "var(--card-muted)" }}>
        <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => prevPhoto(n)}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 34, height: 34, borderRadius: 17, background: "rgba(253,252,250,.92)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "var(--ink)" }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => nextPhoto(n)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 34, height: 34, borderRadius: 17, background: "rgba(253,252,250,.92)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "var(--ink)" }}
            >
              ›
            </button>
          </>
        )}
        <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
          {listing.photos.map((_, i) => (
            <div key={i} style={{ width: i === photoIndex ? 18 : 6, height: 6, borderRadius: 3, background: i === photoIndex ? "var(--surface)" : "rgba(253,252,250,.5)", transition: "width .2s ease" }} />
          ))}
        </div>
        <div style={{ position: "absolute", bottom: 12, right: 14, padding: "5px 10px", borderRadius: 12, background: "rgba(28,24,21,.6)", color: "#fff", fontSize: 11, fontWeight: 700 }}>
          {(photoIndex % n) + 1} / {n}
        </div>
      </div>

      <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 21, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.5px", lineHeight: 1.2 }}>{listing.title}</div>
        <div style={{ fontSize: 13.5, color: "var(--ink-55)", fontWeight: 500 }}>
          {listing.district}, {listing.city} · {listing.type}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginTop: 2 }}>
          ★ {listing.rating} <span style={{ color: "var(--ink-45)", fontWeight: 500 }}>· {listing.reviews} отзыва</span>
        </div>
      </div>

      <div style={{ margin: "18px 20px", height: 1, background: "var(--ink-09)" }} />

      <div style={{ padding: "0 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 23, background: "var(--avatar-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "var(--avatar-fg)" }}>
          {hostInitials}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Хозяин — {listing.host}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-50)", fontWeight: 500 }}>Сдаёт с {listing.hostSince} · отвечает за ~1 час</div>
        </div>
      </div>

      <div style={{ margin: "18px 20px", height: 1, background: "var(--ink-09)" }} />

      <div style={{ padding: "0 20px", fontSize: 14, lineHeight: 1.6, color: "var(--ink-75)" }}>{listing.description}</div>

      {listing.amenities.length > 0 && (
        <div style={{ padding: "22px 20px 0" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginBottom: 12 }}>Что есть в комнате</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 10px" }}>
            {listing.amenities.map((a) => (
              <div key={a} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: "var(--accent)", flex: "none" }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-75)" }}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {listing.rules.length > 0 && (
        <div style={{ padding: "22px 20px 0" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginBottom: 12 }}>Правила дома</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {listing.rules.map((r) => (
              <div key={r.text} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 14, background: "var(--ink-04)" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: r.ok ? "var(--accent-ok)" : "var(--accent-bad)", width: 14, flex: "none" }}>{r.ok ? "✓" : "✕"}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-75)" }}>{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: "22px 20px 0" }}>
        <div
          style={{
            height: 150,
            borderRadius: 18,
            border: "1px solid var(--ink-10)",
            position: "relative",
            overflow: "hidden",
            background:
              "repeating-linear-gradient(0deg,#e8e4dc 0 1px,transparent 1px 40px), repeating-linear-gradient(90deg,#e8e4dc 0 1px,transparent 1px 40px), linear-gradient(160deg,#f6f3ee,#eae5db)",
          }}
        >
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 60, height: 60, borderRadius: 30, background: "rgba(47,111,94,.14)" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 16, height: 16, borderRadius: 8, background: "var(--accent)", border: "3px solid var(--surface)" }} />
          <div style={{ position: "absolute", left: 14, bottom: 12, fontSize: 11.5, fontWeight: 700, color: "var(--ink-55)" }}>Точный адрес — после брони</div>
        </div>
      </div>
    </div>
  );
}
