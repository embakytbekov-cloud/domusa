// Форма словаря переводов. Каждый языковой файл в src/i18n/translations/
// должен реализовывать этот интерфейс (через `satisfies Dict`), поэтому
// если в новом языке забыт ключ — TypeScript покажет ошибку сборки.

export interface Dict {
  nav: {
    search: string;
    saved: string;
    add: string;
    profile: string;
  };
  category: {
    all: string;
    room: string;
    day: string;
    month: string;
    nodep: string;
  };
  feed: {
    tagline: string;
    searchPlaceholder: string;
    resultsCount: string; // {count}
    viewAll: string;
    emptyTitle: string;
    emptySub: string;
  };
  filters: {
    title: string;
    city: string;
    price: string;
    reset: string;
    show: string; // {count}
  };
  priceBand: {
    under900: string;
    from900to1200: string;
    over1200: string;
    dayUnder100: string;
  };
  listing: {
    perDay: string;
    perMonth: string;
    badgeDay: string;
    badgeMonth: string;
  };
  detail: {
    headerTitle: string;
    loading: string;
    hostPrefix: string; // {host}
    hostSince: string; // {year}
    reviewsSuffix: string; // {count}
    amenitiesTitle: string;
    rulesTitle: string;
    exactAddress: string;
  };
  booking: {
    availableWeek: string;
    availableFrom: string;
    book: string;
    requested: string;
  };
  saved: {
    title: string;
    emptyTitle: string;
    emptySub: string;
  };
  add: {
    title: string;
    subtitle: string;
    freeNotice: string;
    fieldTitle: string;
    titlePlaceholder: string;
    fieldCity: string;
    fieldDistrict: string;
    districtPlaceholder: string;
    fieldTermType: string;
    termDay: string;
    termMonth: string;
    priceDay: string;
    priceMonth: string;
    fieldDeposit: string;
    depositYes: string;
    depositNo: string;
    fieldDesc: string;
    descPlaceholder: string;
    fieldPhotos: string;
    cover: string;
    addPhoto: string;
    photoN: string; // {n}
    photosHint: string;
    fieldAmenities: string;
    publish: string;
    publishing: string;
  };
  profile: {
    title: string;
    bookings: string;
    listings: string;
    payment: string;
    paymentNotAdded: string;
    notifications: string;
    notificationsOn: string;
    language: string;
    handleRegistered: string;
    handleGuest: string;
    becomeHostBanner: string;
    becomeHostCta: string;
    becomeHostSub: string;
  };
  gate: {
    dismiss: string;
    continueAs: string; // {name}
    saveTitle: string;
    saveSub: string;
    bookTitle: string;
    bookSub: string;
    addTabTitle: string;
    addTabSub: string;
    addPublishTitle: string;
    addPublishSub: string;
  };
  toast: {
    bookRequested: string;
    profileConfirmed: string;
    fillRequired: string;
    published: string;
  };
  amenity: {
    wifi: string;
    parking: string;
    washer: string;
    ac: string;
    ownBathroom: string;
    furniture: string;
    pets: string;
  };
  languagePicker: {
    title: string;
  };
}

// Плоский путь вида "profile.language" ко всем строковым листьям Dict.
type PathsOf<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : PathsOf<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = PathsOf<Dict>;
