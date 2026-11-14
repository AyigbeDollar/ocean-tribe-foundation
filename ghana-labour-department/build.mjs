// Static site builder for the Ghana Labour Department website (Node 18+).
//   npm install && node build.mjs
// Officers edit everything under content/ through the CMS at /admin (Decap CMS):
// - content/blog/*.md        -> dist/blog/<slug>.html (+ /blog index, rss.xml, feed.json, social-kit)
// - content/settings.json    -> contacts, social links, minimum wage figures used across pages
// - content/announcement.json-> optional site-wide notice bar
// - content/leadership.json  -> Chief Labour Officer name, photo and profile
// - content/faqs.json        -> the FAQ page and its structured data
// - content/chatbot.json     -> Kojo answers (dist/js/knowledge.js) and the AI fact sheet
// - src/pages/*.html         -> page layouts; src/layout.html is the shared shell
// - static/                  -> copied as-is; remote-assets.json photos fetched when not stored locally
import { readFileSync, writeFileSync, readdirSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { marked } from "marked";
import YAML from "yaml";

const root = dirname(fileURLToPath(import.meta.url));
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const config = readJson("content/settings.json");
const leadership = readJson("content/leadership.json");
const announcement = readJson("content/announcement.json");
const faqs = readJson("content/faqs.json");
const chatbot = readJson("content/chatbot.json");
const officesData = existsSync(join(root, "content/offices.json")) ? readJson("content/offices.json") : { offices: [] };
marked.setOptions({ gfm: true, breaks: false });
const md = (s = "") => marked.parse(String(s));
const mdInline = (s = "") => marked.parseInline(String(s));
const SITE = (process.env.SITE_URL || config.siteUrl).replace(/\/$/, "");
const out = join(root, "dist");
const layout = readFileSync(join(root, "src/layout.html"), "utf8");
const today = new Date().toISOString().slice(0, 10);
const HASHTAG = config.hashtag || "#GhanaLabourDepartment";

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(root, "static"), out, { recursive: true });

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Version the icon sprite URL so browsers fetch new icons as soon as the sprite changes.
const ICONS_V = createHash("sha1").update(readFileSync(join(root, "static/img/icons.svg"))).digest("hex").slice(0, 8);
const icon = (id, size = 20) => `<svg width="${size}" height="${size}" aria-hidden="true"><use href="/img/icons.svg#${id}"/></svg>`;
const fmtDate = (iso) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const readMeta = (raw, file) => {
  const m = raw.match(/^<!--meta\s*([\s\S]*?)-->/);
  if (!m) throw new Error(`Missing <!--meta {...}--> header in ${file}`);
  return { meta: JSON.parse(m[1]), body: raw.slice(m[0].length).trim() };
};
const REMOTE_ASSETS = new Set(existsSync(join(root, "remote-assets.json")) ? Object.keys(readJson("remote-assets.json")) : []);
const W = config.minimumWage || {};
const TOKENS = {
  "{{minWage}}": W.amount, "{{minWageYear}}": W.year, "{{minWageEffective}}": W.effective,
  "{{prevMinWage}}": W.previousAmount, "{{prevMinWageYear}}": W.previousYear, "{{minWageIncrease}}": W.increase,
  "{{officeHours}}": config.officeHours,
  ...Object.fromEntries(Object.entries(config.glmisLinks || {}).map(([k, v]) => [`{{glmis.${k}}}`, v])), "{{prEmail}}": config.prEmail,
  "{{cloName}}": esc(leadership.name), "{{cloTitle}}": esc(leadership.title),
  "{{cloPhoto}}": esc(leadership.photo || "/img/chief-labour-officer-placeholder.svg"), "{{cloPhotoAlt}}": esc(leadership.photoAlt || leadership.name),
  "{{cloIntro}}": esc(leadership.homeIntro), "{{cloBio}}": md(leadership.bio),
};
const applyTokens = (s) => Object.entries(TOKENS).reduce((acc, [k, v]) => acc.replaceAll(k, v ?? ""), s);
const utm = (url, source, campaign) => `${url}${url.includes("?") ? "&" : "?"}utm_source=${source}&utm_medium=social&utm_campaign=${campaign}`;

// ---------- Social profiles (only configured ones are shown) ----------
const SOCIAL = [
  ["facebook", "Facebook", "facebook"],
  ["x", "X", "xlogo"],
  ["linkedin", "LinkedIn", "linkedin"],
  ["instagram", "Instagram", "instagram"],
  ["tiktok", "TikTok", "tiktok"],
  ["youtube", "YouTube", "youtube"],
  ["whatsappChannel", "WhatsApp Channel", "whatsapp"],
].filter(([k]) => config.social?.[k]);
const footerSocial = SOCIAL.length
  ? `<div class="footer-social" aria-label="Follow us">${SOCIAL.map(([k, label, ic]) => `<a href="${esc(config.social[k])}" target="_blank" rel="noopener" aria-label="${label}" data-track="follow_${k}">${icon(ic)}</a>`).join("")}</div>`
  : "";
const followLinks = SOCIAL.length
  ? `<ul class="social-links">${SOCIAL.map(([k, label, ic]) => `<li><a class="brand-${ic}" href="${esc(config.social[k])}" target="_blank" rel="noopener" data-track="follow_${k}">${icon(ic)}${label}</a></li>`).join("")}</ul>`
  : `<ul class="social-links"><li><a href="/rss.xml">${icon("rss")}Blog RSS feed</a></li><li><a href="/blog">${icon("book")}News and guides</a></li></ul>`;
const sameAs = SOCIAL.length ? `,\n    "sameAs": ${JSON.stringify(SOCIAL.map(([k]) => config.social[k]))}` : "";

// ---------- Analytics: set analyticsId in content/settings.json (CMS: Site content) to "GTM-XXXX" or "G-XXXX" ----------
const AID = (config.analyticsId || "").trim();
const analyticsHead = /^GTM-[A-Z0-9]+$/.test(AID)
  ? `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${AID}');</script>`
  : /^G-[A-Z0-9]+$/.test(AID)
  ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${AID}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${AID}');</script>`
  : "";

// ---------- Share bar (UTM-tagged so traffic from each platform is measurable) ----------
const SITE_HOST = SITE.replace(/^https?:\/\//, "").replace(/\/$/, "");
let shareCount = 0;
function shareBar(url, text, campaign, o = {}) {
  const t = encodeURIComponent(text);
  const u = (s) => encodeURIComponent(utm(url, s, campaign));
  const id = `share-link-${++shareCount}`;
  const display = url.replace(/^https?:\/\//, "");
  const heading = o.heading || "Know someone looking for work?";
  const sub = o.sub || "Most people hear about jobs from friends and family. Send this in one tap. Our help is free and we never charge for jobs.";
  const tile = (cls, href, track, ic, name, note) =>
    `<li><a class="share-tile ${cls}" href="${href}" target="_blank" rel="noopener" data-track="${track}"><span class="st-icon">${icon(ic, 22)}</span><span class="st-text"><strong>${name}</strong><small>${note}</small></span></a></li>`;
  return `<div class="share-card reveal" data-share data-url="${esc(utm(url, "copy", campaign))}" data-title="${esc(text)}">
  <div class="share-story">
    <p class="share-kicker">${icon("share", 16)}Pass it on</p>
    <h3>${esc(heading)}</h3>
    <p>${esc(sub)}</p>
    <figure class="share-preview" aria-label="Preview of the message your friend will receive">
      <div class="sp-screen">
        <div class="sp-bar"><span class="sp-avatar">${icon("user", 16)}</span><span><strong>Your friend</strong><small>online</small></span></div>
        <div class="sp-bubble">
          <div class="sp-link"><img src="${esc(o.image || "/img/og-image.png")}" alt="" width="1200" height="630" loading="lazy"><div><strong>${esc(o.previewTitle || text)}</strong><small>${esc(SITE_HOST)}</small></div></div>
          <p>${esc(text)} <span class="sp-url">${esc(display)}</span></p>
          <span class="sp-meta">Now <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true"><path d="M1 5l3 3 6-7M6 8l1 1 6-8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        </div>
      </div>
    </figure>
  </div>
  <div class="share-actions">
    <p class="share-label">Choose where to share</p>
    <ul class="share-grid">
      ${tile("t-wa", `https://wa.me/?text=${t}%20${u("whatsapp")}`, "share_whatsapp", "whatsapp", "WhatsApp", "Family, friends and groups")}
      ${tile("t-fb", `https://www.facebook.com/sharer/sharer.php?u=${u("facebook")}`, "share_facebook", "facebook", "Facebook", "Your community")}
      ${tile("t-x", `https://twitter.com/intent/tweet?text=${t}&amp;url=${u("x")}&amp;hashtags=${HASHTAG.slice(1)}`, "share_x", "xlogo", "X", "Post to followers")}
      ${tile("t-in", `https://www.linkedin.com/sharing/share-offsite/?url=${u("linkedin")}`, "share_linkedin", "linkedin", "LinkedIn", "Professional network")}
      ${tile("t-sms", `sms:?&amp;body=${t}%20${u("sms")}`, "share_sms", "chat", "Text message", "Works on any phone")}
      ${tile("t-mail", `mailto:?subject=${t}&amp;body=${t}%0A%0A${u("email")}`, "share_email", "mail", "Email", "Send to anyone")}
      <li class="st-more" hidden><button class="share-tile t-more" type="button" data-native-share><span class="st-icon">${icon("share", 22)}</span><span class="st-text"><strong>More apps</strong><small>Telegram, Instagram and others</small></span></button></li>
    </ul>
    <div class="share-copy">
      <label for="${id}">Or copy the link</label>
      <div class="share-field"><input id="${id}" type="text" readonly value="${esc(display)}"><button type="button" data-copy-link>${icon("copy", 18)}<span>Copy</span></button></div>
    </div>
  </div>
</div>`;
}

// ---------- Blog posts ----------
const blogDir = join(root, "content/blog");
const posts = (existsSync(blogDir) ? readdirSync(blogDir).filter((f) => f.endsWith(".md")) : [])
  .map((file) => {
    const raw = readFileSync(join(blogDir, file), "utf8");
    const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
    if (!m) throw new Error(`Missing front matter in content/blog/${file}`);
    const meta = YAML.parse(m[1]) || {};
    const slug = file.replace(/\.md$/, "");
    const body = applyTokens(md(raw.slice(m[0].length)));
    const words = body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    const date = String(meta.date || today).slice(0, 10);
    const reviewed = meta.reviewed ? String(meta.reviewed).slice(0, 10) : "";
    const og = existsSync(join(root, "static/img/og", `${slug}.png`)) ? `/img/og/${slug}.png` : meta.shareImage || meta.image || "/img/og-image.png";
    return { ...meta, date, reviewed, faq: meta.faq || [], related: meta.related || [], social: meta.social || {}, slug, body, url: `${SITE}/blog/${slug}`, path: `/blog/${slug}`, mins: Math.max(2, Math.round(words / 200)), words, og };
  })
  .filter((p) => !p.draft && p.date <= today)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
const bySlug = Object.fromEntries(posts.map((p) => [p.slug, p]));

const postCard = (p, featured = false) => `<a class="post-card reveal${featured ? " is-featured" : ""}" href="${p.path}" data-pillar="${esc(p.pillar)}">
  <div class="thumb"><img src="${p.image || p.og}" alt="" width="1200" height="630" loading="lazy"></div>
  <div class="body">
    <span class="post-meta">${esc(p.pillar)} &middot; ${p.mins} min read</span>
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.standfirst)}</p>
  </div>
</a>`;
const latestPosts = posts.length
  ? `<div class="post-grid">${posts.slice(0, 3).map((p) => postCard(p)).join("\n")}</div>`
  : "";

// ---------- Announcement bar (content/announcement.json) ----------
const annLive = announcement.enabled && announcement.text && (!announcement.expires || String(announcement.expires).slice(0, 10) >= today);
const announcementBar = annLive
  ? `<div class="announce announce-${esc(announcement.style || "info")}" role="status"><div class="container"><p>${mdInline(announcement.text)}${announcement.linkUrl ? ` <a href="${esc(announcement.linkUrl)}">${esc(announcement.linkLabel || "Read more")}</a>` : ""}</p></div></div>`
  : "";

// ---------- FAQ page (content/faqs.json) ----------
const faqGroups = (faqs.groups || []).map((g, gi) => `<div class="faq-group reveal">
      <h2${gi === 0 ? ' style="margin-top:0"' : ""}>${esc(g.title)}</h2>
      <div class="faq">
${(g.items || []).map((it) => `        <details><summary>${esc(applyTokens(it.q))}</summary><div class="faq-a">${applyTokens(mdInline(it.a))}</div></details>`).join("\n")}
      </div>
    </div>`).join("\n    ");
const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: (faqs.groups || []).flatMap((g) => g.items || []).map((it) => ({ "@type": "Question", name: applyTokens(it.q), acceptedAnswer: { "@type": "Answer", text: applyTokens(it.a).replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "") } })) };

// ---------- Page renderer ----------
const NAV = [
  ["/about", "About"], ["/services", "Services"], ["/workers-rights", "Workers' Rights"],
  ["/employers", "Employers"], ["/glmis", "GLMIS Jobs"], ["/offices", "Offices"], ["/blog", "Blog"], ["/contact", "Contact"],
];
const urls = [];

// ---------- "First pick" newsletter signup (posts to /api/subscribe) ----------
const NL_REGIONS = ["Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra", "North East", "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta", "Western", "Western North"];
const NL_INTERESTS = [["jobs", "New vacancies"], ["job-fairs", "Job fairs and recruitment drives"], ["training", "Free training and skills programmes"], ["work-abroad", "Safe work abroad and scam alerts"], ["rights", "Rights at work updates"]];
let nlCount = 0;
function newsletterForm(variant, source) {
  const id = `nl-${++nlCount}`;
  const full = variant === "full" || variant === "band";
  const region = `<label class="nl-field"><span>Your region</span><select name="region"><option value="">Choose your region</option>${NL_REGIONS.map((r) => `<option>${r}</option>`).join("")}</select></label>`;
  const interests = full ? `<fieldset class="nl-interests"><legend>Send me</legend>${NL_INTERESTS.map(([v, l]) => `<label><input type="checkbox" name="interests" value="${v}" checked><span>${l}</span></label>`).join("")}</fieldset>` : "";
  return `<form class="nl-form nl-${variant}" data-newsletter data-source="${esc(source)}" novalidate>
  <div class="nl-row">
    <label class="nl-field nl-contact"><span>WhatsApp number or email</span><input name="contact" type="text" inputmode="email" autocomplete="email" placeholder="024 123 4567 or you@example.com" required aria-describedby="${id}-err"></label>
    ${full ? `<label class="nl-field"><span>First name <em>(optional)</em></span><input name="name" type="text" autocomplete="given-name" maxlength="80"></label>` : ""}
    ${region}
  </div>
  ${interests}
  <label class="nl-consent"><input type="checkbox" name="consent" required><span>Yes, send me new jobs and opportunities from the Ghana Labour Department. I can unsubscribe at any time. <a href="/privacy#newsletter">How we use your details</a>.</span></label>
  <div class="nl-hp" aria-hidden="true"><label>Leave this empty<input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>
  <button class="btn btn-yellow nl-submit" type="submit">${icon("bell", 18)}<span>Get first pick</span></button>
  <p class="nl-msg" id="${id}-err" role="status" aria-live="polite"></p>
</form>`;
}
const NL_BENEFITS = [["briefcase", "New vacancies", "Fresh jobs from GLMIS and our Public Employment Centres, every week."], ["calendar", "Job fairs near you", "Recruitment drives and the JOBS roadshow in your region."], ["student", "Free training", "Skills programmes, apprenticeships and internships."], ["shield", "Scam alerts", "Fake recruiters and visa scams to avoid. We never charge for jobs."]];
const newsletterBand = (source) => `<section class="section nl-section" aria-labelledby="nl-title-${source}">
  <div class="container">
    <div class="nl-card reveal">
      <div class="nl-pitch">
        <p class="nl-kicker">${icon("bell", 16)}Free job alerts</p>
        <h2 id="nl-title-${source}">Get first pick of new jobs and opportunities</h2>
        <p>Be among the first to hear about new vacancies, job fairs and free training in your region. Straight to your WhatsApp or email. No spam, and you can stop any time.</p>
        <ul class="nl-benefits">${NL_BENEFITS.map(([ic, h, t]) => `<li>${icon(ic, 22)}<span><strong>${h}</strong>${t}</span></li>`).join("")}</ul>
      </div>
      <div class="nl-signup">${newsletterForm("band", source)}</div>
    </div>
  </div>
</section>`;

function render({ meta, body, path, outFile }) {
  const canonical = SITE + (path === "/" ? "/" : path);
  const section = "/" + path.split("/")[1];
  const nav = NAV.map(([href, label]) => `<li><a href="${href}"${href === section || href === path ? ' aria-current="page"' : ""}>${label}</a></li>`).join("");
  const noindex = meta.noindex || path === "/404";
  const crumbs = path !== "/" && !noindex
    ? `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
          ...(meta.parent ? [{ "@type": "ListItem", position: 2, name: meta.parent[1], item: SITE + meta.parent[0] }] : []),
          { "@type": "ListItem", position: meta.parent ? 3 : 2, name: meta.crumb || meta.title.split("|")[0].trim(), item: canonical },
        ],
      })}</script>`
    : "";
  const ld = (meta.jsonld || []).map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n");
  const html = applyTokens(layout
    .replaceAll("{{title}}", esc(meta.title))
    .replaceAll("{{description}}", esc(meta.description))
    .replaceAll("{{canonical}}", canonical)
    .replaceAll("{{site}}", SITE)
    .replaceAll("{{ogType}}", meta.ogType || "website")
    .replaceAll("{{ogImage}}", SITE + (meta.ogImage || "/img/og-image.png"))
    .replaceAll("{{robots}}", noindex ? "noindex, follow" : "index, follow, max-image-preview:large")
    .replaceAll("{{bodyClass}}", meta.bodyClass || "")
    .replaceAll("{{glmisUrl}}", config.glmisUrl)
    .replaceAll("{{email}}", config.email)
    .replace("{{sameAs}}", sameAs)
    .replace("{{footerSocial}}", footerSocial)
    .replace("{{nav}}", nav)
    .replace("{{jsonld}}", crumbs + "\n" + ld)
    .replace("{{head}}", analyticsHead + (meta.head || ""))
    .replace("{{content}}", applyTokens(body)
      .replace("<!--latest-posts-->", latestPosts)
      .replace("<!--follow-links-->", followLinks)
      .replace("<!--share-site-->", shareBar(SITE + path, meta.shareText || meta.title, "site" + (path === "/" ? "-home" : path.replace(/\//g, "-"))))
      .replace("<!--faq-groups-->", faqGroups)
      .replace("<!--office-finder-->", officeFinder)
      .replace("<!--newsletter-->", newsletterBand(path === "/" ? "home" : path.replace(/\W+/g, "") || "page"))
      .replace("<!--newsletter-full-->", newsletterForm("full", "subscribe-page")))
    .replaceAll("{{year}}", String(new Date().getFullYear()))
    .replace("<!--announcement-->", announcementBar)
    .replace("<!--newsletter-footer-->", newsletterForm("compact", "footer")));
  mkdirSync(dirname(join(out, outFile)), { recursive: true });
  writeFileSync(join(out, outFile), html.replaceAll("/img/icons.svg#", `/img/icons.svg?v=${ICONS_V}#`));
  if (!noindex) urls.push({ loc: canonical, lastmod: meta.reviewed || meta.date || today, priority: meta.priority || (path === "/" ? "1.0" : "0.8") });
}

// ---------- Office finder (content/offices.json -> /offices) ----------
const OFFICE_TYPES = {
  head: { label: "Head Office", short: "Head Office" },
  regional: { label: "Regional office", short: "Regional" },
  district: { label: "District or municipal office", short: "District" },
  pec: { label: "Public Employment Centre", short: "PEC" },
  "office-pec": { label: "Office and Public Employment Centre", short: "Office + PEC" },
};
const slugify = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const TOLL = (config.tollFree && config.tollFree[0]) || "0800 600 300";
const offices = (officesData.offices || []).map((o, i) => {
  const phone = (o.phone || "").trim();
  const email = (o.email || "").trim();
  const query = o.address ? `${o.address}, ${o.town}, Ghana` : `Labour Department ${o.name.replace(/\s*\(.*\)/, "")}, ${o.town}, Ghana`;
  return { ...o, id: `office-${slugify(o.name)}-${i}`, phoneShown: phone || TOLL, tel: (phone || TOLL).replace(/[^0-9+]/g, ""),
    emailShown: email || config.email, hasOwnPhone: !!phone, hasOwnEmail: !!email,
    maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` };
});
const REGIONS = [...new Set(offices.map((o) => o.region))].sort();
const officeCount = offices.filter((o) => o.type !== "head").length;
const pecCount = offices.filter((o) => o.type === "pec" || o.type === "office-pec" || /PEC/.test(o.name)).length;
const officeCard = (o) => {
  const t = OFFICE_TYPES[o.type] || OFFICE_TYPES.district;
  const waText = encodeURIComponent(`${o.name}, ${o.town} (${o.region} Region). Ghana Labour Department. Call ${o.phoneShown}. Directions: ${o.maps}`);
  const mailHref = `mailto:${o.emailShown}?subject=${encodeURIComponent(`Enquiry for ${o.name}, ${o.town}`)}`;
  return `<li class="office-card" id="${o.id}" data-type="${o.type}" data-region="${esc(o.region)}" data-town="${esc(o.town)}" data-search="${esc((o.name + " " + o.town + " " + o.region + " " + (o.address || "")).toLowerCase())}" data-lat="${o.lat}" data-lng="${o.lng}">
  <div class="oc-head">
    <span class="oc-badge t-${o.type}">${t.short}</span>
    <h3>${esc(o.name)}</h3>
    <p class="oc-loc">${icon("pin", 16)}${esc(o.address ? `${o.address}, ${o.town}` : o.town)} <span>&middot; ${esc(o.region)} Region</span><span class="oc-dist" hidden></span></p>
    <p class="oc-phone">${icon("phone", 16)}${o.hasOwnPhone ? esc(o.phoneShown) : `Toll-free ${esc(o.phoneShown)}`}${o.note ? ` <span class="muted">&middot; ${esc(o.note)}</span>` : ""}</p>
  </div>
  <div class="oc-actions">
    <a class="oc-btn oc-call" href="tel:${o.tel}" data-track="office_call" aria-label="Call ${esc(o.name)}">${icon("phone", 18)}<span>Call</span></a>
    <a class="oc-btn oc-dir" href="${o.maps}" target="_blank" rel="noopener" data-track="office_directions" aria-label="Directions to ${esc(o.name)}">${icon("pin", 18)}<span>Directions</span></a>
    <a class="oc-btn oc-mail" href="${mailHref}" data-track="office_email" aria-label="Email about ${esc(o.name)}">${icon("mail", 18)}<span>Email</span></a>
    <a class="oc-btn oc-wa" href="https://wa.me/?text=${waText}" target="_blank" rel="noopener" data-track="office_share" aria-label="Share ${esc(o.name)} on WhatsApp">${icon("whatsapp", 18)}<span>Share</span></a>
    <button class="oc-btn oc-map" type="button" data-show-on-map aria-label="Show ${esc(o.name)} on the map">${icon("globe", 18)}<span>Map</span></button>
  </div>
</li>`;
};
const officeFinder = `<div class="office-finder" data-office-finder>
  <div class="of-controls" role="search" aria-label="Find a Labour Department office">
    <label class="of-search"><span class="sr-only">Search by town, district or office</span>${icon("search", 20)}<input type="search" placeholder="Search by town, district or office" autocomplete="off" data-of-search></label>
    <label class="of-select"><span class="sr-only">Region</span><select data-of-region><option value="">All 16 regions</option>${REGIONS.map((r) => `<option value="${esc(r)}">${esc(r)}</option>`).join("")}</select></label>
    <button class="btn btn-yellow of-near" type="button" data-of-near>${icon("pin", 18)}Find my nearest office</button>
  </div>
  <div class="of-types" role="group" aria-label="Filter by type of office">
    <button type="button" aria-pressed="true" data-of-type="all">All offices</button>
    <button type="button" aria-pressed="false" data-of-type="pec"><i class="dot t-pec"></i>Public Employment Centres</button>
    <button type="button" aria-pressed="false" data-of-type="district"><i class="dot t-district"></i>District and municipal</button>
    <button type="button" aria-pressed="false" data-of-type="regional"><i class="dot t-regional"></i>Regional and head office</button>
  </div>
  <p class="of-count" aria-live="polite" data-of-count>Showing all ${offices.length} offices</p>
  <div class="of-layout">
    <div class="of-map-wrap"><div class="of-map" data-of-map role="region" aria-label="Map of Labour Department offices"><p class="of-map-msg">Loading the map&hellip;</p></div></div>
    <ul class="of-list" data-of-list>
${offices.map(officeCard).join("\n")}
    </ul>
  </div>
  <p class="of-empty" hidden data-of-empty>No office matches your search. Try another town or <a href="/offices">show all offices</a>, or call us free on ${esc(TOLL)}.</p>
  <script type="application/json" id="offices-data">${JSON.stringify(offices.map((o) => ({ id: o.id, n: o.name, t: o.type, town: o.town, r: o.region, lat: o.lat, lng: o.lng, tel: o.tel, ph: o.phoneShown, maps: o.maps })))}</script>
</div>`;
const officesLd = { "@context": "https://schema.org", "@type": "ItemList", name: "Ghana Labour Department offices", numberOfItems: offices.length,
  itemListElement: offices.map((o, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "GovernmentOffice", name: `${o.name}, Ghana Labour Department`,
    address: { "@type": "PostalAddress", addressLocality: o.town, addressRegion: `${o.region} Region`, addressCountry: "GH", ...(o.address ? { streetAddress: o.address } : {}) },
    geo: { "@type": "GeoCoordinates", latitude: o.lat, longitude: o.lng }, telephone: o.phoneShown, ...(o.hasOwnEmail ? { email: o.emailShown } : {}),
    parentOrganization: { "@id": `${SITE}/#organization` } } })) };
TOKENS["{{officeCount}}"] = String(officeCount);
TOKENS["{{pecCount}}"] = String(pecCount);
TOKENS["{{regionCount}}"] = String(REGIONS.length);

// Static pages
for (const file of readdirSync(join(root, "src/pages")).filter((f) => f.endsWith(".html"))) {
  const { meta, body } = readMeta(readFileSync(join(root, "src/pages", file), "utf8"), file);
  const slug = file === "index.html" ? "" : file.replace(/\.html$/, "");
  if (body.includes("<!--faq-groups-->")) meta.jsonld = [...(meta.jsonld || []), faqLd];
  if (body.includes("<!--office-finder-->")) meta.jsonld = [...(meta.jsonld || []), officesLd];
  render({ meta, body, path: slug ? `/${slug}` : "/", outFile: file });
}

// Blog index
if (posts.length) {
  const pillars = [...new Set(posts.map((p) => p.pillar))];
  render({
    path: "/blog",
    outFile: "blog.html",
    meta: {
      title: "News and Guides | Ghana Labour Department",
      description: "Plain-language guides and news from the Ghana Labour Department: finding work on GLMIS, your rights at work and how to avoid job scams.",
      crumb: "Blog",
      jsonld: [{ "@context": "https://schema.org", "@type": "Blog", name: "Ghana Labour Department news and guides", url: `${SITE}/blog`,
        blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: p.url, datePublished: p.date })) }],
    },
    body: `<section class="page-hero">
  <div class="container hero-anim">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Blog</nav>
    <h1>News and guides</h1>
    <p>Plain-language help on finding work, your rights at work and what the Department is doing in your region.</p>
  </div>
</section>
<section class="section">
  <div class="container">
    <h2 class="sr-only">All posts</h2>
    <div class="blog-filters" role="group" aria-label="Filter posts by topic">
      <button type="button" aria-pressed="true" data-filter="all">All posts</button>
      ${pillars.map((p) => `<button type="button" aria-pressed="false" data-filter="${esc(p)}">${esc(p)}</button>`).join("\n      ")}
    </div>
    <div class="post-grid" data-post-grid>
${posts.map((p, i) => postCard(p, i === 0)).join("\n")}
    </div>
  </div>
</section>
${newsletterBand("blog")}
<section class="section section-alt">
  <div class="container">
    <div class="share-head reveal">
      <div>
        <h2>Never miss an update</h2>
        <p class="lead">Follow the Department for vacancies, job fairs and rights education, or subscribe to the blog feed.</p>
      </div>
      <!--follow-links-->
    </div>
    ${shareBar(`${SITE}/blog/${posts.find((p) => p.pillar === "Find work")?.slug || posts[0].slug}`, "Free help to find work in Ghana from the Labour Department", "blog-index", { heading: "Share with someone looking for work", sub: "Forward our free job guide to your family and WhatsApp groups. It could be the start of someone's next job.", image: `/img/og/${posts.find((p) => p.pillar === "Find work")?.slug || posts[0].slug}.png`, previewTitle: posts.find((p) => p.pillar === "Find work")?.title || posts[0].title })}
  </div>
</section>`,
  });
}

// Blog posts
const CTA = {
  "Find work": { h: "Ready to find work?", p: "Create your free GLMIS profile, or visit your nearest Public Employment Centre for help.", btn: `<a class="btn btn-yellow" href="${config.glmisLinks.register}" target="_blank" rel="noopener" data-track="glmis_post_cta">Register on GLMIS</a><a class="btn btn-light" href="/contact">Find a PEC</a>` },
  "Know your rights": { h: "Need help with a workplace issue?", p: "Report it to your nearest Labour Department office. Our help is free. Call 0800 600 300 or ask Kojo.", btn: `<a class="btn btn-red" href="/services#complaints">Report an issue</a><button class="btn btn-light" type="button" data-chat-ask="I have a problem at work. What should I do?">Ask Kojo</button>` },
};
for (const p of posts) {
  const cta = CTA[p.pillar] || CTA["Find work"];
  const related = (p.related || []).map((s) => bySlug[s]).filter(Boolean).concat(posts.filter((x) => x.slug !== p.slug && !(p.related || []).includes(x.slug))).slice(0, 2);
  const faq = p.faq?.length
    ? `<h2>Frequently asked questions</h2><div class="faq">${p.faq.map((f) => `<details><summary>${esc(f.q)}</summary><div class="faq-a">${esc(f.a)}</div></details>`).join("")}</div>`
    : "";
  const shareText = p.social?.x || p.title;
  render({
    path: p.path,
    outFile: `blog/${p.slug}.html`,
    meta: {
      title: p.seoTitle || (p.title.length + 26 <= 65 ? `${p.title} | Ghana Labour Department` : p.title),
      description: p.description,
      crumb: p.title,
      parent: ["/blog", "Blog"],
      ogType: "article",
      ogImage: p.og,
      reviewed: p.reviewed,
      priority: "0.7",
      head: `<meta property="article:published_time" content="${p.date}"><meta property="article:modified_time" content="${p.reviewed || p.date}"><meta property="article:section" content="${esc(p.pillar)}">`,
      jsonld: [
        { "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, description: p.description, image: SITE + p.og,
          datePublished: p.date, dateModified: p.reviewed || p.date, inLanguage: "en-GH", mainEntityOfPage: p.url, wordCount: p.words,
          author: { "@type": "Organization", name: `${p.author}, Ghana Labour Department` },
          publisher: { "@type": "GovernmentOrganization", name: "Ghana Labour Department", logo: { "@type": "ImageObject", url: `${SITE}/img/logo-512.png` } } },
        ...(p.faq?.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: p.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
      ],
    },
    body: `<section class="page-hero">
  <div class="container hero-anim">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog">Blog</a></nav>
    <span class="tag-pill">${esc(p.pillar)} &middot; ${p.mins} min read</span>
    <h1>${esc(p.title)}</h1>
  </div>
</section>
<section class="section">
  <div class="container article">
    <article>
      <p class="standfirst">${esc(p.standfirst)}</p>
      <p class="byline">By ${esc(p.author)} &middot; ${fmtDate(p.date)}${p.reviewed ? ` &middot; Last reviewed ${fmtDate(p.reviewed)}` : ""}</p>
      ${p.image && (existsSync(join(root, "static", p.image)) || REMOTE_ASSETS.has(p.image.replace(/^\//, ""))) ? `<figure class="hero-img"><img src="${p.image}" alt="${esc(p.imageAlt || "")}" width="1200" height="630"></figure>` : ""}
      <div class="article-body prose">
${p.body}
      </div>
      ${p.legal ? `<p class="legal-box" style="margin-top:28px"><strong>Legal basis:</strong> ${esc(p.legal)}</p>` : ""}
      <div class="prose" style="margin-top:28px">${faq}</div>
      <div class="post-share">${shareBar(p.url, shareText, `blog-${p.slug}`, { heading: "Found this useful? Share it.", sub: "Someone you know may need this today. Send it to them in one tap.", image: p.og, previewTitle: p.title })}</div>
    </article>
    <aside class="article-aside" aria-label="Related actions">
      <div class="aside-card glmis">
        <h2>Looking for work?</h2>
        <p>Register free on the Ghana Labour Market Information System and get matched to vacancies.</p>
        <a class="btn btn-yellow btn-sm" href="${config.glmisLinks.register}" target="_blank" rel="noopener" data-track="glmis_post_aside">Register on GLMIS</a>
      </div>
      <div class="aside-card nl-aside">
        <h2>Get first pick of new jobs</h2>
        <p>New vacancies, job fairs and free training, sent to your WhatsApp or email.</p>
        ${newsletterForm("compact", `post-${p.slug}`)}
      </div>
      <div class="aside-card">
        <h2>Have a question?</h2>
        <p>Kojo answers common questions any time. You can also call free on 0800 600 300.</p>
        <button class="btn btn-primary btn-sm" type="button" data-chat-ask="${esc(p.faq?.[0]?.q || "How can the Labour Department help me?")}">Ask Kojo</button>
      </div>
      ${config.social?.whatsappChannel ? `<div class="aside-card"><h2>Get vacancies on WhatsApp</h2><p>Follow our WhatsApp Channel for vacancies and urgent notices.</p><a class="btn btn-primary btn-sm" href="${esc(config.social.whatsappChannel)}" target="_blank" rel="noopener" data-track="follow_whatsappChannel">Follow the channel</a></div>` : ""}
    </aside>
  </div>
</section>
<section class="section-tight">
  <div class="container">
    <div class="cta-band reveal">
      <div><h2>${cta.h}</h2><p>${cta.p}</p></div>
      <div class="btn-row">${cta.btn}</div>
    </div>
  </div>
</section>
${related.length ? `<section class="section section-alt"><div class="container"><h2>Related guides</h2><div class="related" style="margin-top:20px">${related.map((r) => postCard(r)).join("")}</div></div></section>` : ""}`,
  });
}

// ---------- Feeds for auto-posting to social media (Buffer, Zapier, Make, IFTTT, Meta Business Suite) ----------
const tagsFor = (p) => `${HASHTAG}${p.tag ? " " + p.tag : ""}`;
writeFileSync(join(out, "rss.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>Ghana Labour Department: news and guides</title>
  <link>${SITE}/blog</link>
  <description>Plain-language guides on jobs, GLMIS and workers' rights in Ghana.</description>
  <language>en-gh</language>
  <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
${posts.map((p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${utm(p.url, "rss", `blog-${p.slug}`).replace(/&/g, "&amp;")}</link>
    <guid isPermaLink="true">${p.url}</guid>
    <pubDate>${new Date(p.date + "T08:00:00Z").toUTCString()}</pubDate>
    <category>${esc(p.pillar)}</category>
    <description>${esc((p.social?.facebook || p.standfirst) + " " + tagsFor(p))}</description>
    <media:content url="${SITE}${p.og}" medium="image" width="1200" height="630"/>
  </item>`).join("\n")}
</channel>
</rss>
`);
writeFileSync(join(out, "feed.json"), JSON.stringify({
  version: "https://jsonfeed.org/version/1.1",
  title: "Ghana Labour Department: news and guides",
  home_page_url: `${SITE}/blog`,
  feed_url: `${SITE}/feed.json`,
  language: "en-GH",
  items: posts.map((p) => ({
    id: p.url, url: utm(p.url, "feed", `blog-${p.slug}`), title: p.title, summary: p.standfirst, image: SITE + p.og,
    date_published: `${p.date}T08:00:00Z`, tags: [p.pillar, HASHTAG, p.tag].filter(Boolean),
    _social: Object.fromEntries(Object.entries(p.social || {}).map(([k, v]) => [k, `${v} ${utm(p.url, k, `blog-${p.slug}`)} ${tagsFor(p)}`])),
  })),
}, null, 2));

// ---------- Social media kit (internal, noindex): ready-to-post captions per platform ----------
if (posts.length) {
  const platforms = [["facebook", "Facebook", "1080x1350 or link preview"], ["x", "X (Twitter)", "1600x900 or link preview"], ["linkedin", "LinkedIn", "1200x1200 or link preview"], ["whatsapp", "WhatsApp Channel / groups", "1080x1080 or link preview"]];
  render({
    path: "/social-kit",
    outFile: "social-kit.html",
    meta: { title: "Social media kit | Ghana Labour Department", description: "Ready-to-post captions and tracked links for every blog post.", noindex: true, crumb: "Social media kit" },
    body: `<section class="page-hero"><div class="container"><h1>Social media kit</h1><p>For the Public Relations Unit. Every blog post with approved captions, tracked links and the share image. Copy, paste, post. Each post should get two or three social posts and one WhatsApp Channel share (Brand Guide p.25).</p></div></section>
<section class="section"><div class="container" style="display:grid;gap:40px">
${posts.map((p) => `<article class="card" style="display:grid;gap:18px">
  <div class="glmis-band" style="gap:24px;align-items:start">
    <div><span class="post-meta">${esc(p.pillar)} &middot; ${fmtDate(p.date)}</span><h2 style="font-size:1.4rem;margin-top:6px"><a href="${p.path}">${esc(p.title)}</a></h2><p class="muted">Hashtags: ${esc(tagsFor(p))}</p></div>
    <div><img src="${p.og}" alt="Share image for ${esc(p.title)}" width="1200" height="630" style="border-radius:10px"><p style="margin-top:8px"><a href="${p.og}" download>Download share image (1200x630)</a></p></div>
  </div>
  ${platforms.filter(([k]) => p.social?.[k]).map(([k, name, size]) => {
    const text = `${p.social[k]}\n\n${utm(p.url, k, `blog-${p.slug}`)}\n\n${tagsFor(p)}`;
    return `<div><h3 style="font-size:1rem">${name} <span class="muted" style="font-weight:500;font-size:.85rem">(${size})</span></h3><textarea readonly rows="5" style="width:100%;font:inherit;font-size:.92rem;padding:12px;border-radius:10px;border:1.5px solid var(--grey);background:var(--surface);color:var(--text)">${esc(text)}</textarea><button class="btn btn-primary btn-sm" type="button" data-copy-text style="margin-top:8px">${icon("copy", 16)}Copy caption</button></div>`;
  }).join("\n")}
</article>`).join("\n")}
</div></section>`,
  });
}

// ---------- Kojo knowledge base (content/chatbot.json -> /js/knowledge.js) ----------
const kbLink = (l) => ({ href: l.url, label: l.label, ...(l.glmis || /glmis\.gov\.gh/.test(l.url) ? { glmis: true } : {}) });
const kb = (chatbot.intents || []).filter((i) => i.id && i.answer).map((i) => ({
  id: i.id, q: i.questions || [], k: (i.keywords || []).map((x) => String(x).toLowerCase()),
  a: applyTokens(md(i.answer)).trim(), links: (i.links || []).map(kbLink),
}));
mkdirSync(join(out, "js"), { recursive: true });
writeFileSync(join(out, "js/knowledge.js"), `/* Generated by build.mjs from content/chatbot.json. Edit answers in the CMS (/admin), not here. */
window.LD_KB = ${JSON.stringify(kb)};
window.LD_KB_FALLBACK = ${JSON.stringify({ id: "fallback", a: applyTokens(md(chatbot.fallback?.answer || "")).trim(), links: (chatbot.fallback?.links || []).map(kbLink) })};
window.LD_KB_FACTS = ${JSON.stringify(applyTokens((chatbot.facts || []).join("\n")))};
window.LD_OFFICES = ${JSON.stringify(offices.map((o) => ({ n: o.name, t: o.type, town: o.town, r: o.region, ph: o.phoneShown, tel: o.tel, maps: o.maps })))};
`);

// ---------- Sitemap and robots ----------
writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`);
writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /social-kit\nDisallow: /admin\n\nSitemap: ${SITE}/sitemap.xml\n`);

// ---------- Remote photography (static/img/photos wins if present) ----------
const assetsFile = join(root, "remote-assets.json");
if (existsSync(assetsFile)) {
  const assets = JSON.parse(readFileSync(assetsFile, "utf8"));
  for (const [rel, url] of Object.entries(assets)) {
    if (rel.startsWith("_") || existsSync(join(out, rel))) continue;
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      mkdirSync(dirname(join(out, rel)), { recursive: true });
      writeFileSync(join(out, rel), Buffer.from(await r.arrayBuffer()));
      console.log(`Fetched ${rel}`);
    } catch (e) {
      console.warn(`Could not fetch ${rel} (${e.message}); the page shows the brand-blue frame instead.`);
    }
  }
}

// On Vercel, serve photos through the built-in image optimiser (WebP/AVIF, resized) to keep pages light on 3G.
if (process.env.VERCEL) {
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith(".html") ? [join(d, e.name)] : []));
  for (const p of walk(out)) {
    const html = readFileSync(p, "utf8").replace(/src="(\/img\/(?:photos|og)\/[^"]+)"/g, (_, src) => {
      const u = (w) => `/_vercel/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
      return `src="${u(1200)}" srcset="${u(640)} 640w, ${u(1200)} 1200w, ${u(1920)} 1920w" sizes="(max-width: 860px) 100vw, 50vw"`;
    });
    writeFileSync(p, html);
  }
}

console.log(`Built ${urls.length} indexed pages (${posts.length} blog posts) to dist/ for ${SITE}`);
