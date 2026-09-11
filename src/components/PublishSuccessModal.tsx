import { useAppStore } from "../store/appStore";
import { useT } from "../i18n";

// Модалка "Объявление опубликовано!" — показывается после успешной
// публикации (бесплатной или через оплату) и по кнопке возвращает
// пользователя к списку "Мои объявления" (см. store.addView в AddScreen.tsx).
export function PublishSuccessModal() {
  const open = useAppStore((s) => s.publishSuccessOpen);
  const close = useAppStore((s) => s.closePublishSuccess);
  const t = useT();

  if (!open) return null;

  return (
    <>
      <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(20,16,13,.45)", animation: "fadeIn .18s ease", zIndex: 49 }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          background: "var(--surface)",
          borderRadius: "26px 26px 0 0",
          padding: "28px 22px 32px",
          animation: "sheetUp .26s cubic-bezier(.22,1,.36,1)",
          zIndex: 50,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            background: "var(--accent-soft-bg)",
            border: "1px solid var(--accent-soft-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 26,
            color: "var(--accent)",
            fontWeight: 800,
          }}
        >
          ✓
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.3px", marginBottom: 8 }}>{t("publishSuccess.title")}</div>
        <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.55, color: "var(--ink-70)", marginBottom: 20 }}>{t("publishSuccess.sub")}</div>
        <button type="button" className="pill-btn" onClick={close} style={{ width: "100%" }}>
          {t("publishSuccess.cta")}
        </button>
      </div>
    </>
  );
}
