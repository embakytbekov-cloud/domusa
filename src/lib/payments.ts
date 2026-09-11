import { getWebApp } from "./telegram";
import { supabase, supabaseEnabled } from "./supabase";
import type { NewListingDraft } from "../types/listing";

// Оплата размещения объявления через Telegram Payments (Bot API
// sendInvoiceLink/openInvoice). Apple Pay / Google Pay включаются
// автоматически самим Telegram, когда бот подключён к провайдеру Stripe
// через @BotFather → Payments — в коде клиента и Edge Function ничего
// специфичного для Apple/Google Pay делать не нужно.
//
// Поток:
//   1. Клиент просит ссылку на инвойс у Edge Function create-invoice,
//      передавая черновик объявления (см. supabase/functions/create-invoice).
//   2. Функция сохраняет черновик в public.pending_listings и создаёт
//      ссылку через Bot API createInvoiceLink.
//   3. Клиент открывает ссылку через Telegram.WebApp.openInvoice — Telegram
//      сам показывает нативную форму оплаты (с кнопкой Apple Pay на iOS).
//   4. После оплаты Telegram шлёт update боту; supabase/functions/
//      telegram-webhook подтверждает pre_checkout_query и по
//      successful_payment создаёт настоящую запись в listings.
//   5. Клиент (см. useAppStore.publish) после статуса "paid" от openInvoice
//      опрашивает listingsRepo.waitForNewListing, ожидая, пока вебхук
//      обработает платёж и объявление появится в "Моих объявлениях".

export type InvoiceOutcome = "paid" | "cancelled" | "failed" | "pending" | "unavailable";

export const LISTING_PRICE_USD = 3;

export async function requestListingPayment(draft: NewListingDraft): Promise<InvoiceOutcome> {
  if (!supabaseEnabled || !supabase) return "unavailable";

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return "unavailable";

  const { data, error } = await supabase.functions.invoke<{ invoiceLink?: string }>("create-invoice", {
    body: { draft },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (error || !data?.invoiceLink) return "failed";

  const invoiceLink = data.invoiceLink;

  return new Promise((resolve) => {
    try {
      const webApp = getWebApp();
      if (!webApp) {
        resolve("unavailable");
        return;
      }
      webApp.openInvoice(invoiceLink, (status) => resolve(status));
    } catch {
      resolve("unavailable");
    }
  });
}
