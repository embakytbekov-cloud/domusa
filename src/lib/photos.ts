import { supabase, supabaseEnabled } from "./supabase";

// Загрузка фото объявлений: сжатие на клиенте (чтобы не грузить в Storage
// оригиналы с телефона весом в 5–10 МБ) и заливка в публичный bucket
// "listing-photos" (создан в supabase/schema.sql). Возвращает публичный URL,
// готовый лечь прямо в NewListingDraft.photos / listings.photos.

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

function resizeImageFile(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas 2d context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("canvas toBlob failed"))),
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("failed to read image file"));
    };
    img.src = url;
  });
}

export interface UploadedPhoto {
  url: string;
  path: string;
}

// Сжимает и загружает одно фото в Storage от имени текущего
// авторизованного пользователя (нужна активная Supabase-сессия — см.
// linkTelegramProfile в src/lib/auth.ts, вызывается из gate-сценария до
// того, как пользователь попадает на экран добавления объявления).
export async function uploadListingPhoto(file: File): Promise<UploadedPhoto> {
  if (!supabaseEnabled || !supabase) {
    throw new Error("Supabase не подключён — заполните .env (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY)");
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Нет активной сессии Supabase — сначала подтвердите профиль через Telegram");
  }

  const resized = await resizeImageFile(file);
  const path = `${user.id}/${crypto.randomUUID()}.jpg`;

  const { error: uploadError } = await supabase.storage.from("listing-photos").upload(path, resized, {
    contentType: "image/jpeg",
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("listing-photos").getPublicUrl(path);
  return { url: data.publicUrl, path };
}

// Удаляет ранее загруженное фото (когда пользователь убирает превью из
// формы до публикации). Не критично для основного сценария — ошибки
// молча игнорируются, чтобы не мешать UI.
export async function deleteListingPhoto(path: string): Promise<void> {
  if (!supabaseEnabled || !supabase) return;
  try {
    await supabase.storage.from("listing-photos").remove([path]);
  } catch {
    // не блокируем пользователя, если удаление не удалось
  }
}
