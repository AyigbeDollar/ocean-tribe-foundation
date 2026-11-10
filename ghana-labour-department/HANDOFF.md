# Handoff: Ghana Labour Department website

This folder holds the full source of the Ghana Labour Department website. Use this brief to continue the work in Claude Cowork, or with any developer.

## Where things stand

| Item | Value |
|---|---|
| Live site | https://labour-department-ghana.vercel.app |
| Content manager | https://labour-department-ghana.vercel.app/admin (sign-in not yet configured, see below) |
| GitHub repository | `AyigbeDollar/ocean-tribe-foundation`, folder `ghana-labour-department/` |
| Working branch | `claude/ghana-labour-website-chatbot-rndaol` |
| Vercel project | `labour-department-ghana` (team "brightselormelikem-9138's projects"), root directory `ghana-labour-department` |
| Build | `npm install && node build.mjs` produces `dist/` |
| Brand reference | Ghana Labour Department Media, Communications & Digital Brand Guide v2.0 |

## What is built

- **Pages:**
  - Home, with the WebGL 3D globe hero
  - About and Management (the Chief Labour Officer, Dawuda Ibrahim Braimah, is the only person shown)
  - Services
  - Workers' Rights
  - Employers
  - GLMIS Jobs
  - Child Labour, including the Child Labour Unit
  - FAQs
  - Contact, with all 16 regional Public Employment Centres
  - Privacy
  - Blog, with four launch posts
  - Social media kit at `/social-kit`
- **Design:** premium 3D: a deep-blue gradient hero, frosted-glass panels and tilted 3D photo frames. It uses the brand colours, the official logo and self-hosted Montserrat. Pages work on phones down to 320px wide, in light and dark mode.
- **Kojo chatbot:**
  - Answers come from an approved knowledge base in `content/chatbot.json`.
  - It has an urgent safety script and hands over to a person when someone types "officer".
  - Users can rate answers with thumbs up or down.
  - Optional AI mode switches on when `ANTHROPIC_API_KEY` is set in Vercel.
- **SEO:**
  - Titles, descriptions and Open Graph images on every page, with branded share images for posts
  - JSON-LD structured data: government organisation, breadcrumbs, FAQ pages, how-to steps and blog posts
  - A sitemap, robots.txt, and RSS and JSON feeds
- **Traffic to GLMIS:** "Register on GLMIS" calls to action across the site and in chatbot answers. Shares, GLMIS clicks and chat events are pushed to `window.dataLayer`. All share links carry UTM tags.
- **Content manager (Decap CMS at `/admin`):** officers can edit:
  - blog posts
  - the announcement bar
  - contacts and social links
  - minimum wage figures, which update every page, FAQ and chatbot answer
  - leadership details
  - FAQs
  - chatbot answers

  Changes go through an approval workflow with Draft, In review and Ready stages.

## Outstanding tasks, in priority order

1. **Turn on CMS sign-in:**
   - GitHub OAuth App "Ghana Labour Department CMS" is registered (owner KojoSelorm, Client ID `Ov23liF1cX60wECxK0bv`).
   - Generate its client secret in GitHub → Settings → Developer settings → OAuth Apps.
   - ~~Create a GitHub OAuth App with the callback `https://labour-department-ghana.vercel.app/api/callback`.~~
   - Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to the Vercel project's environment variables, then redeploy.
   - Invite officers to the repository with Write access.
2. **Production branch:** CMS commits go to `claude/ghana-labour-website-chatbot-rndaol` (set in `static/admin/config.yml`). Either set that branch as the Production Branch in Vercel → Settings → Git, or merge it into `main` and change `backend.branch` to `main`.
3. **Chief Labour Officer portrait:** done. Official photo at `static/img/chief-labour-officer-2026-11.jpg` (use a new file name when replacing it, so caches refresh) (replace in the CMS under Site content → Leadership).
4. **Real photography:** done for five of six slots. `static/img/photos/*.jpg` are real Department photos (Jobs Roadshow Sunyani, PEC booth, YEA-PEA stakeholder meeting), exported at 1600x1200 with camera and GPS data removed. `child-hands.png` stays generated on purpose so no identifiable child appears. Confirm the people shown agreed to appear on the website.
5. **Social media handles:** add the official accounts in the CMS under Site content. Then connect `/rss.xml` to Meta Business Suite, Buffer or Zapier to auto-post new articles.
6. **Analytics:** paste a Google Tag Manager (`GTM-...`) or GA4 (`G-...`) ID into the CMS under Site content → Analytics ID (or `analyticsId` in `content/settings.json`). The tag loads on every page once set.
7. **Domain:** point `labourdepartment.gov.gh` at the Vercel project and update `siteUrl` in `content/settings.json`.
8. **PRU sign-off:**
   - Fact-check the four launch blog posts.
   - Confirm the emergency numbers 191 and 18555 used in the chatbot's safety script.
   - Register the chatbot's data processing with the Data Protection Commission (Act 843).
   - Review `KNOWLEDGE_BASE.md`.


## Office directory (/offices)

- Source: "Offices of the Labour Department" document (94 offices in its table, plus the Head Office). Data in `content/offices.json`, editable in the CMS under **Offices**.
- Corrections made to the source table: Ashanti offices placed in their own towns (Konongo, Obuasi, Bekwai, Offinso, Mampong, Tepa) instead of all "Kumasi"; Oti Regional Office in Dambai; Odumase PEC (Sunyani West); Ellembelle PEC at Nkroful; spelling fixes (Savannah, Sogakope, Cape Coast).
- No individual phone numbers or emails were in the document. Until officers add them in the CMS, Call uses 0800 600 300 and Email uses info@labourdepartment.gov.gh.
- Map pins are at town level (GeoNames and Wikipedia coordinates). Directions search Google Maps for the office by name and town; adding a street address in the CMS makes them exact.
- Kojo answers "office in <town>" and "offices in <region>" from the same data.
- The document's summary says 93 offices and 41 PECs; its table lists 94 offices and 42 PEC sites (Bono East Regional Office/PEC included). The website counts from the table.

## Content rules agreed with the client

- Do not mention the National Labour Commission or Labour Compliance Officers anywhere.
- About and Management shows only the Chief Labour Officer's image.
- No em dashes or en dashes in visible text.
- Never show an identifiable child in a child labour context.
- Use official names on first mention: "Ghana Labour Department", "Ghana Labour Market Information System (GLMIS)" and "Public Employment Centre (PEC)".

## Ready-to-paste first message for Cowork

> I'm continuing work on the Ghana Labour Department website. The project folder is open; read HANDOFF.md and README.md first. The live site is https://labour-department-ghana.vercel.app, the code is in GitHub at AyigbeDollar/ocean-tribe-foundation (folder ghana-labour-department, branch claude/ghana-labour-website-chatbot-rndaol), and it deploys on Vercel as the project labour-department-ghana. Start with the outstanding tasks in HANDOFF.md, beginning with turning on CMS sign-in. Follow the content rules listed there and the Brand Guide v2.0.
