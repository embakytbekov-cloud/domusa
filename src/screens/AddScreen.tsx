import type { ReactNode } from "react";
import { AMENITIES, CITIES } from "../data/constants";
import { useAppStore } from "../store/appStore";
import { Chip } from "../components/Chip";
import { useT } from "../i18n";

export function AddScreen() {
  const form = useAppStore((s) => s.form);
  const setFormField = useAppStore((s) => s.setFormField);
  const toggleFormAmenity = useAppStore((s) => s.toggleFormAmenity);
  const setFormPhotoSlot = useAppStore((s) => s.setFormPhotoSlot);
  const t = useT();

  const priceLabel = form.term === "day" ? t("add.priceDay") : t("add.priceMonth");

  return (
      <div style={{ animation: "fadeIn .25s ease", padding: "18px 20px 130px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.6px" }}>{t("add.title")}</div>
          <div style={{ fontSize: 13, color: "var(--ink-50)", fontWeight: 500, marginTop: 4 }}>{t("add.subtitle")}</div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: 14, borderRadius: 16, background: "var(--accent-soft-bg)", border: "1px solid var(--accent-soft-border)" }}>
          <div style={{ width: 20, height: 20, borderRadius: 10, background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            i
          </div>
          <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "#245346", fontWeight: 600 }}>{t("add.freeNotice")}</div>
        </div>

        <Field label={t("add.fieldTitle")}>
          <input className="text-input" value={form.title} onChange={(e) => setFormField("title", e.target.value)} placeholder={t("add.titlePlaceholder")} />
        </Field>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
            <div className="field-label">{t("add.fieldCity")}</div>
            <select className="text-input" value={form.city} onChange={(e) => setFormField("city", e.target.value)}>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
            <div className="field-label">{t("add.fieldDistrict")}</div>
            <input className="text-input" value={form.district} onChange={(e) => setFormField("district", e.target.value)} placeholder={t("add.districtPlaceholder")} />
          </div>
        </div>

        <Field label={t("add.fieldTermType")}>
          <SegmentedControl
            options={[
              { value: "day" as const, label: t("add.termDay") },
              { value: "month" as const, label: t("add.termMonth") },
            ]}
            value={form.term}
            onChange={(v) => setFormField("term", v)}
          />
        </Field>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
            <div className="field-label">{priceLabel}</div>
            <div style={{ height: 50, borderRadius: 14, border: "1px solid var(--ink-14)", background: "#fff", display: "flex", alignItems: "center", padding: "0 15px", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink-45)" }}>$</span>
              <input
                value={form.price}
                onChange={(e) => setFormField("price", e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="900"
                style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: "var(--ink)" }}
              />
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
            <div className="field-label">{t("add.fieldDeposit")}</div>
            <SegmentedControl
              options={[
                { value: true, label: t("add.depositYes") },
                { value: false, label: t("add.depositNo") },
              ]}
              value={form.deposit}
              onChange={(v) => setFormField("deposit", v)}
            />
          </div>
        </div>

        <Field label={t("add.fieldDesc")}>
          <textarea
            className="text-input"
            value={form.desc}
            onChange={(e) => setFormField("desc", e.target.value)}
            rows={4}
            placeholder={t("add.descPlaceholder")}
            style={{ height: "auto", padding: "13px 15px", lineHeight: 1.5, resize: "none" }}
          />
        </Field>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <div className="field-label">{t("add.fieldPhotos")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
            {[0, 1, 2].map((i) => {
              const filled = form.photos > i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormPhotoSlot(i)}
                  style={{
                    aspectRatio: "1/1",
                    borderRadius: 14,
                    border: `1.5px dashed ${filled ? "transparent" : "var(--ink-22, rgba(28,24,21,.22))"}`,
                    background: filled ? "linear-gradient(135deg,#ded7ca,#eae5db)" : "var(--ink-03)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, color: filled ? "var(--ink-55)" : "var(--ink-45)", textAlign: "center", padding: 6, lineHeight: 1.4 }}>
                    {filled ? t("add.photoN", { n: i + 1 }) : i === 0 ? t("add.cover") : t("add.addPhoto")}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-45)", fontWeight: 500 }}>{t("add.photosHint")}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <div className="field-label">{t("add.fieldAmenities")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {AMENITIES.map((a) => (
              <Chip key={a} label={t(`amenity.${a}`)} active={form.amenities.includes(a)} onClick={() => toggleFormAmenity(a)} />
            ))}
          </div>
        </div>
      </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <div className="field-label">{label}</div>
      {children}
    </div>
  );
}

function SegmentedControl<T extends string | boolean>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ height: 50, display: "flex", background: "var(--ink-06)", borderRadius: 14, padding: 4, gap: 3 }}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 11,
              fontSize: 13,
              fontWeight: 700,
              background: on ? "var(--surface)" : "transparent",
              color: on ? "var(--ink)" : "var(--ink-50)",
              boxShadow: on ? "0 1px 4px rgba(40,30,24,.14)" : "none",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
