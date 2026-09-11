import { useAppStore } from "../store/appStore";
import { useI18nStore, useT, LANGUAGES } from "../i18n";

export function ProfileScreen() {
  const user = useAppStore((s) => s.user);
  const registered = useAppStore((s) => s.registered);
  const gate = useAppStore((s) => s.gate);
  const openLanguageSheet = useAppStore((s) => s.openLanguageSheet);
  const language = useI18nStore((s) => s.language);
  const t = useT();

  const currentLanguageName = LANGUAGES.find((l) => l.code === language)?.nativeName ?? language;

  // Вне Telegram (initDataUnsafe.user недоступен) реальных данных нет —
  // раньше здесь всегда стоял фиктивный "Алексей Ковалёв"; теперь честно
  // показываем нейтральную заглушку-гостя и просим открыть в Telegram.
  const displayName = user?.name || t("profile.guestName");
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  const handle = user
    ? (user.username ? `@${user.username} · ` : "") + (registered ? t("profile.handleRegistered") : t("profile.handleGuest"))
    : t("profile.openInTelegram");

  const rows = [
    { id: "bookings", label: t("profile.bookings"), value: "2" },
    { id: "listings", label: t("profile.listings"), value: registered ? "1" : "—" },
    { id: "payment", label: t("profile.payment"), value: t("profile.paymentNotAdded") },
    { id: "notifications", label: t("profile.notifications"), value: t("profile.notificationsOn") },
    { id: "language", label: t("profile.language"), value: currentLanguageName },
  ];

  const verifyNow = () =>
    gate(() => {}, t("profile.becomeHostCta"), t("profile.becomeHostSub"), t("gate.continueAs", { name: user?.first ?? "" }));

  return (
    <div style={{ animation: "fadeIn .25s ease", padding: "18px 20px 100px" }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.6px", marginBottom: 18 }}>{t("profile.title")}</div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 20, background: "#fff", border: "1px solid var(--ink-08)" }}>
        <div style={{ width: 56, height: 56, borderRadius: 28, background: "var(--avatar-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "var(--avatar-fg)", overflow: "hidden", flex: "none" }}>
          {user?.photo ? <img src={user.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <span>{initials}</span>}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>{displayName}</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-50)" }}>{handle}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 18, borderRadius: 18, overflow: "hidden", border: "1px solid var(--ink-08)", background: "#fff" }}>
        {rows.map((p) => {
          const clickable = p.id === "language";
          return (
            <div
              key={p.id}
              onClick={clickable ? openLanguageSheet : undefined}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "15px 16px",
                borderBottom: "1px solid var(--ink-06)",
                cursor: clickable ? "pointer" : "default",
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{p.label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-45)" }}>{p.value}</div>
                <div style={{ fontSize: 14, color: "var(--ink-25)" }}>›</div>
              </div>
            </div>
          );
        })}
      </div>

      {!registered && (
        <button
          type="button"
          onClick={verifyNow}
          style={{ marginTop: 16, padding: "14px 16px", borderRadius: 16, background: "var(--accent-soft-bg)", border: "1px solid var(--accent-soft-border)", fontSize: 12.5, fontWeight: 600, color: "#245346", lineHeight: 1.5, textAlign: "left", width: "100%" }}
        >
          {t("profile.becomeHostBanner")}
        </button>
      )}
    </div>
  );
}
