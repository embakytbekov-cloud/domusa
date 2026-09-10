import { useAppStore } from "../store/appStore";

export function AddPublishBar() {
  const publish = useAppStore((s) => s.publish);
  const publishing = useAppStore((s) => s.publishing);

  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 76, padding: "12px 20px 14px", background: "rgba(253,252,250,.96)", backdropFilter: "blur(12px)", borderTop: "1px solid var(--ink-09)", zIndex: 10 }}>
      <button
        type="button"
        onClick={publish}
        disabled={publishing}
        style={{
          height: 52,
          width: "100%",
          borderRadius: 16,
          background: "var(--ink)",
          color: "#fff",
          fontSize: 14.5,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: publishing ? 0.6 : 1,
        }}
      >
        {publishing ? "Публикуем…" : "Опубликовать бесплатно"}
      </button>
    </div>
  );
}
