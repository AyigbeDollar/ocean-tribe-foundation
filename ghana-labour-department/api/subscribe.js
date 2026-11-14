// Vercel Node serverless function: POST /api/subscribe
// "First pick" jobs and opportunities newsletter. Stores a subscriber in Supabase (EIB Data Hub)
// through its REST API with the project's publishable key. Row Level Security on the table allows
// inserts only: nobody can read the list from the browser. No dependencies.
import { readFileSync } from "node:fs";

const settings = (() => {
  try { return JSON.parse(readFileSync(new URL("../content/settings.json", import.meta.url), "utf8")); } catch (e) { return {}; }
})();
const NL = settings.newsletter || {};
const SUPABASE_URL = process.env.SUPABASE_URL || NL.supabaseUrl;
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || NL.publishableKey;

const REGIONS = ["Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra", "North East", "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta", "Western", "Western North"];
const INTERESTS = ["jobs", "job-fairs", "training", "work-abroad", "rights"];
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;

// Best-effort burst limit per IP (each warm instance keeps its own memory).
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 5;
}

// Ghana numbers to +233 format. Accepts 024 123 4567, 0241234567, 233241234567, +233 24 123 4567.
function ghanaPhone(raw) {
  const d = String(raw || "").replace(/[^\d+]/g, "");
  if (!d) return null;
  let n = d.replace(/^\+/, "");
  if (/^0\d{9}$/.test(n)) n = "233" + n.slice(1);
  if (/^233\d{9}$/.test(n)) return "+" + n;
  if (/^\d{9,15}$/.test(n) && d.startsWith("+")) return "+" + n; // other countries, e.g. diaspora
  return "invalid";
}

function readBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => { data += c; if (data.length > 8000) req.destroy(); });
    req.on("end", () => { try { resolve(JSON.parse(data || "{}")); } catch (e) { resolve({}); } });
    req.on("error", () => resolve({}));
  });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ ok: false, error: "method_not_allowed" }); }
  if (!SUPABASE_URL || !SUPABASE_KEY) return res.status(503).json({ ok: false, error: "not_configured" });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return res.status(429).json({ ok: false, error: "too_many", message: "Too many attempts. Please try again in a few minutes." });

  const b = await readBody(req);
  if (b.website) return res.status(200).json({ ok: true }); // honeypot: bots fill hidden fields

  const email = String(b.email || "").trim().toLowerCase().slice(0, 254);
  const whatsapp = ghanaPhone(b.whatsapp);
  const name = String(b.name || "").trim().replace(/\s+/g, " ").slice(0, 80) || null;
  const region = REGIONS.includes(b.region) ? b.region : null;
  const interests = (Array.isArray(b.interests) ? b.interests : []).filter((i) => INTERESTS.includes(i)).slice(0, INTERESTS.length);
  const source = String(b.source || "website").replace(/[^a-z0-9/_-]/gi, "").slice(0, 60) || "website";

  const errors = {};
  if (email && !EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
  if (whatsapp === "invalid") errors.whatsapp = "Please enter a valid WhatsApp number, for example 024 123 4567.";
  if (!email && !whatsapp) errors.email = "Enter your email address or WhatsApp number.";
  if (b.consent !== true) errors.consent = "Please agree so we can send you updates.";
  if (Object.keys(errors).length) return res.status(400).json({ ok: false, error: "invalid", errors });

  const row = { email: email || null, whatsapp: whatsapp && whatsapp !== "invalid" ? whatsapp : null, name, region, interests: interests.length ? interests : INTERESTS, source, consent: true };
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
    if (r.status === 201 || r.status === 204) return res.status(200).json({ ok: true });
    if (r.status === 409) return res.status(200).json({ ok: true, already: true }); // already on the list
    return res.status(502).json({ ok: false, error: "store_failed" });
  } catch (e) {
    return res.status(502).json({ ok: false, error: "store_failed" });
  }
}
