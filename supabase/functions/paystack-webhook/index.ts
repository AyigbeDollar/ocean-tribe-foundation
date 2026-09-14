// Paystack webhook receiver — the authoritative record of donations.
//
// Paystack POSTs transaction events here and signs each request with
// `x-paystack-signature` = HMAC-SHA512(rawBody, PAYSTACK_SECRET_KEY). We verify
// that signature before trusting anything, then upsert successful charges into
// `public.donations` using the service_role key (bypasses RLS).
//
// This function must be public (verify_jwt = false in config.toml) because
// Paystack cannot send a Supabase JWT. Its security comes from the signature.
//
// Secrets required: PAYSTACK_SECRET_KEY (+ auto SUPABASE_URL / SERVICE_ROLE_KEY)

import { createClient } from "jsr:@supabase/supabase-js@2";

const encoder = new TextEncoder();
const toHex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

async function signHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return toHex(sig);
}

// Constant-time-ish comparison to avoid leaking timing information.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!secret) {
    console.error("PAYSTACK_SECRET_KEY is not set");
    return new Response("Server not configured", { status: 500 });
  }

  // Read the RAW body — the signature is computed over the exact bytes.
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const expected = await signHex(secret, rawBody);

  if (!signature || !safeEqual(signature, expected)) {
    console.warn("Rejected webhook: invalid signature");
    return new Response("Invalid signature", { status: 401 });
  }

  let event: {
    event?: string;
    data?: Record<string, unknown> & {
      reference?: string;
      amount?: number;
      currency?: string;
      channel?: string;
      paid_at?: string;
      status?: string;
      customer?: { email?: string };
      metadata?: { custom_fields?: { variable_name?: string; value?: string }[] };
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  // Acknowledge non-charge events without doing anything.
  if (event.event !== "charge.success" || !event.data?.reference) {
    return new Response("ignored", { status: 200 });
  }

  const tx = event.data;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const record = {
    reference: tx.reference!,
    email: tx.customer?.email ?? null,
    donor_name:
      tx.metadata?.custom_fields?.find(
        (f) => f?.variable_name === "donor_name",
      )?.value ?? null,
    amount: typeof tx.amount === "number" ? tx.amount / 100 : 0,
    currency: tx.currency ?? "GHS",
    status: "success",
    channel: tx.channel ?? null,
    paid_at: tx.paid_at ?? null,
    raw_response: tx ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("donations")
    .upsert(record, { onConflict: "reference" });

  if (error) {
    console.error("Webhook failed to record donation", error);
    // 500 makes Paystack retry the delivery later.
    return new Response("Failed to record", { status: 500 });
  }

  return new Response("ok", { status: 200 });
});
