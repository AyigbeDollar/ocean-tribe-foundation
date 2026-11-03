// Renders branded 1200x630 share images (Open Graph) for the site and every blog post,
// following the Brand Guide v2.0 social post samples (p.17): brand blue, yellow tag pill,
// logo on a white panel top right, Montserrat headline, red action bar, Ghana stripe.
// Needs Playwright with Chromium (run locally, then commit static/img/og/*.png):
//   node scripts/og-cards.mjs
import { readFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const logo = "data:image/png;base64," + readFileSync(join(root, "static/img/ld-logo-320.png")).toString("base64");
const font = "data:font/woff2;base64," + readFileSync(join(root, "static/fonts/montserrat-latin-wght-normal.woff2")).toString("base64");
const fontCss = `@font-face{font-family:Montserrat;font-weight:100 900;src:url("${font}") format("woff2")}`;

const card = ({ pill, title, bar }) => `<!doctype html><html><head><meta charset="utf-8">

<style>${fontCss}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#2B3990;color:#fff;font-family:Montserrat,Arial,sans-serif;position:relative;overflow:hidden}
.ring{position:absolute;right:-160px;bottom:-220px;width:620px;height:620px;border-radius:50%;border:2px solid rgba(255,255,255,.12);box-shadow:0 0 0 80px rgba(255,255,255,.03),0 0 0 160px rgba(255,255,255,.02)}
.wrap{position:absolute;inset:0;padding:64px 72px 0}
.pill{display:inline-block;background:#F9ED32;color:#231F20;font-weight:800;font-size:22px;letter-spacing:.08em;text-transform:uppercase;padding:10px 22px;border-radius:999px}
.logo{position:absolute;top:52px;right:64px;width:132px;height:132px;background:#fff;border-radius:16px;padding:12px}
.logo img{width:100%;height:100%}
h1{font-size:${"{size}"}px;font-weight:800;line-height:1.08;letter-spacing:-1.5px;margin-top:40px;max-width:900px}
.bar{position:absolute;left:72px;right:72px;bottom:70px;background:#DD2A1B;border-radius:12px;padding:18px 26px;font-size:26px;font-weight:700;display:flex;justify-content:space-between}
.stripe{position:absolute;left:0;right:0;bottom:0;height:14px;display:flex}.stripe i{flex:1}
</style></head><body><div class="ring"></div>
<div class="wrap"><span class="pill">${pill}</span><h1>${title}</h1></div>
<div class="logo"><img src="${logo}"></div>
<div class="bar"><span>${bar}</span><span>labourdepartment.gov.gh</span></div>
<div class="stripe"><i style="background:#DD2A1B"></i><i style="background:#F9ED32"></i><i style="background:#006838"></i></div>
</body></html>`;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const jobs = [{ out: "static/img/og-image.png", pill: "Ghana Labour Department", title: "Decent work for every Ghanaian.", bar: "Register free on GLMIS" }];
const blogDir = join(root, "src/blog");
for (const f of existsSync(blogDir) ? readdirSync(blogDir).filter((x) => x.endsWith(".html")) : []) {
  const meta = JSON.parse(readFileSync(join(blogDir, f), "utf8").match(/^<!--meta\s*([\s\S]*?)-->/)[1]);
  const bar = meta.pillar === "Know your rights" ? "Questions? Call free 0800 600 300" : "Free help to find work";
  jobs.push({ out: `static/img/og/${f.replace(/\.html$/, "")}.png`, pill: meta.pillar, title: meta.title, bar });
}

mkdirSync(join(root, "static/img/og"), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const j of jobs) {
  const size = j.title.length > 52 ? 58 : j.title.length > 36 ? 66 : 78;
  await page.setContent(card({ pill: esc(j.pill), title: esc(j.title), bar: esc(j.bar) }).replace("{size}", size), { waitUntil: "networkidle" }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.screenshot({ path: join(root, j.out) });
  console.log("wrote", j.out);
}
await browser.close();
