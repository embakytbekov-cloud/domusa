import { LANGUAGES, useI18nStore, useT } from "../i18n";
import { useAppStore } from "../store/appStore";

// Нижний лист выбора языка интерфейса — открывается по клику на строку
// «Язык» в Профиле (см. store.openLanguageSheet() в ProfileScreen.tsx).
// Рендерится на уровне App.tsx рядом с FiltersSheet/GateSheet, чтобы
// position:absolute считался от полноэкранного контейнера приложения,
// а не от прокручиваемого содержимого экрана Профиля.
//
// Список языков берётся из src/i18n/languages.ts, выбор мгновенно
// применяется через useI18nStore (без перезагрузки страницы) и
// сохраняется в localStorage благодаря persist-миддлвару стора, поэтому
// язык остаётся выбранным и при повторном открытии Telegram Mini App.
export function LanguageSheet() {
  const open = useAppStore((s) => s.languageSheetOpen);
  const onClose = useAppStore((s) => s.closeLanguageSheet);
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);
  const t = useT();

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,16,13,.4)", animation: "fadeIn .2s ease", zIndex: 47 }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: "80%",
          overflowY: "auto",
          background: "var(--surface)",
          borderRadius: "24px 24px 0 0",
          padding: "10px 20px 28px",
          animation: "sheetUp .28s cubic-bezier(.22,1,.36,1)",
          zIndex: 48,
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 2, background: "var(--ink-14)", margin: "0 auto 16px" }} />
        <div style={{ fontSize: 19, fontWeight: 800, color: "var(--ink)", marginBottom: 8, letterSpacing: "-.4px" }}>{t("languagePicker.title")}</div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {LANGUAGES.map((lang) => {
            const active = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "15px 4px",
                  borderBottom: "1px solid var(--ink-06)",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 14.5, fontWeight: active ? 800 : 600, color: active ? "var(--accent)" : "var(--ink)" }}>{lang.nativeName}</span>
                {active && <span style={{ fontSize: 15, fontWeight: 800, color: "var(--accent)" }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
