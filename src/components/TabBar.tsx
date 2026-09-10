import { TABS } from "../data/constants";
import { useAppStore } from "../store/appStore";
import { ShapeIcon } from "./ShapeIcon";

const TAB_SHAPES: Record<string, { w: string; h: string; radius: string; rot: string }> = {
  search: { w: "15px", h: "15px", radius: "8px", rot: "0deg" },
  saved: { w: "14px", h: "14px", radius: "3px", rot: "45deg" },
  add: { w: "16px", h: "12px", radius: "3px", rot: "0deg" },
  profile: { w: "14px", h: "14px", radius: "7px", rot: "0deg" },
};

export function TabBar() {
  const tab = useAppStore((s) => s.tab);
  const setTab = useAppStore((s) => s.setTab);
  const accent = "var(--accent)";

  return (
    <div style={{ flex: "none", height: 76, borderTop: "1px solid var(--ink-08)", background: "var(--surface)", display: "flex", alignItems: "flex-start", padding: "11px 8px 0" }}>
      {TABS.map((t) => {
        const on = tab === t.k;
        const shape = TAB_SHAPES[t.k];
        const color = on ? "var(--ink)" : "var(--ink-35)";
        return (
          <button
            key={t.k}
            type="button"
            onClick={() => setTab(t.k)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", paddingTop: 3, background: "none" }}
          >
            <ShapeIcon w={shape.w} h={shape.h} radius={shape.radius} rotate={shape.rot} color={color} fill={on ? accent : "transparent"} />
            <div style={{ fontSize: 10.5, fontWeight: 700, color }}>{t.label}</div>
          </button>
        );
      })}
    </div>
  );
}
