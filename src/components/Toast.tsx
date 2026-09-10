import { useAppStore } from "../store/appStore";

export function Toast() {
  const toast = useAppStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 20,
        right: 20,
        bottom: 100,
        padding: "14px 18px",
        borderRadius: 16,
        background: "var(--ink)",
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        animation: "fadeIn .2s ease",
        boxShadow: "0 12px 30px -10px rgba(0,0,0,.5)",
        zIndex: 40,
      }}
    >
      {toast}
    </div>
  );
}
