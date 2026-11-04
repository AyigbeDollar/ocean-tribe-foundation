# Ghana Labour Department website

The public website for the Ghana Labour Department. It includes the Kojo chatbot, a blog, social sharing tools, and calls to action that send traffic to the Ghana Labour Market Information System (GLMIS, https://glmis.gov.gh).

The design follows the **Media, Communications & Digital Brand Guide v2.0**:
- **Colours:** Blue #2B3990, Red #DD2A1B, Dark Grey #231F20, Light Grey #D1D3D4, Yellow #F9ED32 and Green #006838, in accessible pairings only.
- **Typeface:** Montserrat, self-hosted.
- **Logo:** the official logo on a white panel, at least 80px wide.
- **Wording:** official naming, mandate, vision, mission and core values.

The site has no framework and no npm dependencies, so any web team can take it over and host it anywhere.

## Content manager (CMS) for officers

Officers update the site in a web editor at **/admin**, built on Decap CMS. They don't need to touch any code. From there they can:
- **News and guides:** write, schedule, edit and hide blog posts, with the brand guide checklist built into each field.
- **Announcement bar:** switch on a site-wide notice, such as a job fair, a scam alert or office closure.
- **Contacts, figures and social media:** edit phone numbers, emails, office hours and social media links. Changing the **minimum wage** here updates every page, FAQ and Kojo answer that mentions it.
- **Leadership:** change the Chief Labour Officer's name and profile, and upload the official portrait.
- **FAQs:** add, edit and reorder questions. Google's structured data updates automatically.
- **Kojo answers:** edit the chatbot's approved answers, keywords and buttons.
- **Photos:** upload images. They are stored in `static/img/uploads/`.

**How publishing works:** each change goes through the guide's approval workflow, with columns for Draft, In review and Ready. An officer drafts, the PRU reviews, and an authorised officer presses **Publish**. Publishing commits the change to GitHub, and Vercel rebuilds the site in about a minute.

### One-time setup (about 10 minutes)

1. **Create a GitHub OAuth App** under GitHub → Settings → Developer settings → OAuth Apps → New:
   - Homepage URL: `https://labour-department-ghana.vercel.app`
   - Authorization callback URL: `https://labour-department-ghana.vercel.app/api/callback`
2. **Add the app's credentials in Vercel:** in the project's environment variables, add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`, then redeploy.
3. **Give each officer access:** invite them as collaborators with **Write** access to the GitHub repository. Each officer signs in at `/admin` with their own GitHub account, so every change is attributed to a named officer (Brand Guide p.26).
4. **Check the branch:** `static/admin/config.yml` → `backend.branch` must be the branch Vercel deploys to production. It is set to the current working branch. After merging into `main`, change it to `main`, or set this branch as the Production Branch in Vercel → Settings → Git.

**Local editing without GitHub:** run `npx decap-server` and `npx serve dist`, then open `http://localhost:3000/admin`.

## Structure

```
content/              Everything officers edit in the CMS
  blog/*.md           Blog posts (Markdown with front matter)
  settings.json       Contacts, social links, minimum wage figures
  announcement.json   Site-wide notice bar
  leadership.json     Chief Labour Officer details and portrait
  faqs.json           FAQ page
  chatbot.json        Kojo knowledge base and AI fact sheet
static/admin/         The CMS (Decap CMS 3.17.1, self-hosted) and its config.yml
build.mjs             Static site builder. Run: npm install && node build.mjs
src/layout.html       Shared page shell: SEO tags, header, footer, Kojo widget
src/pages/*.html      Page layouts. {{tokens}} such as {{minWage}} come from content/
static/               CSS, JS, images, fonts, copied as-is
api/chat.js           Optional AI endpoint for Kojo (needs ANTHROPIC_API_KEY)
api/auth.js, callback.js  GitHub sign-in for the CMS (needs GITHUB_CLIENT_ID and SECRET)
remote-assets.json    Photos downloaded at build time if not in static/img/photos/
scripts/              og-cards.mjs (share images) and export-kb.mjs (knowledge base review file)
```

## Build and preview

```bash
npm install
```

```bash
node build.mjs
```

```bash
npx serve dist
```

## Connecting social media

1. **Add the official accounts:** in the CMS, under Site content → Contacts, figures and social media, add the Facebook, X, LinkedIn, Instagram, TikTok, YouTube and WhatsApp Channel addresses. They then appear in the footer, the "Stay connected" sections and the WhatsApp follow card on every post. They are also added to the Department's structured data for Google.
2. **Auto-post new articles:** connect `https://<domain>/rss.xml` to Meta Business Suite, Buffer, Zapier, Make or IFTTT. New posts are then shared to Facebook, X and LinkedIn automatically. Each item already carries the approved caption, hashtags and share image. `feed.json` also has a separate caption for each platform under `_social`.
3. **Measure traffic:** every share and feed link carries UTM tags (`utm_source=whatsapp|facebook|x|linkedin|rss`, `utm_campaign=blog-<slug>`). Shares, follows, GLMIS clicks and chatbot questions and ratings are pushed to `window.dataLayer`. Add a Google Tag Manager or GA4 snippet to `src/layout.html` to see which platform sends the most visitors to the site and to GLMIS.

## Kojo chatbot

Kojo follows the Chatbot guide (Brand Guide pages 20 to 23):
- **Identity:** it says it is an automated assistant, uses the official logo as its avatar, and uses blue and red colours.
- **Safety script:** messages mentioning danger, trafficking, forced work or self-harm get the urgent safety script.
- **Hand-over to a person:** typing "officer", or two missed answers in a row, gives the user a way to reach a Labour Officer.
- **Ratings:** users can rate answers with thumbs up or down.

- **Offline mode (default):** answers come only from the approved knowledge base in `content/chatbot.json`.
- **AI mode:** set `ANTHROPIC_API_KEY` in Vercel. The prompt in `api/chat.js` applies the guide's voice and safety rules.
- Officers edit answers in the CMS under **Kojo answers**. To produce a review copy for PRU sign-off, run `node build.mjs && node scripts/export-kb.mjs`, which writes `KNOWLEDGE_BASE.md`.

## Deploy

- **Vercel (current host):** the project root is `ghana-labour-department`. Set `SITE_URL=https://labourdepartment.gov.gh` once the domain points here, so canonical URLs, the sitemap and feeds use it.
- **Netlify:** `netlify.toml` is included.
- **Any web server:** run `node build.mjs` and upload `dist/`. Configure the server for clean URLs (serve `about.html` at `/about`) and `404.html`.

## Before the official launch (PRU checklist)

1. **Chief Labour Officer portrait:** upload it in the CMS under Site content → Leadership.
2. **Logo:** replace `static/img/ld-logo-*.png` with exports from the PRU vector master pack. The current files were taken from the Brand Guide PDF, and the guide says to use only the master files.
3. **Photography:** the supporting photos are photorealistic AI-generated images of fictional people, used so the site feels real and relatable from launch. Replace them over time with real Department photos taken with consent, either by uploading through the CMS or by saving files with the same names in `static/img/photos/`. The child labour page deliberately shows only a child's hands, never a face.
4. **Social handles:** add them in the CMS under Site content.
5. **Fact-check and sign-off:** the four launch blog posts follow the guide's voice and checklist, but they were drafted with AI help. A named officer must check every fact before publishing (Brand Guide p.26).
6. **Emergency numbers:** confirm the police numbers 191 and 18555 used in the safety script (Brand Guide p.23).
7. **Data protection:** register the chatbot's data processing with the Data Protection Commission (Act 843) and review `/privacy`.
8. **Minimum wage:** update every January in the CMS under Site content → Contacts, figures and social media.
