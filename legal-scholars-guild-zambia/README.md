# Legal Scholars' Guild of Zambia

A responsive, multi-page website for the Legal Scholars' Guild of Zambia (LSGZ), built with HTML5, CSS3 and vanilla JavaScript. There is no framework, package manager or build step.

## Run locally

The site loads leadership, partner and institution records with `fetch()`. Browsers block those requests when a page is opened using `file://`, so serve the workspace over HTTP.

1. Open this folder in VS Code.
2. Install and start the **Live Server** extension, then open `index.html` with Live Server.
3. Use the local URL shown by VS Code, usually `http://127.0.0.1:5500/`.

The site also works with any simple static HTTP server. Google Fonts and the map embed require an internet connection.

## Folder structure

```text
about.html
contact.html
events.html
index.html
leadership.html
membership.html
partners.html
programmes.html
resources.html
css/
  responsive.css
  style.css
data/
  current-executive.json
  law-associations.json
  member-institutions.json
  partners.json
  presidents.json
  sister-bodies.json
  vice-presidents.json
images/
  hero/
  leaders/
  logo/
  partners/
js/
  forms.js
  leadership.js
  main.js
  partners.js
```

## Updating content

- **Current executive:** edit `data/current-executive.json`. Each entry has `name`, `position`, `institution`, `photo`, and `bio`. The current secretary title is listed as **Secretary General-Elect**; update it only when confirmed.
- **Presidents:** edit `data/presidents.json`. Add entries with `number`, `name`, `term`, `institution`, `photo`, and `bio`. Use a higher number for later presidents; the leadership page sorts newest first by default. A missing term displays as “Term not recorded.”
- **Vice presidents:** edit `data/vice-presidents.json`. Add `servedUnder` to the president fields to record the president each vice president served under.
- **Partners and institutions:** edit `data/partners.json`, `data/sister-bodies.json`, `data/law-associations.json`, and `data/member-institutions.json`. Entries use `name`, `category`, `logo`, `description`, and `website`. Keep websites blank until the official URL is confirmed. Use image paths relative to the workspace root.
- **Events and resources:** update the placeholder entries directly in `events.html` and `resources.html` when approved details or documents are available.
- **Counters:** update the verified counts in the `counterValues` object in `js/main.js`.
- **Forms:** the current membership and contact forms validate locally but do not transmit or store information. Connect an approved Formspree, EmailJS, Google Forms, or other secure endpoint in `js/forms.js` before collecting submissions. Student numbers are not shown publicly and are not persisted by this static page.

## Styling and accessibility

Change the shared colour palette in the `:root` CSS variables at the top of `css/style.css`. Responsive breakpoints are in `css/responsive.css` at 480px, 768px and 1024px. Keep the skip link, visible focus states, semantic headings, image alternatives and reduced-motion behavior when editing the templates.

## How to add a new leader or photo

1. Add an approved, rights-cleared portrait to `images/past presidents/`, `images/past vice presidents/` or `images/leaders/`. Resize leader portraits to around **600 × 750 px** and prefer WebP or an optimised JPG to keep pages quick. No supplied files exceeded 500 KB at the time this guide was prepared.
2. Add or update the matching object in `data/presidents.json`, `data/vice-presidents.json` or `data/current-executive.json`. Use the real path from the workspace root in `photo`, for example `images/past%20presidents/2nd%20president%20Mr.%20Lumbanya%20Mulenga.jpg`.
3. Keep `term`, `institution` and `bio` as `[EDIT ME]` until verified. A numbered image filename is used to infer the list number and displayed name only; it is not evidence of dates or a biography.
4. Preview on the Leadership page over Live Server. Images are lazy-loaded, sized to reserve space, and fall back to initials if a file is missing.

## How to turn animations down or off

- Edit `--anim-speed`, `--anim-fast`, `--anim-slow` and `--anim-ease` at the top of `css/animations.css` to change the site-wide motion timing and curve.
- To remove the richer effects, set `--anim-speed` and `--anim-fast` near `1ms`, and remove the `animations.css` link from the pages. Content and controls remain functional.
- Visitors who enable **Reduce motion** in their device settings automatically get static reveals, no parallax, cursor, tilt or marquee movement, and a quick preloader fade.
- The preloader plays only on the first page of a browser session. Clear session storage or begin a new session to preview it again.

## Deploy to GitHub Pages

1. Commit the website files to a GitHub repository.
2. In repository **Settings → Pages**, choose the deployment branch and the repository root as the source.
3. Save and wait for GitHub Pages to publish the site. `index.html` is the entry point.
4. Test the published pages, image paths, JSON fetches and all external links. If deploying below a project subpath, the current relative paths remain rooted to the current page; keep navigation and data URLs relative.

## Pre-publication checklist

- Confirm the Guild's exact founding year.
- Verify the LinkedIn URL and all organisation names, relationships and website URLs.
- Replace contact details, programme dates/results, event locations, missing membership institutions, all `[EDIT ME]` records and counter values.
- Confirm membership categories and eligibility, publish the ratified constitution, and connect form delivery before accepting submissions.
- Confirm image identities, image permissions and all biographies before publishing.