// Supabase Edge Function: telegram-webhook
//
// Принимает обновления от Telegram Bot API (setWebhook должен указывать
// сюда) и обрабатывает две вещи, связанные с оплатой публикации
// объявления через Telegram Payments:
//
//   1. pre_checkout_query — Telegram обязательно ждёт ответ в течение
//      10 секунд после того, как пользователь нажал "Оплатить" в форме
//      инвойса. Проверяем, что черновик (pending_listings) существует и
//      ещё не использован, и отвечаем answerPreCheckoutQuery(ok: true).
//   2. message.successful_payment — платёж прошёл. Находим черновик по
//      invoice_payload, создаём настоящую запись в public.listings от
//      имени автора черновика и помечаем черновик использованным
//      (consumed_at + listing_id + telegram_charge_id — уникальный
//      индекс на telegram_charge_id защищает от повторной обработки
//      одного и того же платежа, если Telegram продублирует update).
//
// Деплой: supabase functions deploy telegram-webhook --no-verify-jwt
// (--no-verify-jwt обязателен: этот endpoint дёргает сам Telegram, а не
// залогиненный пользователь Supabase, поэтому обычная проверка JWT здесь
// неприменима — вместо неё используется секрет вебхука, см. ниже)
//
// Настройка (после того, как бот и Stripe-провайдер подключены через
// @BotFather):
//   1. supabase secrets set TELEGRAM_BOT_TOKEN=...
//   2. supabase secrets set TELEGRAM_WEBHOOK_SECRET=<случайная строка>
//   3. curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
//        -d "url=https://<project-ref>.supabase.co/functions/v1/telegram-webhook" \
//        -d "secret_token=<та же случайная строка>" \
//        -d "allowed_updates=[\"pre_checkout_query\",\"message\"]"

import { createClient } from "jsr:@supabase/supabase-js@2";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const WEBHOOK_SECRET = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface PendingListingRow {
  id: string;
  author_id: string;
  draft: {
    title: string;
    city: string;
    district: string;
    term: "day" | "month";
    price: string;
    deposit: boolean;
    desc: string;
    photos: string[];
    amenities: string[];
  };
  consumed_at: string | null;
}

async function callBotApi(method: string, body: Record<string, unknown>) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Telegram шлёт секрет из setWebhook в этом заголовке — так мы отличаем
  // настоящие апдейты от произвольных запросов на публичный URL функции.
  if (WEBHOOK_SECRET && req.headers.get("X-Telegram-Bot-Api-Secret-Token") !== WEBHOOK_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }

  let update: Record<string, unknown>;
  try {
    update = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // ---------- 1. pre_checkout_query ----------
  const preCheckout = update.pre_checkout_query as { id: string; invoice_payload: string } | undefined;
  if (preCheckout) {
    const { data: pending } = await admin
      .from("pending_listings")
      .select("id, consumed_at")
      .eq("id", preCheckout.invoice_payload)
      .maybeSingle<Pick<PendingListingRow, "id" | "consumed_at">>();

    if (!pending || pending.consumed_at) {
      await callBotApi("answerPreCheckoutQuery", {
        pre_checkout_query_id: preCheckout.id,
        ok: false,
        error_message: "Этот черновик объявления больше не действителен, начните публикацию заново.",
      });
    } else {
      await callBotApi("answerPreCheckoutQuery", { pre_checkout_query_id: preCheckout.id, ok: true });
    }
    return new Response("ok");
  }

  // ---------- 2. message.successful_payment ----------
  const message = update.message as
    | { successful_payment?: { invoice_payload: string; telegram_payment_charge_id: string } }
    | undefined;
  const payment = message?.successful_payment;
  if (payment) {
    const { data: pending } = await admin
      .from("pending_listings")
      .select("*")
      .eq("id", payment.invoice_payload)
      .maybeSingle<PendingListingRow>();

    if (pending && !pending.consumed_at) {
      const draft = pending.draft;
      const { data: created, error: insertError } = await admin
        .from("listings")
        .insert({
          author_id: pending.author_id,
          city: draft.city,
          district: draft.district,
          title: draft.title,
          description: draft.desc,
          price: Number(draft.price) || 0,
          term: draft.term,
          deposit: draft.deposit,
          type: "Отдельная комната",
          tags: draft.deposit ? [] : ["Без депозита"],
          amenities: draft.amenities,
          photos: draft.photos,
        })
        .select("id")
        .single();

      if (!insertError && created) {
        // telegram_charge_id уникален в схеме — если Telegram продублирует
        // update об этом же платеже, второй insert/update просто не пройдёт
        // повторно (черновик уже consumed).
        await admin
          .from("pending_listings")
          .update({
            consumed_at: new Date().toISOString(),
            listing_id: created.id,
            telegram_charge_id: payment.telegram_payment_charge_id,
          })
          .eq("id", pending.id);
      }
    }
    return new Response("ok");
  }

  return new Response("ignored");
});
