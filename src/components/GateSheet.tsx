import { useAppStore } from "../store/appStore";
import { useT } from "../i18n";

export function GateSheet() {
  const pending = useAppStore((s) => s.pending);
  const closeGate = useAppStore((s) => s.closeGate);
  const confirmGate = useAppStore((s) => s.confirmGate);
  const user = useAppStore((s) => s.user);
  const t = useT();

  if (!pending) return null;

  return (
    <>
      <div onClick={closeGate} style={{ position: "absolute", inset: 0, background: "rgba(20,16,13,.45)", animation: "fadeIn .18s ease", zIndex: 45 }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          background: "var(--surface)",
          borderRadius: "26px 26px 0 0",
          padding: "10px 22px 28px",
          animation: "sheetUp .26s cubic-bezier(.22,1,.36,1)",
          zIndex: 46,
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 2, background: "var(--ink-14)", margin: "0 auto 18px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              background: "var(--avatar-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              fontWeight: 800,
              color: "var(--avatar-fg)",
              overflow: "hidden",
              flex: "none",
            }}
          >
            {user.photo ? (
              <img src={user.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <span>{initials(user.name)}</span>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.3px" }}>{pending.title}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-45)", marginTop: 2 }}>{user.name} · Telegram</div>
          </div>
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.55, color: "var(--ink-70)", marginBottom: 18 }}>{pending.sub}</div>
        <button type="button" className="pill-btn" onClick={confirmGate} style={{ width: "100%" }}>
          {pending.cta}
        </button>
        <button
          type="button"
          onClick={closeGate}
          style={{ marginTop: 10, height: 46, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13.5, fontWeight: 700, color: "var(--ink-50)" }}
        >
          {t("gate.dismiss")}
        </button>
      </div>
    </>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}
