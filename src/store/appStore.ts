import { create } from "zustand";
import type { CategoryKey, TabKey } from "../data/constants";
import { PRICE_BANDS } from "../data/constants";
import type { NewListingDraft, TelegramUser } from "../types/listing";
import { getTelegramUser } from "../lib/telegram";
import { listingsRepo } from "../lib/repo";

export type Screen = "feed" | "detail";

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
  term: "Долгосрочно",
  price: "",
  deposit: "Есть",
  desc: "",
  photos: 0,
  amenities: ["Wi-Fi"],
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

  user: TelegramUser;
  registered: boolean;
  pending: GateRequest | null;

  form: NewListingDraft;
  publishing: boolean;

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

  // форма размещения объявления
  setFormField: <K extends keyof NewListingDraft>(key: K, value: NewListingDraft[K]) => void;
  toggleFormAmenity: (amenity: string) => void;
  setFormPhotoSlot: (index: number) => void;
  publish: () => Promise<void>;

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

  user: getTelegramUser(),
  registered: false,
  pending: null,

  form: emptyForm,
  publishing: false,

  setTab: (tab) => {
    if (tab === "add" && !get().registered) {
      get().gate(
        () => set({ tab: "add", screen: "feed" }),
        "Представьтесь, пожалуйста",
        "Чтобы опубликовать жильё за $3, подтвердим ваш профиль Telegram. Анкету заполнять не нужно.",
        "Продолжить как " + get().user.first
      );
      return;
    }
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

  toggleSaved: (id) => {
    const doToggle = () =>
      set((s) => ({
        saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id],
      }));
    get().gate(
      doToggle,
      "Сохранить в избранное",
      "Подключим ваш профиль Telegram — список сохранится на всех устройствах.",
      "Продолжить как " + get().user.first
    );
  },

  nextPhoto: (photoCount) => set((s) => ({ photoIndex: (s.photoIndex + 1) % Math.max(photoCount, 1) })),
  prevPhoto: (photoCount) =>
    set((s) => ({ photoIndex: (s.photoIndex - 1 + Math.max(photoCount, 1)) % Math.max(photoCount, 1) })),

  book: () => {
    get().gate(
      () => {
        set({ booked: true });
        get().flash("Запрос отправлен хозяину — ответ обычно в течение часа");
      },
      "Написать хозяину",
      "Хозяин увидит ваше имя из Telegram — так заявкам доверяют больше.",
      "Продолжить как " + get().user.first
    );
  },

  gate: (action, title, sub, cta) => {
    if (get().registered) {
      action();
      return;
    }
    set({ pending: { action, title, sub, cta } });
  },
  confirmGate: () => {
    const pending = get().pending;
    set({ registered: true, pending: null });
    get().flash("Профиль подтверждён через Telegram");
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
  setFormPhotoSlot: (index) =>
    set((s) => ({ form: { ...s.form, photos: s.form.photos > index ? index : index + 1 } })),

  publish: async () => {
    const { form } = get();
    if (!form.title || !form.price) {
      get().flash("Заполните заголовок и цену");
      return;
    }
    get().gate(
      async () => {
        set({ publishing: true });
        try {
          await listingsRepo.publish(form);
          get().flash("Объявление опубликовано — оно уже в ленте");
          set({ tab: "search", form: emptyForm });
        } finally {
          set({ publishing: false });
        }
      },
      "Представьтесь, пожалуйста",
      "Чтобы опубликовать жильё, подтвердим профиль. Первое объявление бесплатно, каждое следующее — $3.",
      "Продолжить как " + get().user.first
    );
  },

  initUser: () => set({ user: getTelegramUser() }),
}));

export { PRICE_BANDS };
