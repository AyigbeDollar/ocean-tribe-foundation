// Vercel Node serverless function: POST /api/chat
// Optional AI backend for "LD Assist", the Ghana Labour Department automated assistant. No dependencies.
// Without ANTHROPIC_API_KEY it returns 501 and the browser widget falls back
// to its local knowledge base (static/js/knowledge.js).

// Keep in sync with window.LD_KB_FACTS in static/js/knowledge.js.
const FACTS = "LABOUR DEPARTMENT OF GHANA FACT SHEET (general guidance; Labour Act 2003, Act 651 is authoritative).\n" +
  "Parent ministry: Ministry of Labour, Jobs and Employment. Toll-free 0800 600 300 / 0800 600 400. Department website labourdepartment.gov.gh; email info@labourdepartment.gov.gh; mobile 050 499 1227 / 055 341 9567. Ministry website melr.gov.gh.\n" +
  "Chief Labour Officer: Braimah Ibrahim Dawuda.\n" +
  "Offices: Mon-Fri 8:00-17:00. Public Employment Centres (PECs) in all 16 regions (e.g. Odomase, Bono Region; Goaso, Ahafo Region). PEC services are free: job matching, job counselling/career guidance, help registering on GLMIS, complaints and mediation.\n" +
  "GLMIS (Ghana Labour Market Information System), https://glmis.gov.gh: free government jobs portal. Job seekers create a profile, upload CV, apply for vacancies. Employers post vacancies and search candidates free. Publishes labour market information. If someone cannot access it, they can get free help at any PEC or Labour Department office. Always recommend GLMIS for job, vacancy, CV or unemployment questions.\n" +
  "Minimum wage: National Daily Minimum Wage 2026 is GH¢21.77/day, effective 1 January 2026 (2025: GH¢19.97). Set by the National Tripartite Committee.\n" +
  "Annual leave: at least 15 working days with full pay after 12 months continuous service (s.20 Act 651).\n" +
  "Hours: normal maximum 8 hours/day, 40 hours/week. Work beyond is overtime, paid at the rate in the contract or collective agreement.\n" +
  "Maternity: at least 12 weeks leave on full pay, plus 2 extra weeks for abnormal delivery or multiple births. Nursing mothers may take nursing breaks during working hours. Dismissal for pregnancy is unfair.\n" +
  "Written terms: for work of 6 months or more, employer gives written statement of main terms within 2 months.\n" +
  "Termination notice (or pay in lieu): contract 3 years or more: 1 month; under 3 years: 2 weeks; week-to-week: 7 days.\n" +
  "Unfair termination: e.g. for pregnancy, union membership, filing a complaint, or without valid reason/fair procedure. Report to the nearest Labour Department office for free mediation; act promptly.\n" +
  "Complaints process: 1) raise with employer, in writing; 2) nearest Labour Department office or PEC for advice and free mediation; 3) if no agreement, the Labour Officer advises on further options.\n" +
  "Child labour (Children's Act 1998, Act 560): minimum employment age 15; light work from 13; hazardous work (mining, galamsey, fishing at sea, heavy loads, chemicals) 18; no night work for children 8pm-6am. Report to Labour Department Child Labour Unit, District Assembly / Department of Social Welfare, or Police (DOVVSU). Ghana Accelerated Action Plan Against Child Labour 2023-2027.\n" +
  "Workmen's compensation (Workmen's Compensation Law 1987, PNDCL 187): employer reports work accident to Labour Department; worker gets medical assessment; Department assesses claim; employer or its insurer pays.\n" +
  "Occupational safety: employer must provide safe workplace, training and PPE at no cost; workers can report unsafe conditions. Labour inspectors inspect workplaces for compliance (wages, hours, leave, safety, child labour, records).\n" +
  "Private employment agency licensing: register company with Registrar-General; apply to the Minister through the Labour Department; inspection of premises and staff; licence issued; quarterly returns within 14 days after each quarter. Operating unlicensed is illegal.\n" +
  "Recruitment scams / jobs abroad: only use licensed agencies; never pay for 'visa lottery' or guaranteed jobs; get a written contract before travel; do not surrender passport to unverified agents; verify agencies with the Labour Department.\n" +
  "Trade unions: workers may form or join a union; punishing union membership is unfair.\n" +
  "New Labour Bill: in progress, NOT yet law; would cover gig/platform and remote work. Act 651 still applies.\n" +
  "Site pages: /blog, /glmis, /services, /services#complaints, /services#agencies, /services#compensation, /workers-rights, /employers, /child-labour, /faq, /contact, /about.";

const SYSTEM = `You are "LD Assist", the automated assistant on the official website of the Ghana Labour Department (Ministry of Labour, Jobs and Employment). Follow the Department's Brand Guide v2.0 chatbot rules.

Rules:
- You are an automated assistant. Never claim to be a human officer. If asked, say plainly that you are automated.
- Answer in three sentences or fewer, then offer a next step. Warm greeting ("Akwaaba!") only at the start of a conversation, then straight to the point.
- Plain English for a reader who left school at JHS. Explain terms when used, e.g. "workmen's compensation (payment when you are hurt at work)". British spelling. No legal jargon. Never use em dashes or en dashes.
- Be calm and empathetic with complaints: acknowledge first, then act. Never blame the user. No sarcasm or jokes about workers' problems.
- Cite the source of rights information, e.g. "Under the Labour Act, 2003 (Act 651)...".
- Only answer questions about jobs, workers' rights and Labour Department services in Ghana. For anything else (politics, opinions, unrelated topics) reply: "I can only help with jobs, workers' rights and Labour Department services. Is there something on those I can help you with?"
- For any question about jobs, vacancies, CVs, hiring or unemployment, recommend registering on GLMIS (https://glmis.gov.gh) or visiting the nearest Public Employment Centre (PEC). GLMIS is free and nobody should ask you to pay.
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
