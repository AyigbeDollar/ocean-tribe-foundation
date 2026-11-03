# Ghana Labour Department website

The public website for the Ghana Labour Department. It includes the LD Assist chatbot, a blog, social sharing tools, and calls to action that send traffic to the Ghana Labour Market Information System (GLMIS, https://glmis.gov.gh).

The design follows the **Media, Communications & Digital Brand Guide v2.0**:
- **Colours:** Blue #2B3990, Red #DD2A1B, Dark Grey #231F20, Light Grey #D1D3D4, Yellow #F9ED32 and Green #006838, in accessible pairings only.
- **Typeface:** Montserrat, self-hosted.
- **Logo:** the official logo on a white panel, at least 80px wide.
- **Wording:** official naming, mandate, vision, mission and core values.

The site has no framework and no npm dependencies, so any web team can take it over and host it anywhere.

## Structure

```
build.mjs             Static site builder (Node 18+). Run: node build.mjs
site.config.json      Social media links, contacts, GLMIS URL, hashtag. Edit this first
src/layout.html       Shared page shell: SEO tags, header, footer, LD Assist widget
src/pages/*.html      One file per page. A <!--meta {...}--> JSON header sets title, description and JSON-LD
src/blog/*.html       Blog posts (see "Publishing a blog post")
static/               Copied as-is: css/, js/, img/, fonts/, manifest
  js/knowledge.js     LD Assist knowledge base (approved answers)
  js/chatbot.js       LD Assist engine: works offline, upgrades to AI when /api/chat is available
  img/og/             Branded 1200x630 share images, one per post
api/chat.js           Optional AI endpoint (Vercel). Needs ANTHROPIC_API_KEY
scripts/og-cards.mjs  Generates the branded share images (needs Playwright locally)
scripts/export-kb.mjs Exports the chatbot knowledge base to KNOWLEDGE_BASE.md for review
dist/                 Build output (generated, not committed)
```

## Build and preview

```bash
node build.mjs
```

```bash
npx serve dist
```

## Publishing a blog post

Follow the Blogging guide (Brand Guide pages 24 to 27).

1. Copy an existing file in `src/blog/` and rename it to the slug, for example `report-unpaid-wages.html`.
2. Edit the meta block at the top:
   - **title:** 50 to 65 characters, sentence case.
   - **description:** 140 to 155 characters.
   - **pillar:** Find work, Know your rights, Impact stories or Labour market insight.
   - **tag:** one theme hashtag.
   - **legal:** the legal basis box text, for rights posts.
   - **faq:** three questions and answers.
   - **social:** one caption each for Facebook, X, LinkedIn and WhatsApp.
3. Write the body using H2 subheadings every 150 to 250 words, short paragraphs and numbered steps.
4. Run `node scripts/og-cards.mjs` to create the branded share image, then commit and push. Vercel publishes automatically.
5. Open `/social-kit` on the live site. Copy the ready-made captions, which already include tracked links and hashtags, into each platform.

The build creates these automatically:
- the blog index with topic filters
- article and FAQ structured data for Google
- "Last reviewed" dates
- related posts
- share buttons
- the sitemap entry
- the RSS and JSON feeds

## Connecting social media

1. **Add the official accounts:** put the Facebook, X, LinkedIn, Instagram, TikTok, YouTube and WhatsApp Channel URLs in `site.config.json`. They then appear in the footer, the "Stay connected" sections and the WhatsApp follow card on every post. They are also added to the Department's structured data for Google.
2. **Auto-post new articles:** connect `https://<domain>/rss.xml` to Meta Business Suite, Buffer, Zapier, Make or IFTTT. New posts are then shared to Facebook, X and LinkedIn automatically. Each item already carries the approved caption, hashtags and share image. `feed.json` also has a separate caption for each platform under `_social`.
3. **Measure traffic:** every share and feed link carries UTM tags (`utm_source=whatsapp|facebook|x|linkedin|rss`, `utm_campaign=blog-<slug>`). Shares, follows, GLMIS clicks and chatbot questions and ratings are pushed to `window.dataLayer`. Add a Google Tag Manager or GA4 snippet to `src/layout.html` to see which platform sends the most visitors to the site and to GLMIS.

## LD Assist chatbot

LD Assist follows the Chatbot guide (Brand Guide pages 20 to 23):
- **Identity:** it says it is an automated assistant, uses the official logo as its avatar, and uses blue and red colours.
- **Safety script:** messages mentioning danger, trafficking, forced work or self-harm get the urgent safety script.
- **Hand-over to a person:** typing "officer", or two missed answers in a row, gives the user a way to reach a Labour Officer.
- **Ratings:** users can rate answers with thumbs up or down.

- **Offline mode (default):** answers come only from the approved knowledge base in `static/js/knowledge.js`.
- **AI mode:** set `ANTHROPIC_API_KEY` in Vercel. The prompt in `api/chat.js` applies the guide's voice and safety rules.
- To review or update answers, edit `knowledge.js`, then run `node scripts/export-kb.mjs` to refresh `KNOWLEDGE_BASE.md` for PRU sign-off.

## Deploy

- **Vercel (current host):** the project root is `ghana-labour-department`. Set `SITE_URL=https://labourdepartment.gov.gh` once the domain points here, so canonical URLs, the sitemap and feeds use it.
- **Netlify:** `netlify.toml` is included.
- **Any web server:** run `node build.mjs` and upload `dist/`. Configure the server for clean URLs (serve `about.html` at `/about`) and `404.html`.

## Before the official launch (PRU checklist)

1. **Chief Labour Officer portrait:** save the official photo as `static/img/chief-labour-officer.jpg` (4:5, at least 800x1000).
2. **Logo:** replace `static/img/ld-logo-*.png` with exports from the PRU vector master pack. The current files were taken from the Brand Guide PDF, and the guide says to use only the master files.
3. **Photography:** the supporting photos are AI-generated illustrations of fictional people. The guide asks for real, captioned photos taken with consent. Place real photos with the same names in `static/img/photos/`. Blog posts only show a photo once a real one is saved there.
4. **Social handles:** add them to `site.config.json`.
5. **Fact-check and sign-off:** the four launch blog posts follow the guide's voice and checklist, but they were drafted with AI help. A named officer must check every fact before publishing (Brand Guide p.26).
6. **Emergency numbers:** confirm the police numbers 191 and 18555 used in the safety script (Brand Guide p.23).
7. **Data protection:** register the chatbot's data processing with the Data Protection Commission (Act 843) and review `/privacy`.
8. **Minimum wage:** update every January. Search for `21.77`.
