import { useAppStore } from "../store/appStore";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const goBack = useAppStore((s) => s.goBack);
  return (
    <div style={{ flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px 10px", borderBottom: "1px solid var(--ink-08)" }}>
      <button
        type="button"
        onClick={goBack}
        style={{ width: 34, height: 34, borderRadius: 17, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "var(--ink)", cursor: "pointer" }}
      >
        ‹
      </button>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", letterSpacing: "-.2px" }}>{title}</div>
      <div style={{ width: 34, height: 34, borderRadius: 17, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "var(--ink-45)" }}>⋯</div>
    </div>
  );
}
