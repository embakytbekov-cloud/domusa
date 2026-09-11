// Supabase Edge Function: telegram-link
//
// Проверяет подлинность Telegram.WebApp.initData (HMAC-подпись согласно
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
// и привязывает telegram_id / имя / фото к текущему авторизованному
// пользователю Supabase (profiles.id = auth.uid()).
//
// Как использовать на клиенте:
//   1. const { data } = await supabase.auth.signInAnonymously();
//   2. const initData = window.Telegram.WebApp.initData;
//   3. await fetch(`${SUPABASE_URL}/functions/v1/telegram-link`, {
//        method: "POST",
//        headers: {
//          "Content-Type": "application/json",
//          Authorization: `Bearer ${data.session.access_token}`,
//        },
//        body: JSON.stringify({ initData }),
//      });
//
// Деплой: supabase functions deploy telegram-link
// Секреты (Project Settings → Edge Functions → Secrets):
//   supabase secrets set TELEGRAM_BOT_TOKEN=123456:ABC-DEF...

import { createClient } from "jsr:@supabase/supabase-js@2";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Клиент (src/lib/auth.ts) вызывает эту функцию через supabase.functions.invoke(),
// который отправляет заголовки Authorization/apikey/x-client-info/content-type —
// это триггерит CORS preflight (OPTIONS) из браузера. Без явной обработки OPTIONS
// и заголовков Access-Control-* браузер блокирует запрос ещё ДО того, как он
// доходит до основной логики — именно поэтому кнопка подтверждения в приложении
// молча (или с ошибкой) обрывалась: сервер отвечал на preflight 405, а не 204,
// и настоящий POST с initData никогда не уходил.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function hmacSha256(key: BufferSource, message: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
  return new Uint8Array(sig);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyInitData(initData: string): Promise<Record<string, string> | null> {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const sortedKeys = Array.from(params.keys()).sort();
  const dataCheckString = sortedKeys.map((k) => `${k}=${params.get(k)}`).join("\n");

  const secretKey = await hmacSha256(new TextEncoder().encode("WebAppData"), BOT_TOKEN);
  const computedHash = toHex(await hmacSha256(secretKey, dataCheckString));
  if (computedHash !== hash) return null;

  const authDate = Number(params.get("auth_date") ?? 0);
  const ageSeconds = Date.now() / 1000 - authDate;
  if (!authDate || ageSeconds > 86400) return null; // старше 24 часов — отклоняем как устаревшее

  const result: Record<string, string> = {};
  for (const [k, v] of params.entries()) result[k] = v;
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Missing Authorization header", { status: 401, headers: corsHeaders });
  }

  let initData: string | undefined;
  try {
    ({ initData } = await req.json());
  } catch {
    return new Response("Invalid JSON body", { status: 400, headers: corsHeaders });
  }
  if (!initData) {
    return new Response("initData is required", { status: 400, headers: corsHeaders });
  }

  const verified = await verifyInitData(initData);
  if (!verified) {
    return new Response("Invalid Telegram signature", { status: 401, headers: corsHeaders });
  }

  const tgUser = verified.user ? JSON.parse(verified.user) : null;
  if (!tgUser) {
    return new Response("initData has no user payload", { status: 400, headers: corsHeaders });
  }

  // Клиент от имени вызывающего — чтобы достоверно узнать его auth.uid()
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return new Response("Invalid Supabase session", { status: 401, headers: corsHeaders });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { error } = await admin.from("profiles").upsert({
    id: userData.user.id,
    telegram_id: tgUser.id,
    telegram_username: tgUser.username ?? null,
    name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" "),
    photo_url: tgUser.photo_url ?? null,
  });

  if (error) {
    return new Response(error.message, { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
