// Verify a Paystack donation server-side and record it.
//
// The browser calls this after Paystack's inline popup reports success, passing
// only the transaction `reference`. This function re-checks the transaction
// against Paystack's authoritative verify endpoint using the SECRET key (never
// exposed to the client), then upserts the result into `public.donations` with
// the service_role key (which bypasses RLS).
//
// Secrets required (set with `supabase secrets set`):
//   PAYSTACK_SECRET_KEY   - your sk_live_... / sk_test_... key
// Auto-injected by the platform:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const { reference } = await req.json().catch(() => ({}));
    if (!reference || typeof reference !== "string") {
      return json({ error: "Missing transaction reference" }, 400);
    }

    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecret) {
      console.error("PAYSTACK_SECRET_KEY is not set");
      return json({ error: "Server not configured" }, 500);
    }

    // Ask Paystack whether this transaction actually succeeded.
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${paystackSecret}` } },
    );
    const verifyBody = await verifyRes.json();

    if (!verifyRes.ok || !verifyBody?.status) {
      console.error("Paystack verify failed", verifyBody);
      return json({ verified: false, error: "Verification failed" }, 502);
    }

    const tx = verifyBody.data;
    const succeeded = tx?.status === "success";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // amount comes back in the subunit (pesewas/kobo); store the major unit.
    const record = {
      reference: tx.reference,
      email: tx?.customer?.email ?? null,
      donor_name:
        tx?.metadata?.custom_fields?.find(
          (f: { variable_name?: string }) => f?.variable_name === "donor_name",
        )?.value ?? null,
      amount: typeof tx?.amount === "number" ? tx.amount / 100 : 0,
      currency: tx?.currency ?? "GHS",
      status: succeeded ? "success" : "failed",
      channel: tx?.channel ?? null,
      paid_at: tx?.paid_at ?? null,
      raw_response: tx ?? null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("donations")
      .upsert(record, { onConflict: "reference" });

    if (error) {
      console.error("Failed to record donation", error);
      return json({ verified: succeeded, recorded: false }, 500);
    }

    return json({
      verified: succeeded,
      recorded: true,
      amount: record.amount,
      currency: record.currency,
      status: record.status,
    });
  } catch (err) {
    console.error("verify-donation error", err);
    return json({ error: "Unexpected error" }, 500);
  }
});
