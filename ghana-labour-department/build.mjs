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
import { marked } from "marked";
import YAML from "yaml";

const root = dirname(fileURLToPath(import.meta.url));
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const config = readJson("content/settings.json");
const leadership = readJson("content/leadership.json");
const announcement = readJson("content/announcement.json");
const faqs = readJson("content/faqs.json");
const chatbot = readJson("content/chatbot.json");
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
  ? `<ul class="social-links">${SOCIAL.map(([k, label, ic]) => `<li><a href="${esc(config.social[k])}" target="_blank" rel="noopener" data-track="follow_${k}">${icon(ic)}${label}</a></li>`).join("")}</ul>`
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
function shareBar(url, text, campaign) {
  const t = encodeURIComponent(text);
  const u = (s) => encodeURIComponent(utm(url, s, campaign));
  return `<div class="share-bar" data-share data-url="${esc(utm(url, "copy", campaign))}" data-title="${esc(text)}">
  <span>Share</span>
  <a class="share-btn wa" href="https://wa.me/?text=${t}%20${u("whatsapp")}" target="_blank" rel="noopener" data-track="share_whatsapp">${icon("whatsapp", 18)}WhatsApp</a>
  <a class="share-btn" href="https://www.facebook.com/sharer/sharer.php?u=${u("facebook")}" target="_blank" rel="noopener" data-track="share_facebook">${icon("facebook", 18)}Facebook</a>
  <a class="share-btn" href="https://twitter.com/intent/tweet?text=${t}&amp;url=${u("x")}&amp;hashtags=${HASHTAG.slice(1)}" target="_blank" rel="noopener" data-track="share_x">${icon("xlogo", 18)}X</a>
  <a class="share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${u("linkedin")}" target="_blank" rel="noopener" data-track="share_linkedin">${icon("linkedin", 18)}LinkedIn</a>
  <button class="share-btn" type="button" data-copy-link>${icon("link", 18)}<span>Copy link</span></button>
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
  ["/employers", "Employers"], ["/glmis", "GLMIS Jobs"], ["/blog", "Blog"], ["/contact", "Contact"],
];
const urls = [];

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
      .replace("<!--faq-groups-->", faqGroups))
    .replaceAll("{{year}}", String(new Date().getFullYear()))
    .replace("<!--announcement-->", announcementBar));
  mkdirSync(dirname(join(out, outFile)), { recursive: true });
  writeFileSync(join(out, outFile), html);
  if (!noindex) urls.push({ loc: canonical, lastmod: meta.reviewed || meta.date || today, priority: meta.priority || (path === "/" ? "1.0" : "0.8") });
}

// Static pages
for (const file of readdirSync(join(root, "src/pages")).filter((f) => f.endsWith(".html"))) {
  const { meta, body } = readMeta(readFileSync(join(root, "src/pages", file), "utf8"), file);
  const slug = file === "index.html" ? "" : file.replace(/\.html$/, "");
  if (body.includes("<!--faq-groups-->")) meta.jsonld = [...(meta.jsonld || []), faqLd];
  render({ meta, body, path: slug ? `/${slug}` : "/", outFile: file });
}

// Blog index
if (posts.length) {
  const pillars = [...new Set(posts.map((p) => p.pillar))];
  render({
    path: "/blog",
    outFile: "blog.html",
    meta: {
      title: "News and Guides | Jobs, Rights and Labour Updates | Ghana Labour Department",
      description: "Plain-language guides and news from the Ghana Labour Department: finding work on GLMIS, your rights under the Labour Act, 2003 (Act 651), and how to stay safe from job scams.",
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
    <div class="blog-filters" role="group" aria-label="Filter posts by topic">
      <button type="button" aria-pressed="true" data-filter="all">All posts</button>
      ${pillars.map((p) => `<button type="button" aria-pressed="false" data-filter="${esc(p)}">${esc(p)}</button>`).join("\n      ")}
    </div>
    <div class="post-grid" data-post-grid>
${posts.map((p, i) => postCard(p, i === 0)).join("\n")}
    </div>
  </div>
</section>
<section class="section section-alt">
  <div class="container social-band">
    <div class="reveal">
      <h2>Never miss an update</h2>
      <p class="lead">Follow the Department for vacancies, job fairs and rights education, or subscribe to the blog feed.</p>
      <!--follow-links-->
    </div>
    <div class="wa-card reveal" style="--i:1">
      <h3>${icon("whatsapp", 26)}Share with someone looking for work</h3>
      <p>Most people hear about jobs from friends and family. Forward our free job guide to your WhatsApp groups.</p>
      ${shareBar(`${SITE}/blog/${posts.find((p) => p.pillar === "Find work")?.slug || posts[0].slug}`, "Free help to find work in Ghana from the Labour Department", "blog-index")}
    </div>
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
      <div style="margin-top:32px">${shareBar(p.url, shareText, `blog-${p.slug}`)}</div>
    </article>
    <aside class="article-aside" aria-label="Related actions">
      <div class="aside-card glmis">
        <h2>Looking for work?</h2>
        <p>Register free on the Ghana Labour Market Information System and get matched to vacancies.</p>
        <a class="btn btn-yellow btn-sm" href="${config.glmisLinks.register}" target="_blank" rel="noopener" data-track="glmis_post_aside">Register on GLMIS</a>
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
