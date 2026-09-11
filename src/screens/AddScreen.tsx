import { useRef, useState, type ReactNode } from "react";
import { AMENITIES, CITIES } from "../data/constants";
import { useAppStore } from "../store/appStore";
import { Chip } from "../components/Chip";
import { useT } from "../i18n";
import { uploadListingPhoto } from "../lib/photos";

export function AddScreen() {
  const addView = useAppStore((s) => s.addView);
  const setAddView = useAppStore((s) => s.setAddView);
  const myListings = useAppStore((s) => s.myListings);
  const myListingsLoading = useAppStore((s) => s.myListingsLoading);
  const t = useT();

  if (addView === "list") {
    return (
      <div style={{ animation: "fadeIn .25s ease", padding: "18px 20px 100px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.6px" }}>{t("add.title")}</div>
        </div>

        {myListingsLoading ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "var(--ink-50)", fontSize: 13 }}>{t("detail.loading")}</div>
        ) : myListings.length === 0 ? (
          <div style={{ marginTop: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, border: "2px dashed var(--ink-25)" }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{t("add.emptyListingsTitle")}</div>
            <div style={{ fontSize: 13, color: "var(--ink-50)", fontWeight: 500, maxWidth: 240, lineHeight: 1.5 }}>{t("add.emptyListingsSub")}</div>
            <button type="button" onClick={() => setAddView("form")} className="pill-btn" style={{ marginTop: 10, padding: "0 22px" }}>
              {t("add.newListing")}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
            <button
              type="button"
              onClick={() => setAddView("form")}
              style={{ height: 48, borderRadius: 14, border: "1.5px dashed var(--ink-22, rgba(28,24,21,.22))", fontSize: 13, fontWeight: 700, color: "var(--ink-70)" }}
            >
              {t("add.newListing")}
            </button>
            {myListings.map((l) => (
              <div key={l.id} style={{ display: "flex", gap: 13, padding: 10, borderRadius: 18, background: "#fff", border: "1px solid var(--ink-08)" }}>
                <div style={{ width: 84, height: 84, borderRadius: 14, overflow: "hidden", flex: "none", background: "var(--card-muted)" }}>
                  {l.photos[0] && <img src={l.photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>{l.district}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-50)", fontWeight: 500, lineHeight: 1.3 }}>{l.title}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>
                    ${l.price} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-50)" }}>{l.term === "day" ? t("listing.perDay") : t("listing.perMonth")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <AddForm />;
}

function AddForm() {
  const form = useAppStore((s) => s.form);
  const setFormField = useAppStore((s) => s.setFormField);
  const toggleFormAmenity = useAppStore((s) => s.toggleFormAmenity);
  const addFormPhoto = useAppStore((s) => s.addFormPhoto);
  const removeFormPhoto = useAppStore((s) => s.removeFormPhoto);
  const myListings = useAppStore((s) => s.myListings);
  const setAddView = useAppStore((s) => s.setAddView);
  const t = useT();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const priceLabel = form.term === "day" ? t("add.priceDay") : t("add.priceMonth");

  const onPickPhoto = () => fileInputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded = await uploadListingPhoto(file);
      addFormPhoto(uploaded.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ animation: "fadeIn .25s ease", padding: "18px 20px 130px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        {myListings.length > 0 && (
          <button
            type="button"
            onClick={() => setAddView("list")}
            style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-50)", marginBottom: 8 }}
          >
            ‹ {t("add.backToList")}
          </button>
        )}
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
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
          {form.photos.map((url, i) => (
            <div key={url} style={{ position: "relative", aspectRatio: "1/1", borderRadius: 14, overflow: "hidden", background: "var(--card-muted)" }}>
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              {i === 0 && (
                <div style={{ position: "absolute", left: 6, top: 6, padding: "3px 7px", borderRadius: 8, background: "rgba(253,252,250,.92)", fontSize: 9, fontWeight: 800, color: "var(--ink)" }}>
                  {t("add.cover")}
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFormPhoto(url)}
                style={{ position: "absolute", right: 6, top: 6, width: 22, height: 22, borderRadius: 11, background: "rgba(28,24,21,.65)", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onPickPhoto}
            disabled={uploading}
            style={{
              aspectRatio: "1/1",
              borderRadius: 14,
              border: "1.5px dashed var(--ink-22, rgba(28,24,21,.22))",
              background: "var(--ink-03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              opacity: uploading ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-45)", textAlign: "center", padding: 6, lineHeight: 1.4 }}>
              {uploading ? t("detail.loading") : form.photos.length === 0 ? t("add.cover") : t("add.addPhoto")}
            </span>
          </button>
        </div>
        {uploadError && <div style={{ fontSize: 11.5, color: "var(--accent-bad)", fontWeight: 600 }}>{uploadError}</div>}
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
