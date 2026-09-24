// Post-build SEO step (runs after `vite build`):
//  1. Writes dist/<route>/index.html for every public route with its own <title>, meta description,
//     canonical and social tags, plus crawlable fallback content inside #root (React replaces it on load).
//  2. Writes dist/404.html (noindex) so unknown URLs return a real 404.
//  3. Generates dist/sitemap.xml and dist/robots.txt from src/seo/routes.json.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const seo = JSON.parse(readFileSync(join(root, "src/seo/routes.json"), "utf8"));
const template = readFileSync(join(dist, "index.html"), "utf8");
const today = new Date().toISOString().slice(0, 10);

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const setTag = (html, pattern, replacement) => {
  if (!pattern.test(html)) throw new Error(`postbuild: pattern not found ${pattern}`);
  return html.replace(pattern, replacement);
};

const navLinks = seo.routes
  .map((r) => `<li><a href="${r.path}">${esc(r.label)}</a></li>`)
  .join("");

const render = ({ path, title, description, h1, summary }, { noindex = false } = {}) => {
  const url = seo.siteUrl + path;
  let html = template;
  html = setTag(html, /<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  html = setTag(html, /<meta name="description" content="[^"]*"/, `<meta name="description" content="${esc(description)}"`);
  html = setTag(html, /<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url}"`);
  html = setTag(html, /<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${url}"`);
  html = setTag(html, /<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${esc(title)}"`);
  html = setTag(html, /<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${esc(description)}"`);
  html = setTag(html, /<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${esc(title)}"`);
  html = setTag(html, /<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${esc(description)}"`);
  if (noindex) {
    html = setTag(html, /<meta name="robots" content="[^"]*"/, `<meta name="robots" content="noindex, nofollow"`);
    html = html.replace(/\s*<link rel="canonical" href="[^"]*" \/>/, "");
  }
  const fallback =
    `<main style="max-width:48rem;margin:0 auto;padding:6rem 1rem;font-family:system-ui,sans-serif;color:#0f2a4a"><h1>${esc(h1)}</h1><p>${esc(summary)}</p>` +
    `<nav aria-label="Site"><ul>${navLinks}</ul></nav></main>`;
  html = setTag(html, /<div id="root"><\/div>/, `<div id="root">${fallback}</div>`);
  return html;
};

for (const route of seo.routes) {
  const html = render(route);
  const out = route.path === "/" ? join(dist, "index.html") : join(dist, route.path.slice(1), "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}

writeFileSync(
  join(dist, "404.html"),
  render(
    {
      path: "/404",
      title: "Page not found | Ocean Tribe Foundation",
      description: "The page you are looking for could not be found.",
      h1: "Page not found",
      summary: "This page may have moved. Use the links below to find your way back.",
    },
    { noindex: true },
  ),
);

// Plain SPA shell for app-only routes (auth, dashboard, admin); never indexed.
writeFileSync(
  join(dist, "app.html"),
  render(
    { path: "/app", title: "Ocean Tribe Foundation", description: seo.routes[0].description, h1: "Ocean Tribe Foundation", summary: "" },
    { noindex: true },
  ),
);

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
  seo.routes
    .map(
      (r) =>
        `  <url>\n    <loc>${seo.siteUrl}${r.path}</loc>\n    <lastmod>${today}</lastmod>\n` +
        `    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n` +
        (r.path === "/"
          ? `    <image:image><image:loc>${seo.siteUrl}${seo.defaultImage}</image:loc></image:image>\n`
          : "") +
        `  </url>`,
    )
    .join("\n") +
  `\n</urlset>\n`;
writeFileSync(join(dist, "sitemap.xml"), sitemap);

writeFileSync(
  join(dist, "robots.txt"),
  [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /dashboard",
    "Disallow: /auth",
    "Disallow: /events/create",
    "Disallow: /events/edit/",
    "",
    `Sitemap: ${seo.siteUrl}/sitemap.xml`,
    "",
  ].join("\n"),
);

console.log(`postbuild: ${seo.routes.length} pages, 404.html, sitemap.xml, robots.txt written`);
