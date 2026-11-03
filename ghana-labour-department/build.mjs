// Static site builder for the Labour Department of Ghana website.
// Zero dependencies: `node build.mjs` turns src/pages/*.html into dist/*.html
// using one shared layout, then copies static/ and writes sitemap.xml.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const SITE = (process.env.SITE_URL || "https://labour-department-ghana.vercel.app").replace(/\/$/, "");
const out = join(root, "dist");
const layout = readFileSync(join(root, "src/layout.html"), "utf8");
const today = new Date().toISOString().slice(0, 10);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(root, "static"), out, { recursive: true });

const NAV = [
  ["/", "Home"],
  ["/about", "About"],
  ["/services", "Services"],
  ["/workers-rights", "Workers' Rights"],
  ["/employers", "Employers"],
  ["/glmis", "GLMIS Jobs"],
  ["/contact", "Contact"],
];

const pages = readdirSync(join(root, "src/pages")).filter((f) => f.endsWith(".html"));
const urls = [];

for (const file of pages) {
  const raw = readFileSync(join(root, "src/pages", file), "utf8");
  const m = raw.match(/^<!--meta\s*([\s\S]*?)-->/);
  if (!m) throw new Error(`Missing <!--meta {...}--> header in ${file}`);
  const meta = JSON.parse(m[1]);
  const body = raw.slice(m[0].length);
  const slug = file === "index.html" ? "" : file.replace(/\.html$/, "");
  const path = slug ? `/${slug}` : "/";
  const canonical = SITE + path;

  const nav = NAV.map(([href, label]) => {
    const active = href === path ? ' aria-current="page"' : "";
    return `<li><a href="${href}"${active}>${label}</a></li>`;
  }).join("");

  const breadcrumb = slug && slug !== "404"
    ? `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
          { "@type": "ListItem", position: 2, name: meta.crumb || meta.title.split("|")[0].trim(), item: canonical },
        ],
      })}</script>`
    : "";
  const extraLd = (meta.jsonld || []).map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n");

  const html = layout
    .replaceAll("{{title}}", meta.title)
    .replaceAll("{{description}}", meta.description)
    .replaceAll("{{canonical}}", canonical)
    .replaceAll("{{site}}", SITE)
    .replaceAll("{{robots}}", slug === "404" ? "noindex, follow" : "index, follow, max-image-preview:large")
    .replaceAll("{{bodyClass}}", meta.bodyClass || "")
    .replace("{{nav}}", nav)
    .replace("{{jsonld}}", breadcrumb + "\n" + extraLd)
    .replace("{{head}}", meta.head || "")
    .replace("{{content}}", body)
    .replaceAll("{{year}}", String(new Date().getFullYear()));

  writeFileSync(join(out, file), html);
  if (slug !== "404") urls.push({ loc: canonical, priority: slug ? (meta.priority || "0.8") : "1.0" });
}

writeFileSync(
  join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`)
    .join("\n")}\n</urlset>\n`
);
writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

// Fetch remote photography that is not yet stored locally (static/img/photos wins if present).
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
      console.warn(`Could not fetch ${rel} (${e.message}); the page shows a fallback colour block.`);
    }
  }
}

// On Vercel, serve local photos through the built-in image optimiser (WebP/AVIF, resized).
if (process.env.VERCEL) {
  for (const file of readdirSync(out).filter((f) => f.endsWith(".html"))) {
    const p = join(out, file);
    const html = readFileSync(p, "utf8").replace(/src="(\/img\/photos\/[^"]+)"/g, (_, src) => {
      const u = (w) => `/_vercel/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
      return `src="${u(1200)}" srcset="${u(640)} 640w, ${u(1200)} 1200w, ${u(1920)} 1920w" sizes="(max-width: 860px) 100vw, 50vw"`;
    });
    writeFileSync(p, html);
  }
}

console.log(`Built ${pages.length} pages to dist/ for ${SITE}`);
