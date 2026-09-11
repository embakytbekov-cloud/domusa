import { supabase } from "./supabase";
import { getTelegramInitData } from "./telegram";

// Раньше эта функция не была обёрнута ни в один try/catch: если
// supabase.auth.getSession()/signInAnonymously()/functions.invoke() кидали
// исключение (а не просто возвращали { error }, как в "штатном" случае —
// например, при обрыве сети, CORS-préflight failure или зависшем запросе),
// оно улетало как необработанный promise rejection. Снаружи (см.
// confirmGate() в src/store/appStore.ts) await просто никогда не резолвился
// либо падал без единого console.error — кнопка "Continue as Em" внешне
// выглядела так, будто клик вообще не сработал.
//
// Теперь: (1) каждый шаг обёрнут в try/catch с понятным console.error,
// (2) весь вызов защищён таймаутом — если Supabase/проверка HMAC на
// telegram-link зависнут дольше LINK_TIMEOUT_MS, promise гарантированно
// резолвится в false, а не висит вечно.

const LINK_TIMEOUT_MS = 10000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`[auth] ${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export async function linkTelegramProfile(): Promise<boolean> {
  if (!supabase) {
    console.error("[auth] linkTelegramProfile: Supabase client недоступен (нет .env)");
    return false;
  }

  const initData = getTelegramInitData();
  if (!initData) {
    console.error("[auth] linkTelegramProfile: пустой Telegram initData — открыто не внутри Telegram?");
    return false;
  }

  try {
    return await withTimeout(doLink(initData), LINK_TIMEOUT_MS, "linkTelegramProfile");
  } catch (err) {
    console.error("[auth] linkTelegramProfile failed:", err);
    return false;
  }
}

async function doLink(initData: string): Promise<boolean> {
  if (!supabase) return false;

  let session;
  try {
    session = (await supabase.auth.getSession()).data.session;
  } catch (err) {
    console.error("[auth] getSession() выбросил исключение:", err);
    return false;
  }

  if (!session) {
    try {
      const { data: sessionData, error: signInError } = await supabase.auth.signInAnonymously();
      if (signInError || !sessionData.session) {
        console.error("[auth] signInAnonymously() не удался:", signInError ?? "нет session в ответе");
        return false;
      }
      session = sessionData.session;
    } catch (err) {
      console.error("[auth] signInAnonymously() выбросил исключение:", err);
      return false;
    }
  }

  try {
    const { error } = await supabase.functions.invoke("telegram-link", {
      body: { initData },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (error) {
      // Ожидаемо, пока в Supabase не настроен секрет TELEGRAM_BOT_TOKEN —
      // Edge Function отклоняет проверку HMAC. Логируем, чтобы это было
      // видно в консоли, а не терялось молча.
      console.error("[auth] Edge Function telegram-link вернула ошибку:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[auth] functions.invoke('telegram-link') выбросил исключение:", err);
    return false;
  }
}
