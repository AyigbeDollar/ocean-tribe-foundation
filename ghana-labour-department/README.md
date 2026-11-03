# Labour Department of Ghana website

A fast, SEO-optimised, mobile-first public website for the Labour Department of Ghana. It includes a WebGL 3D hero, the "Kofi" help chatbot, and calls to action that send traffic to the Ghana Labour Market Information System (GLMIS, https://glmis.gov.gh).

The site has no framework and no npm dependencies, so any web team can take it over and host it anywhere.

## Structure

```
build.mjs            Static site builder (Node 18+). Run: node build.mjs
src/layout.html      Shared page shell: head/SEO tags, header, footer, chat widget
src/pages/*.html     One file per page. A <!--meta {...}--> JSON header sets title, description and JSON-LD
static/              Copied as-is: css/, js/, img/, manifest
  js/site.js         Theme toggle, menu, reveal animations, 3D tilt, GLMIS click tracking
  js/hero3d.js       Three.js globe hero (lazy-loaded, respects reduced motion)
  js/knowledge.js    Chatbot knowledge base (edit answers here)
  js/chatbot.js      Chatbot engine: works offline, upgrades to AI when /api/chat is available
  js/vendor/         Self-hosted Three.js r160 (MIT)
api/chat.js          Optional serverless AI endpoint (Vercel). Needs ANTHROPIC_API_KEY
remote-assets.json   Photos downloaded at build time if not in static/img/photos/
dist/                Build output (generated, not committed)
```

## Build and preview

```bash
node build.mjs
```

```bash
npx serve dist
```

Set `SITE_URL` to the production domain so canonical URLs, the sitemap and Open Graph tags are correct:

```bash
SITE_URL=https://www.labour.gov.gh node build.mjs
```

## Deploy

- **Vercel (current host):** import the folder as a project, with root directory `ghana-labour-department`. `vercel.json` sets the build and output directory, and photos are optimised automatically.
- **Netlify:** `netlify.toml` is included. The chatbot runs in offline mode unless you port `api/chat.js` to a Netlify Function.
- **Any web server (Apache, Nginx, cPanel, GitHub Pages):** run `node build.mjs` and upload the contents of `dist/`. Configure the server to serve `about.html` at `/about` (clean URLs) and `404.html` for missing pages.

## Chatbot

- **Offline mode (default):** answers come from `static/js/knowledge.js` using keyword and similarity matching. It needs no keys or servers and works on every host.
- **AI mode:** set the `ANTHROPIC_API_KEY` environment variable on Vercel. You can override the model with `CHAT_MODEL`. The widget detects the endpoint automatically and falls back to offline mode if it is unavailable.
- To update facts, such as next year's minimum wage, edit both `static/js/knowledge.js` and the fact sheet in `api/chat.js`.

## Content to update before the official launch

1. **Chief Labour Officer portrait:** save the official photo as `static/img/chief-labour-officer.jpg` (portrait 4:5, at least 800x1000). Until then a branded placeholder is shown.
2. **Head office street address, email and direct phone numbers:** these are not on the site yet because they could not be verified. Add them in `src/pages/contact.html` and `src/layout.html`.
3. **Minimum wage:** update every January. Search for `21.77`.
4. **Photography:** the supporting photos are AI-generated illustrations. Replace them with real Department photos by placing files with the same names in `static/img/photos/`.
5. **Analytics:** GLMIS clicks and chat questions are pushed to `window.dataLayer`. Add a Google Tag Manager or GA4 snippet to `src/layout.html` to measure the traffic sent to GLMIS.
6. **Search Console:** verify the domain and submit `/sitemap.xml`.
