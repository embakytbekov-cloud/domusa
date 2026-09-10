import { useAppStore } from "../store/appStore";
import { useCurrentListing } from "../lib/useCurrentListing";

export function DetailBookingBar() {
  const booked = useAppStore((s) => s.booked);
  const book = useAppStore((s) => s.book);
  const listing = useCurrentListing();

  if (!listing) return null;

  const unit = listing.term === "day" ? "/ сутки" : "/ месяц";
  const availability = listing.term === "day" ? "Свободно на этой неделе" : "Свободна с 1 октября";

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "14px 20px 26px",
        background: "rgba(253,252,250,.96)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid var(--ink-09)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        zIndex: 10,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)" }}>
          ${listing.price} <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-50)" }}>{unit}</span>
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-50)" }}>{availability}</div>
      </div>
      <button type="button" onClick={book} className="pill-btn" style={{ flex: "none", padding: "0 26px" }}>
        {booked ? "Заявка отправлена" : "Забронировать"}
      </button>
    </div>
  );
}
