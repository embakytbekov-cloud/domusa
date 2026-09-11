import { create } from "zustand";
import type { CategoryKey, TabKey } from "../data/constants";
import { PRICE_BANDS } from "../data/constants";
import type { Listing, NewListingDraft, TelegramUser } from "../types/listing";
import { getTelegramUser } from "../lib/telegram";
import { listingsRepo } from "../lib/repo";
import { linkTelegramProfile } from "../lib/auth";
import { requestListingPayment } from "../lib/payments";
import { requestNearestCity } from "../lib/geolocation";
import { supabaseEnabled } from "../lib/supabase";
import { t } from "../i18n";

export type Screen = "feed" | "detail";
export type AddView = "list" | "form";

interface GateRequest {
  action: () => void;
  title: string;
  sub: string;
  cta: string;
}

const emptyForm: NewListingDraft = {
  title: "",
  city: "Лос-Анджелес",
  district: "",
  term: "month",
  price: "",
  deposit: true,
  desc: "",
  photos: [],
  amenities: ["wifi"],
};

interface AppState {
  tab: TabKey;
  screen: Screen;
  category: CategoryKey;
  currentId: string | null;
  photoIndex: number;
  saved: string[];
  booked: boolean;
  toast: string;

  filtersOpen: boolean;
  cityFilter: string[];
  bandFilter: number[];

  languageSheetOpen: boolean;

  // геолокация — ближайший к пользователю город (см. src/lib/geolocation.ts)
  nearestCity: string | null;

  user: TelegramUser;
  registered: boolean;
  pending: GateRequest | null;

  form: NewListingDraft;
  publishing: boolean;
  paying: boolean;
  publishSuccessOpen: boolean;

  addView: AddView;
  myListings: Listing[];
  myListingsLoading: boolean;

  // навигация
  setTab: (tab: TabKey) => void;
  openDetail: (id: string) => void;
  goBack: () => void;
  setCategory: (cat: CategoryKey) => void;

  // фильтры
  openFilters: () => void;
  closeFilters: () => void;
  toggleCity: (city: string) => void;
  toggleBand: (index: number) => void;
  resetFilters: () => void;

  // выбор языка интерфейса (Профиль → Язык)
  openLanguageSheet: () => void;
  closeLanguageSheet: () => void;

  // объявления
  toggleSaved: (id: string) => void;
  nextPhoto: (photoCount: number) => void;
  prevPhoto: (photoCount: number) => void;
  book: () => void;

  // мягкая авторизация через Telegram
  gate: (action: () => void, title: string, sub: string, cta: string) => void;
  confirmGate: () => void;
  closeGate: () => void;

  // уведомления
  flash: (message: string) => void;

  // форма размещения объявления / "Мои объявления"
  setFormField: <K extends keyof NewListingDraft>(key: K, value: NewListingDraft[K]) => void;
  toggleFormAmenity: (amenity: string) => void;
  addFormPhoto: (url: string) => void;
  removeFormPhoto: (url: string) => void;
  publish: () => Promise<void>;
  setAddView: (view: AddView) => void;
  fetchMyListings: () => Promise<void>;
  closePublishSuccess: () => void;

  // инициализация
  initUser: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useAppStore = create<AppState>((set, get) => ({
  tab: "search",
  screen: "feed",
  category: "all",
  currentId: null,
  photoIndex: 0,
  saved: [],
  booked: false,
  toast: "",

  filtersOpen: false,
  cityFilter: [],
  bandFilter: [],

  languageSheetOpen: false,

  nearestCity: null,

  user: getTelegramUser(),
  registered: false,
  pending: null,

  form: emptyForm,
  publishing: false,
  paying: false,
  publishSuccessOpen: false,

  addView: "list",
  myListings: [],
  myListingsLoading: false,

  setTab: (tab) => {
    if (tab === "add" && !get().registered) {
      get().gate(
        () => {
          set({ tab: "add", screen: "feed" });
          get().fetchMyListings();
        },
        t("gate.addTabTitle"),
        t("gate.addTabSub"),
        t("gate.continueAs", { name: get().user.first })
      );
      return;
    }
    if (tab === "add") get().fetchMyListings();
    set({ tab, screen: "feed" });
  },

  openDetail: (id) => set({ screen: "detail", currentId: id, photoIndex: 0, booked: false }),
  goBack: () => set({ screen: "feed" }),
  setCategory: (category) => set({ category }),

  openFilters: () => set({ filtersOpen: true }),
  closeFilters: () => set({ filtersOpen: false }),
  toggleCity: (city) =>
    set((s) => ({
      cityFilter: s.cityFilter.includes(city) ? s.cityFilter.filter((c) => c !== city) : [...s.cityFilter, city],
    })),
  toggleBand: (index) =>
    set((s) => ({
      bandFilter: s.bandFilter.includes(index) ? s.bandFilter.filter((i) => i !== index) : [...s.bandFilter, index],
    })),
  resetFilters: () => set({ cityFilter: [], bandFilter: [], category: "all" }),

  openLanguageSheet: () => set({ languageSheetOpen: true }),
  closeLanguageSheet: () => set({ languageSheetOpen: false }),

  toggleSaved: (id) => {
    const doToggle = () =>
      set((s) => ({
        saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id],
      }));
    get().gate(
      doToggle,
      t("gate.saveTitle"),
      t("gate.saveSub"),
      t("gate.continueAs", { name: get().user.first })
    );
  },

  nextPhoto: (photoCount) => set((s) => ({ photoIndex: (s.photoIndex + 1) % Math.max(photoCount, 1) })),
  prevPhoto: (photoCount) =>
    set((s) => ({ photoIndex: (s.photoIndex - 1 + Math.max(photoCount, 1)) % Math.max(photoCount, 1) })),

  book: () => {
    get().gate(
      () => {
        set({ booked: true });
        get().flash(t("toast.bookRequested"));
      },
      t("gate.bookTitle"),
      t("gate.bookSub"),
      t("gate.continueAs", { name: get().user.first })
    );
  },

  gate: (action, title, sub, cta) => {
    if (get().registered) {
      action();
      return;
    }
    set({ pending: { action, title, sub, cta } });
  },
  confirmGate: async () => {
    const pending = get().pending;
    // Настоящая Supabase-сессия (анонимный вход + привязка Telegram-
    // профиля через Edge Function telegram-link) нужна до того, как
    // пользователь попадёт на экраны, которые пишут в Supabase напрямую —
    // загрузка фото и публикация объявления. Без .env (supabaseEnabled
    // = false) функция ничего не делает и приложение остаётся на моках.
    if (supabaseEnabled) {
      await linkTelegramProfile();
    }
    set({ registered: true, pending: null });
    get().flash(t("toast.profileConfirmed"));
    pending?.action();
  },
  closeGate: () => set({ pending: null }),

  flash: (message) => {
    clearTimeout(toastTimer);
    set({ toast: message });
    toastTimer = setTimeout(() => set({ toast: "" }), 2200);
  },

  setFormField: (key, value) => set((s) => ({ form: { ...s.form, [key]: value } })),
  toggleFormAmenity: (amenity) =>
    set((s) => ({
      form: {
        ...s.form,
        amenities: s.form.amenities.includes(amenity)
          ? s.form.amenities.filter((a) => a !== amenity)
          : [...s.form.amenities, amenity],
      },
    })),
  addFormPhoto: (url) => set((s) => ({ form: { ...s.form, photos: [...s.form.photos, url] } })),
  removeFormPhoto: (url) =>
    set((s) => ({ form: { ...s.form, photos: s.form.photos.filter((p) => p !== url) } })),

  setAddView: (addView) => set({ addView }),

  fetchMyListings: async () => {
    set({ myListingsLoading: true });
    try {
      const mine = await listingsRepo.getMyListings();
      set({ myListings: mine, addView: mine.length > 0 ? "list" : "form" });
    } finally {
      set({ myListingsLoading: false });
    }
  },

  closePublishSuccess: () => set({ publishSuccessOpen: false }),

  publish: async () => {
    const { form } = get();
    if (!form.title || !form.price) {
      get().flash(t("toast.fillRequired"));
      return;
    }
    get().gate(
      async () => {
        set({ publishing: true });
        try {
          const mineBefore = get().myListings.length || (await listingsRepo.getMyListings()).length;

          if (mineBefore === 0) {
            // Первое объявление — бесплатно, публикуем сразу.
            const created = await listingsRepo.publish(form);
            set((s) => ({ myListings: [created, ...s.myListings] }));
            get().flash(t("toast.published"));
            set({ form: emptyForm, addView: "list", publishSuccessOpen: true });
            return;
          }

          // Второе и последующие — через Telegram Payments (Apple Pay /
          // Google Pay включаются автоматически на стороне Telegram, если
          // бот подключён к Stripe — см. src/lib/payments.ts).
          set({ paying: true });
          const outcome = await requestListingPayment(form);
          set({ paying: false });

          if (outcome === "paid") {
            get().flash(t("payment.processing"));
            const created = await listingsRepo.waitForNewListing(mineBefore);
            if (created) {
              set((s) => ({ myListings: [created, ...s.myListings] }));
            } else {
              await get().fetchMyListings();
            }
            set({ form: emptyForm, addView: "list", publishSuccessOpen: true });
          } else if (outcome === "cancelled") {
            get().flash(t("payment.cancelled"));
          } else if (outcome === "unavailable") {
            get().flash(t("payment.unavailable"));
          } else {
            get().flash(t("payment.failed"));
          }
        } catch (err) {
          // Реальный бэкенд может упасть (нет сети, истекла сессия Supabase,
          // отклонена RLS-политика и т.д.) — раньше такая ошибка тихо
          // улетала в необработанный promise rejection и пользователь не
          // понимал, почему публикация просто не произошла.
          console.error("publish failed", err);
          get().flash(t("toast.publishError"));
        } finally {
          set({ publishing: false, paying: false });
        }
      },
      t("gate.addPublishTitle"),
      t("gate.addPublishSub"),
      t("gate.continueAs", { name: get().user.first })
    );
  },

  initUser: () => {
    set({ user: getTelegramUser() });
    requestNearestCity().then((city) => {
      if (city) set({ nearestCity: city });
    });
  },
}));

export { PRICE_BANDS };
