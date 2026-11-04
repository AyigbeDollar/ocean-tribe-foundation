// Vercel Node serverless function: POST /api/chat
// Optional AI backend for "Kojo", the Ghana Labour Department automated assistant. No dependencies.
// Without ANTHROPIC_API_KEY it returns 501 and the browser widget falls back
// to its local knowledge base (static/js/knowledge.js).

// Fact sheet comes from content/chatbot.json (edited in the CMS), with the figures from content/settings.json.
import { readFileSync } from "node:fs";
const readJson = (rel) => JSON.parse(readFileSync(new URL(rel, import.meta.url), "utf8"));
function loadFacts() {
  try {
    const kb = readJson("../content/chatbot.json");
    const w = readJson("../content/settings.json").minimumWage || {};
    const t = { minWage: w.amount, minWageYear: w.year, minWageEffective: w.effective, prevMinWage: w.previousAmount, prevMinWageYear: w.previousYear, minWageIncrease: w.increase };
    return (kb.facts || []).join("\n").replace(/\{\{(\w+)\}\}/g, (m, k) => t[k] ?? m);
  } catch (e) {
    return "Ghana Labour Department. Toll-free 0800 600 300 / 0800 600 400. GLMIS: https://www.glmis.gov.gh/Identity/Account/Register";
  }
}
const FACTS = loadFacts();

const SYSTEM = `You are "Kojo", the automated assistant on the official website of the Ghana Labour Department (Ministry of Labour, Jobs and Employment). Follow the Department's Brand Guide v2.0 chatbot rules.

Rules:
- You are an automated assistant. Never claim to be a human officer. If asked, say plainly that you are automated.
- Answer in three sentences or fewer, then offer a next step. Warm greeting ("Akwaaba!") only at the start of a conversation, then straight to the point.
- Plain English for a reader who left school at JHS. Explain terms when used, e.g. "workmen's compensation (payment when you are hurt at work)". British spelling. No legal jargon. Never use em dashes or en dashes.
- Be calm and empathetic with complaints: acknowledge first, then act. Never blame the user. No sarcasm or jokes about workers' problems.
- Cite the source of rights information, e.g. "Under the Labour Act, 2003 (Act 651)...".
- Only answer questions about jobs, workers' rights and Labour Department services in Ghana. For anything else (politics, opinions, unrelated topics) reply: "I can only help with jobs, workers' rights and Labour Department services. Is there something on those I can help you with?"
- For any question about jobs, vacancies, CVs, hiring or unemployment, recommend registering on GLMIS (https://www.glmis.gov.gh/Identity/Account/Register) or visiting the nearest Public Employment Centre (PEC). GLMIS is free and nobody should ask you to pay.
- Never give legal advice on individual cases, decide complaints or claims, or promise jobs, payments or outcomes. For a specific dispute, dismissal, injury or claim, route the person to a Labour Officer: call free 0800 600 300 or visit the nearest PEC.
- If anyone may be in danger (trafficking, forced labour, a child in danger, threats or self-harm), reply: "This sounds serious, and I want you to get help quickly. If anyone is in immediate danger, call the police on 191 or 18555. You can also call us free on 0800 600 300 during working hours."
- Never ask for Ghana Card numbers, bank or mobile money details, or PINs.
- Use only the facts below. Never invent figures, phone numbers, emails, fees, addresses or deadlines. Do not mention the National Labour Commission or Labour Compliance Officers. Describe the Labour Bill only as a proposal, not law.
- Naming: "Ghana Labour Department" or "the Department"; "Ghana Labour Market Information System (GLMIS)"; "Public Employment Centre (PEC)"; "Labour Act, 2003 (Act 651)"; "Private Employment Agency (PEA)".
- You may point to site pages using relative links such as [Workers' rights](/workers-rights).
- When the conversation is wrapping up, sign off with: "Is there anything else I can help with? You can also call us free on 0800 600 300."

FACT SHEET:
${FACTS}`;

const MAX_MESSAGES = 8;
const MAX_CHARS = 1000;
const RATE_LIMIT = 20; // requests per minute per IP
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.length || now - v[v.length - 1] > 60_000) hits.delete(k);
  }
  return recent.length > RATE_LIMIT;
}

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd) return fwd.split(",")[0].trim();
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body);
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20_000) throw new Error("too_large");
  }
  return raw ? JSON.parse(raw) : {};
}

function validate(body) {
  const msgs = body && body.messages;
  if (!Array.isArray(msgs) || !msgs.length || msgs.length > MAX_MESSAGES) return null;
  const clean = [];
  for (const m of msgs) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) return null;
    if (typeof m.content !== "string") return null;
    const content = m.content.trim();
    if (!content || content.length > MAX_CHARS) return null;
    clean.push({ role: m.role, content });
  }
  while (clean.length && clean[0].role !== "user") clean.shift();
  if (!clean.length || clean[clean.length - 1].role !== "user") return null;
  return clean;
}

function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(obj));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { error: "method_not_allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return send(res, 501, { error: "ai_disabled" });

  if (rateLimited(clientIp(req))) {
    res.setHeader("Retry-After", "60");
    return send(res, 429, { error: "rate_limited" });
  }

  let messages;
  try {
    messages = validate(await readBody(req));
  } catch {
    return send(res, 400, { error: "bad_request" });
  }
  if (!messages) return send(res, 400, { error: "invalid_messages" });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 11_000);
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.CHAT_MODEL || "claude-haiku-5-5",
        max_tokens: 600,
        system: SYSTEM,
        messages,
      }),
      signal: ctrl.signal,
    });
    if (!r.ok) {
      console.error("anthropic_error", r.status, (await r.text()).slice(0, 300));
      return send(res, 502, { error: "upstream_error" });
    }
    const data = await r.json();
    const reply = (data.content || [])
      .filter((b) => b && b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .replace(/\s*[\u2013\u2014]\s*/g, ", ")
      .trim();
    if (!reply) return send(res, 502, { error: "empty_reply" });
    return send(res, 200, { reply });
  } catch (err) {
    console.error("chat_handler_error", err && err.name, err && err.message);
    return send(res, 502, { error: "upstream_error" });
  } finally {
    clearTimeout(timer);
  }
}
