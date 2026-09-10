import { useAppStore } from "../store/appStore";

export function ProfileScreen() {
  const user = useAppStore((s) => s.user);
  const registered = useAppStore((s) => s.registered);
  const gate = useAppStore((s) => s.gate);

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  const handle = (user.username ? `@${user.username} · ` : "") + (registered ? "профиль арендодателя подтверждён" : "вход через Telegram");

  const rows = [
    { label: "Мои бронирования", value: "2" },
    { label: "Мои объявления", value: registered ? "1" : "—" },
    { label: "Способы оплаты", value: "Не добавлены" },
    { label: "Уведомления", value: "Вкл." },
    { label: "Язык", value: "Русский" },
  ];

  const verifyNow = () => gate(() => {}, "Стать арендодателем", "Подтверждаем профиль через Telegram — заполнять анкету не нужно.", "Продолжить как " + user.first);

  return (
    <div style={{ animation: "fadeIn .25s ease", padding: "18px 20px 100px" }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.6px", marginBottom: 18 }}>Профиль</div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 20, background: "#fff", border: "1px solid var(--ink-08)" }}>
        <div style={{ width: 56, height: 56, borderRadius: 28, background: "var(--avatar-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "var(--avatar-fg)", overflow: "hidden", flex: "none" }}>
          {user.photo ? <img src={user.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <span>{initials}</span>}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>{user.name}</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-50)" }}>{handle}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 18, borderRadius: 18, overflow: "hidden", border: "1px solid var(--ink-08)", background: "#fff" }}>
        {rows.map((p) => (
          <div key={p.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 16px", borderBottom: "1px solid var(--ink-06)" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{p.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-45)" }}>{p.value}</div>
              <div style={{ fontSize: 14, color: "var(--ink-25)" }}>›</div>
            </div>
          </div>
        ))}
      </div>

      {!registered && (
        <button
          type="button"
          onClick={verifyNow}
          style={{ marginTop: 16, padding: "14px 16px", borderRadius: 16, background: "var(--accent-soft-bg)", border: "1px solid var(--accent-soft-border)", fontSize: 12.5, fontWeight: 600, color: "#245346", lineHeight: 1.5, textAlign: "left", width: "100%" }}
        >
          Станьте арендодателем в один клик — профиль подтверждается через Telegram, анкету заполнять не нужно.
        </button>
      )}
    </div>
  );
}
