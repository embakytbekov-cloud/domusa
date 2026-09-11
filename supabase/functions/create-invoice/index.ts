// Supabase Edge Function: create-invoice
//
// Вызывается клиентом (src/lib/payments.ts) перед публикацией второго и
// последующих объявлений ($3 за штуку — первое объявление бесплатно).
// Сохраняет черновик объявления в public.pending_listings и создаёт
// ссылку на оплату через Telegram Bot API createInvoiceLink. Клиент затем
// открывает эту ссылку через Telegram.WebApp.openInvoice — Telegram сам
// показывает нативную форму оплаты; если бот подключён к провайдеру
// Stripe (@BotFather → тот бот → Payments), на iOS в этой форме
// автоматически появляется кнопка Apple Pay, на Android — Google Pay.
// Никакой отдельной интеграции с Apple/Google Pay в коде не требуется.
//
// Деплой: supabase functions deploy create-invoice
// Секреты (Project Settings → Edge Functions → Secrets):
//   supabase secrets set TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
//   supabase secrets set TELEGRAM_PAYMENT_PROVIDER_TOKEN=284685063:TEST:...
// (provider token выдаётся в @BotFather → ваш бот → Payments → Stripe,
// после подключения Stripe-аккаунта — тестовый или боевой, в зависимости
// от того, какой провайдер там выбран)

import { createClient } from "jsr:@supabase/supabase-js@2";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const PROVIDER_TOKEN = Deno.env.get("TELEGRAM_PAYMENT_PROVIDER_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const LISTING_PRICE_USD = 3;

interface ListingDraft {
  title: string;
  city: string;
  district: string;
  term: "day" | "month";
  price: string;
  deposit: boolean;
  desc: string;
  photos: string[];
  amenities: string[];
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  if (!BOT_TOKEN || !PROVIDER_TOKEN) {
    // Бот/провайдер ещё не настроены через @BotFather — это ожидаемо, пока
    // пользователь не подключил Stripe. Отвечаем понятной ошибкой, а не 500.
    return new Response(JSON.stringify({ error: "payments_not_configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Missing Authorization header", { status: 401 });
  }

  let draft: ListingDraft | undefined;
  try {
    ({ draft } = await req.json());
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }
  if (!draft || !draft.title || !draft.price) {
    return new Response("draft is required", { status: 400 });
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return new Response("Invalid Supabase session", { status: 401 });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const amountCents = LISTING_PRICE_USD * 100;

  const { data: pending, error: insertError } = await admin
    .from("pending_listings")
    .insert({
      author_id: userData.user.id,
      draft,
      amount_cents: amountCents,
      currency: "USD",
    })
    .select("id")
    .single();

  if (insertError || !pending) {
    return new Response(insertError?.message ?? "failed to create pending listing", { status: 500 });
  }

  const invoiceRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Размещение объявления — ДомUSA",
      description: draft.title,
      payload: pending.id,
      provider_token: PROVIDER_TOKEN,
      currency: "USD",
      prices: [{ label: "Публикация объявления", amount: amountCents }],
    }),
  });
  const invoiceJson = await invoiceRes.json();

  if (!invoiceJson.ok) {
    await admin.from("pending_listings").delete().eq("id", pending.id);
    return new Response(JSON.stringify({ error: invoiceJson.description ?? "createInvoiceLink failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ invoiceLink: invoiceJson.result }), {
    headers: { "Content-Type": "application/json" },
  });
});
