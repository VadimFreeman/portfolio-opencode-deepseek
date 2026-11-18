# Vadim Freeman — portfolio

A personal portfolio site with a dark editorial look: oversized display type,
serif italic accents, mono labels, a preloader, custom cursor, marquee,
animated tabs and a particle globe (vanilla canvas).

No build step, no framework — just HTML, CSS and JavaScript.

## Files

```
index.html              all page content
assets/css/style.css    colours, type, layout, animations
assets/js/main.js       loader, cursor, tabs, canvas, small utilities
assets/img/mark.svg     favicon / logo mark
```

## Run locally

Any static server works, for example:

```bash
npx serve .
# or
python -m http.server 5500
```

Then open the printed address (usually `http://localhost:3000` or
`http://localhost:5500`).

## What to edit first

1. **Name / text** — `index.html`. Every block has comments: HERO, TABS, WORK,
   ABOUT, CONTACT, FOOTER. Change the copy right there.
2. **Links** — GitHub, Telegram, X appear in the "links" tab, the profile card
   and the contact block. Search the file for `your_handle` and replace it.
3. **Email** — search for `hello@vadimfreeman.com`. The "copy address" button
   reads the address from its `data-email` attribute, so update both places.
4. **Projects** — the `.work-row` blocks inside `<div class="work-list">`.
   Replace name, description, category, year and `href`.
5. **Colours** — `assets/css/style.css`, the `:root` block at the top:
   `--ink` (background), `--text`, `--accent` (lavender), `--peach`, `--mint`.
6. **Fonts** — the Google Fonts link in `<head>` plus the `--sans`,
   `--display`, `--serif`, `--mono` variables in the CSS.
7. **Logo** — `assets/img/mark.svg` (favicon) and the `MARK` template string
   at the top of `assets/js/main.js` (inline logo).
8. **Sections** — remove or reorder `<section>` blocks in `index.html`;
   keep the ids `work`, `about`, `contact` in sync with the nav links.

## Deploy

The repo includes a GitHub Actions workflow (`.github/workflows/pages.yml`)
that publishes the site to GitHub Pages on every push to `main`.

In the repository: **Settings → Pages → Build and deployment → Source:
GitHub Actions**. After the first successful workflow run the site is at:

```
https://vadimfreeman.github.io/portfolio-opencode-deepseek/
```

All asset paths are relative, so the site also works from any subfolder or
static host (Netlify, Vercel, Cloudflare Pages).
