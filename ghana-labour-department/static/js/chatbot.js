/* "LD Assist", the Ghana Labour Department automated assistant (Brand Guide v2.0, chatbot guide).
   Vanilla JS, no dependencies. Tries the optional AI backend (POST /api/chat);
   if that is unavailable, answers from the local knowledge base (knowledge.js)
   so the widget always works on any static host. */
(function (w, d) {
  "use strict";

  /* ================================================================
     1. Local retrieval engine
     ================================================================ */

  var STOP_RAW = toSet(
    "a an the is are am was were be been i im me my mine you your u ur we our us they them their he she him her his it its " +
    "to of in on for and or but do does did doing can could would should will shall may might must " +
    "what whats wat how hw when where which who whom why " +
    "this that these those there here with at by as from into about abt " +
    "please pls plz kindly so if then just also any some have has had get got go going " +
    "want wanna need tell know say said give let make much many very really " +
    "not no yes ok okay hello hi hey sir madam please chale"
  );

  var STOP = {};

  // Raw token -> canonical token (applied before stemming).
  var SYN = {
    sacked: "sack", sacking: "sack", sacks: "sack", fired: "sack", fire: "sack", firing: "sack",
    dismissed: "dismiss", dismissal: "dismiss", dismissing: "dismiss",
    labor: "labour", center: "centre", centers: "centre", centres: "centre",
    license: "licence", licensed: "licence", licenced: "licence", licensing: "licence", licences: "licence", licenses: "licence", licencing: "licence",
    kid: "child", kids: "child", children: "child", childrens: "child", minor: "child", minors: "child",
    boss: "employer", oga: "employer", employers: "employer", company: "employer", companies: "employer",
    pregnancy: "pregnant", resume: "cv", cvs: "cv",
    unemployment: "unemployed", jobless: "unemployed",
    mum: "mother", mom: "mother", mama: "mother",
    hiring: "hire", hired: "hire", recruiting: "recruit", recruitment: "recruit",
    counseling: "counsel", counselling: "counsel", counsellor: "counsel", counselor: "counsel",
    advertise: "advert", advertising: "advert", advertisement: "advert",
    injured: "injury", injuries: "injury", hurt: "injury",
    nursing: "nurse", breastfeeding: "breastfeed",
    min: "minimum", hrs: "hours", hr: "hours", wks: "weeks", wk: "week",
    thx: "thanks", thanx: "thanks", tnx: "thanks",
    salaries: "salary", "pay-day": "payday",
    organisation: "organization", programme: "program",
    overseas: "abroad", galamsey: "galamsey", mines: "mine", mining: "mine",
    vacancies: "vacancy", jobs: "job"
  };

  function toSet(str) {
    var o = {};
    str.split(/\s+/).forEach(function (t) { if (t) o[t] = 1; });
    return o;
  }

  Object.keys(STOP_RAW).forEach(function (t) { STOP[t] = 1; STOP[stem(t)] = 1; });

  function normalise(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/gh\s*[¢c₵]/g, " ghc ")
      .replace(/[’'`]/g, "")
      .normalize("NFKD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function stem(t) {
    if (SYN[t]) t = SYN[t];
    if (t.length > 4 && /ies$/.test(t)) t = t.slice(0, -3) + "y";
    else if (t.length > 5 && /ing$/.test(t)) t = t.slice(0, -3);
    else if (t.length > 4 && /ed$/.test(t)) t = t.slice(0, -2);
    else if (t.length > 4 && /(ss|x|z|ch|sh)es$/.test(t)) t = t.slice(0, -2);
    else if (t.length > 3 && /s$/.test(t) && !/(ss|us|is)$/.test(t)) t = t.slice(0, -1);
    if (t.length > 3 && /e$/.test(t)) t = t.slice(0, -1);
    if (SYN[t]) t = SYN[t];
    return t;
  }

  function tokens(s) {
    var n = normalise(s);
    return n ? n.split(" ").map(stem) : [];
  }

  function content(toks) {
    var out = [];
    toks.forEach(function (t) { if (!STOP[t] && out.indexOf(t) < 0) out.push(t); });
    return out;
  }

  var SMALL_TALK = { greeting: 1, thanks: 1, bye: 1, capabilities: 1 };
  var THRESHOLD = 2.2;
  var index = null;

  function buildIndex() {
    var kb = w.LD_KB || [];
    var df = {};
    var docs = kb.map(function (it) {
      var kws = (it.k || []).map(function (k) {
        var tk = tokens(k);
        return { toks: tk, ns: noStop(tk), isStop: tk.every(function (t) { return STOP[t]; }) };
      }).filter(function (k) { return k.toks.length; });
      var qs = (it.q || []).map(function (q) {
        var tk = tokens(q);
        return { all: tk, c: content(tk) };
      });
      var vocab = {};
      kws.forEach(function (k) { k.toks.forEach(function (t) { if (!STOP[t]) vocab[t] = 1; }); });
      qs.forEach(function (q) { q.c.forEach(function (t) { vocab[t] = 1; }); });
      Object.keys(vocab).forEach(function (t) { df[t] = (df[t] || 0) + 1; });
      return { it: it, kws: kws, qs: qs, vocab: vocab };
    });
    var N = Math.max(docs.length, 1);
    var idf = {};
    Object.keys(df).forEach(function (t) { idf[t] = Math.log(N / df[t]) + 0.6; });
    index = { docs: docs, idf: idf, maxIdf: Math.log(N) + 0.6 };
  }

  function idfOf(t) {
    if (STOP[t]) return 0.25;
    return index.idf[t] || index.maxIdf * 0.8; // unseen words are informative but unmatched
  }

  // Ordered match of needle in hay, allowing at most one extra word between parts.
  function containsSeq(hay, needle) {
    for (var i = 0; i < hay.length; i++) {
      if (hay[i] !== needle[0]) continue;
      var pos = i, ok = true;
      for (var j = 1; j < needle.length && ok; j++) {
        if (hay[pos + 1] === needle[j]) pos += 1;
        else if (hay[pos + 2] === needle[j]) pos += 2;
        else ok = false;
      }
      if (ok) return true;
    }
    return false;
  }

  function noStop(toks) { return toks.filter(function (t) { return !STOP[t]; }); }

  function scoreDoc(doc, toks, ctoks, tns) {
    // (a) keyword / key-phrase hits, weighted by rarity, phrases boosted
    var kw = 0;
    doc.kws.forEach(function (k) {
      if (!(k.ns.length ? containsSeq(tns, k.ns) : containsSeq(toks, k.toks))) return;
      var s = 0;
      k.toks.forEach(function (t) { s += idfOf(t); });
      if (k.isStop) s = 0.6 * k.toks.length; // e.g. "what can you do"
      kw += s * (1 + 0.35 * (k.toks.length - 1));
    });
    // (b) weighted Jaccard similarity with the example phrasings
    var sim = 0;
    doc.qs.forEach(function (q) {
      var A = ctoks.length ? ctoks : toks, B = ctoks.length ? q.c : q.all;
      if (!A.length || !B.length) return;
      var inter = 0, uni = 0, seen = {};
      A.concat(B).forEach(function (t) {
        if (seen[t]) return; seen[t] = 1;
        var wgt = idfOf(t);
        uni += wgt;
        if (A.indexOf(t) >= 0 && B.indexOf(t) >= 0) inter += wgt;
      });
      if (uni) sim = Math.max(sim, inter / uni);
    });
    // (c) coverage: share of the question's meaningful words known to this intent
    var cov = 0, tot = 0;
    ctoks.forEach(function (t) { var wg = idfOf(t); tot += wg; if (doc.vocab[t]) cov += wg; });
    cov = tot ? cov / tot : 0;
    return kw + sim * 4 + cov * 1.5;
  }

  function rank(text) {
    if (!index) buildIndex();
    var toks = tokens(text), ctoks = content(toks), tns = noStop(toks);
    if (!toks.length) return [];
    return index.docs.map(function (doc) {
      return { id: doc.it.id, intent: doc.it, score: scoreDoc(doc, toks, ctoks, tns) };
    }).sort(function (a, b) { return b.score - a.score; });
  }

  function pick(ranked) {
    var best = null, bestTalk = null;
    for (var i = 0; i < ranked.length; i++) {
      var r = ranked[i];
      if (SMALL_TALK[r.id]) { if (!bestTalk) bestTalk = r; }
      else if (!best) best = r;
      if (best && bestTalk) break;
    }
    if (best && best.score >= THRESHOLD) {
      // Small talk wins only when clearly stronger (e.g. "thanks, bye").
      if (bestTalk && bestTalk.score > best.score * 1.8) return bestTalk;
      return best;
    }
    if (bestTalk && bestTalk.score >= THRESHOLD * 0.8) return bestTalk;
    return null;
  }

  /** match(question, previousQuestion?) -> {id, score, intent} | {id:"fallback", ...} */
  function match(q, prev) {
    var r = pick(rank(q));
    if (!r && prev && content(tokens(q)).length <= 5) {
      // Light multi-turn: "what about for twins?" after a maternity question.
      var r2 = pick(rank(prev + " " + q));
      if (r2 && !SMALL_TALK[r2.id]) r = r2;
    }
    if (r) return { id: r.id, score: Math.round(r.score * 100) / 100, intent: r.intent };
    var fb = w.LD_KB_FALLBACK || { id: "fallback", a: "<p>Sorry, I did not understand.</p>", links: [] };
    return { id: "fallback", score: 0, intent: fb };
  }

  w.LD_CHAT_MATCH = match;
  w.LD_CHAT_RANK = rank;

  /* ================================================================
     2. Widget
     ================================================================ */

  var root = d && d.querySelector && d.querySelector("[data-chat]");
  if (!root) return;

  var launcher = root.querySelector("[data-chat-open]");
  var panel = root.querySelector(".chat-panel");
  var closeBtn = root.querySelector("[data-chat-close]");
  var log = root.querySelector("[data-chat-log]");
  var chipsBox = root.querySelector("[data-chat-chips]");
  var form = root.querySelector("[data-chat-form]");
  var input = form && form.querySelector("input");
  if (!panel || !log || !form || !input) return;

  var STORE_KEY = "ld-assist-chat-v2";
  var AI_KEY = "ld-assist-ai-off";
  var GLMIS_URL = "https://glmis.gov.gh";
  var JOB_RE = /\b(job|jobs|work|vacanc|cv|resume|unemploy|hire|hiring|recruit|career|employ|hustle)/i;
  var CHIPS = [
    ["Find a job on GLMIS", "How do I find a job on GLMIS?"],
    ["Minimum wage 2026", "What is the minimum wage in 2026?"],
    ["Annual leave", "How many days of annual leave do I get?"],
    ["File a complaint", "How do I file a labour complaint?"],
    ["Report child labour", "How do I report child labour?"],
    ["License an agency", "How do I license a private employment agency?"]
  ];
  var WELCOME = {
    who: "bot",
    welcome: true,
    html: "<p>Akwaaba! I'm <strong>LD Assist</strong>, the Labour Department's automated assistant. How can I help?</p>" +
      "<p>Pick a topic below or type your question. To reach a person, type <strong>officer</strong>.</p>",
    links: [{ href: GLMIS_URL, label: "Search jobs on GLMIS", glmis: true }]
  };

  // Urgent safety script (chatbot guide p.23): shown before anything else, never sent to the AI.
  var SAFETY_RE = /\b(traffick\w*|forc(?:e|ed|es|ing)\b[^.?!]{0,30}\bwork\w*|(?:took|taken|seized|holding|kept)\b[^.?!]{0,20}\bpassport|slave\w*|kidnap\w*|locked (?:in|up)|beat(?:s|en|ing)? me|beating|threat\w*|kill (?:me|myself)|suicid\w*|self[- ]harm|hurt myself|in danger|immediate danger|abus(?:e|ed|ing)|rape\w*|held against)\b/i;
  var SAFETY = {
    who: "bot",
    html: "<p><strong>This sounds serious, and I want you to get help quickly.</strong> If anyone is in immediate danger, call the police on <strong>191</strong> or <strong>18555</strong>.</p>" +
      "<p>You can also call us free on <strong>0800 600 300</strong> during working hours.</p>",
    links: [{ href: "tel:191", label: "Call police 191" }, { href: "tel:0800600300", label: "Call 0800 600 300" }, { href: "/child-labour", label: "Report child labour" }]
  };
  // Hand over to a person (chatbot guide p.23): on request, or after two missed answers in a row.
  var HUMAN_RE = /^(?:officer|human|person|agent|real person|talk to (?:a |an )?(?:person|human|officer|someone)|speak to (?:a |an )?(?:person|human|officer|someone)|customer care)\b/i;
  var HANDOVER = {
    who: "bot",
    html: "<p>I'll point you to a person. A Labour Officer can help you by phone or at your nearest office.</p>" +
      "<ul><li>Call free on <strong>0800 600 300</strong> or <strong>0800 600 400</strong>, Monday to Friday, 8:00 am to 5:00 pm</li><li>Visit your nearest Public Employment Centre (PEC)</li><li>Email <strong>info@labourdepartment.gov.gh</strong></li></ul>",
    links: [{ href: "tel:0800600300", label: "Call 0800 600 300" }, { href: "/contact", label: "Find a PEC" }]
  };
  var misses = 0;

  var state = load();
  var rendered = false;
  var queue = Promise.resolve();
  var aiOff = (w.LD_CHAT_AI === false) || location.protocol === "file:" || ssGet(AI_KEY) === "1";

  function ssGet(k) { try { return w.sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { w.sessionStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
  function load() {
    try {
      var s = JSON.parse(ssGet(STORE_KEY) || "null");
      if (s && Array.isArray(s.msgs)) return s;
    } catch (e) { /* ignore */ }
    return { msgs: [] };
  }
  function save() {
    state.msgs = state.msgs.slice(-40);
    ssSet(STORE_KEY, JSON.stringify(state));
  }
  function track(obj) {
    try { if (w.dataLayer && w.dataLayer.push) w.dataLayer.push(obj); } catch (e) { /* ignore */ }
  }

  /* ---------- Rendering ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function isGlmis(href) { return /glmis\.gov\.gh/i.test(href) || href === "/glmis"; }
  function anchor(href, label, glmis) {
    var ext = /^https?:/i.test(href);
    return '<a href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : "") +
      (glmis || /glmis\.gov\.gh/i.test(href) ? ' class="glmis"' : "") + ">" + label + "</a>";
  }

  function inline(s) {
    // s is already HTML-escaped
    var keep = [];
    function hold(html) { keep.push(html); return "\u0000" + (keep.length - 1) + "\u0000"; }
    s = s.replace(/\[([^\]\n]+)\]\(((?:https?:\/\/|\/)[^\s)]*)\)/g, function (_, t, u) { return hold(anchor(u, t)); });
    s = s.replace(/\bhttps?:\/\/[^\s<\u0000]*[^\s<\u0000.,;:!?)\]]/g, function (u) { return hold(anchor(u, u)); });
    s = s.replace(/(^|[\s(])((?:www\.)?(?:glmis|melr)\.gov\.gh)(?![\w\/.])/gi, function (_, pre, dom) {
      return pre + hold(anchor("https://" + dom.toLowerCase(), dom));
    });
    s = s.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
    return s.replace(/\u0000(\d+)\u0000/g, function (_, i) { return keep[+i]; });
  }

  function mdToHtml(text) {
    var lines = esc(String(text || "").replace(/\r/g, "").trim()).split("\n");
    var out = [], para = [], list = [];
    function flushP() { if (para.length) { out.push("<p>" + para.map(inline).join("<br>") + "</p>"); para = []; } }
    function flushL() { if (list.length) { out.push("<ul>" + list.map(function (l) { return "<li>" + inline(l) + "</li>"; }).join("") + "</ul>"); list = []; } }
    lines.forEach(function (ln) {
      var m = ln.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
      if (m) { flushP(); list.push(m[1]); }
      else if (!ln.trim()) { flushP(); flushL(); }
      else { flushL(); para.push(ln.replace(/^#+\s*/, "")); }
    });
    flushP(); flushL();
    return out.join("") || "<p></p>";
  }

  function stripHtml(html) {
    var div = d.createElement("div");
    div.innerHTML = html.replace(/<\/(p|li)>/g, "$&\n");
    return (div.textContent || "").replace(/\n{2,}/g, "\n").trim();
  }

  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function renderMsg(m) {
    var el = d.createElement("div");
    if (m.who === "user") {
      el.className = "msg msg-user";
      el.textContent = m.text;
    } else {
      el.className = "msg msg-bot";
      el.innerHTML = m.html;
      if (m.links && m.links.length) {
        var box = d.createElement("div");
        box.className = "msg-links";
        box.innerHTML = m.links.map(function (l) { return anchor(esc(l.href), esc(l.label), l.glmis); }).join("");
        el.appendChild(box);
      }
      if (!m.welcome) {
        var fb = d.createElement("div");
        fb.className = "msg-feedback";
        fb.innerHTML = '<button type="button" data-v="up" aria-label="This answer helped" aria-pressed="false"><svg width="16" height="16" aria-hidden="true"><use href="/img/icons.svg#thumbup"/></svg></button>' +
          '<button type="button" data-v="down" aria-label="This answer did not help" aria-pressed="false"><svg width="16" height="16" aria-hidden="true"><use href="/img/icons.svg#thumbdown"/></svg></button>';
        fb.addEventListener("click", function (e) {
          var b = e.target.closest("button"); if (!b) return;
          fb.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
          track({ event: "chat_feedback", chat_feedback: b.getAttribute("data-v"), chat_source: m.src || "local" });
        });
        el.appendChild(fb);
      }
    }
    log.appendChild(el);
    scrollDown();
    return el;
  }

  function push(m) {
    state.msgs.push(m);
    save();
    renderMsg(m);
  }

  function renderAll() {
    if (rendered) return;
    rendered = true;
    log.innerHTML = "";
    state.msgs.forEach(renderMsg);
  }

  function renderChips() {
    if (!chipsBox || chipsBox.childElementCount) return;
    CHIPS.forEach(function (c) {
      var b = d.createElement("button");
      b.type = "button";
      b.textContent = c[0];
      b.setAttribute("aria-label", "Ask: " + c[1]);
      b.addEventListener("click", function () { ask(c[1], "chip"); });
      chipsBox.appendChild(b);
    });
  }

  function showTyping() {
    var t = d.createElement("div");
    t.className = "msg msg-bot typing";
    t.setAttribute("role", "status");
    t.setAttribute("aria-label", "LD Assist is typing");
    t.innerHTML = "<i></i><i></i><i></i>";
    log.appendChild(t);
    scrollDown();
    return t;
  }

  /* ---------- Open / close ---------- */

  function isOpen() { return !panel.hidden; }

  function open(focus) {
    renderAll();
    renderChips();
    if (!state.msgs.length) push(WELCOME);
    panel.hidden = false;
    root.classList.add("is-open");
    if (launcher) launcher.setAttribute("aria-expanded", "true");
    scrollDown();
    if (focus !== false) setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); } }, 30);
  }

  function close() {
    panel.hidden = true;
    root.classList.remove("is-open");
    if (launcher) { launcher.setAttribute("aria-expanded", "false"); launcher.focus(); }
  }

  /* ---------- Answering ---------- */

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function lastUserText() {
    for (var i = state.msgs.length - 1; i >= 0; i--) if (state.msgs[i].who === "user") return state.msgs[i].text;
    return "";
  }

  function history() {
    var h = state.msgs.filter(function (m) { return !m.welcome; }).map(function (m) {
      return m.who === "user"
        ? { role: "user", content: String(m.text).slice(0, 1000) }
        : { role: "assistant", content: (m.text || stripHtml(m.html)).slice(0, 1000) };
    }).slice(-8);
    while (h.length && h[0].role !== "user") h.shift();
    return h;
  }

  function withGlmis(links, q) {
    links = (links || []).slice();
    if (JOB_RE.test(q) && !links.some(function (l) { return isGlmis(l.href); })) {
      links.unshift({ href: GLMIS_URL, label: "Search jobs on GLMIS", glmis: true });
    }
    return links.slice(0, 4);
  }

  function askAI(msgs) {
    if (aiOff || typeof fetch !== "function") return Promise.resolve(null);
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 12000);
    return fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      if (res.status === 429) return null; // busy: local answer this time only
      if (!res.ok) throw new Error("status " + res.status);
      return res.json().then(function (j) {
        if (!j || typeof j.reply !== "string" || !j.reply.trim()) throw new Error("bad body");
        return j.reply;
      });
    }).catch(function () {
      aiOff = true; // static host, disabled or failing backend: use local engine for the session
      ssSet(AI_KEY, "1");
      return null;
    }).then(function (r) { clearTimeout(timer); return r; });
  }

  function answer(q, source) {
    var prev = lastUserText();
    push({ who: "user", text: q });
    if (SAFETY_RE.test(q) || HUMAN_RE.test(q)) {
      var script = SAFETY_RE.test(q) ? SAFETY : HANDOVER;
      return sleep(350).then(function () {
        push({ who: "bot", html: script.html, links: script.links, src: "script" });
        track({ event: "chat_question", chat_intent: script === SAFETY ? "safety_script" : "handover", chat_trigger: source || "typed" });
      });
    }
    var local = match(q, prev);
    var started = Date.now();
    var minDelay = 400 + Math.floor(Math.random() * 300);
    var typing = showTyping();

    return askAI(history()).then(function (reply) {
      var wait = minDelay - (Date.now() - started);
      return (wait > 0 ? sleep(wait) : Promise.resolve()).then(function () {
        typing.remove();
        var msg;
        if (reply) {
          var related = local.id !== "fallback" && !SMALL_TALK[local.id] ? local.intent.links : [];
          msg = { who: "bot", html: mdToHtml(reply), text: reply.slice(0, 1000), links: withGlmis(related, q), src: "ai" };
        } else {
          var it = local.intent;
          misses = local.id === "fallback" ? misses + 1 : 0;
          if (misses >= 2) { misses = 0; it = { a: "<p>Sorry, I'm still not getting it.</p>" + HANDOVER.html, links: HANDOVER.links }; }
          msg = { who: "bot", html: it.a, links: withGlmis(it.links, q), src: "local" };
        }
        push(msg);
        track({ event: "chat_question", chat_intent: local.id, chat_source: msg.src, chat_trigger: source || "typed", chat_score: local.score });
      });
    }).catch(function () {
      typing.remove();
      push({ who: "bot", html: (w.LD_KB_FALLBACK || {}).a || "<p>Sorry, something went wrong.</p>", links: (w.LD_KB_FALLBACK || {}).links || [] });
    });
  }

  function ask(q, source) {
    q = String(q || "").replace(/\s+/g, " ").trim().slice(0, 500);
    if (!q) return;
    if (!isOpen()) open(source === "typed");
    queue = queue.then(function () { return answer(q, source); });
    return queue;
  }

  /* ---------- Events ---------- */

  if (launcher) launcher.addEventListener("click", function () { isOpen() ? close() : open(); });
  if (closeBtn) closeBtn.addEventListener("click", close);

  panel.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Esc") { e.preventDefault(); close(); }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = input.value;
    input.value = "";
    ask(q, "typed");
  });

  log.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (a && isGlmis(a.getAttribute("href") || "")) {
      track({ event: "glmis_click_chat", link_url: a.href, link_text: (a.textContent || "").trim() });
    }
  });

  d.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-chat-ask]");
    if (!el) return;
    e.preventDefault();
    var q = el.getAttribute("data-chat-ask") || el.textContent;
    open();
    ask(q, "page");
  });

  Array.prototype.forEach.call(d.querySelectorAll("[data-ask-form]"), function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var field = f.querySelector('[name="q"]');
      var q = field ? field.value : "";
      if (!q.trim()) { if (field) field.focus(); return; }
      if (field) field.value = "";
      open();
      ask(q, "hero");
    });
  });

  // Restore an open conversation after navigation within the session.
  if (state.msgs.length) renderAll();
})(window, document);
