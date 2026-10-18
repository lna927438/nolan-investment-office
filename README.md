# Cala Vale Office

The current static website for Cala Vale Office.

Preview: https://lna927438.github.io/nolan-investment-office/

## Current version

- A concise introduction, clear conversation and investment-interest links, and consistent controls.
- English, Chinese and Spanish. Share language links with `?lang=en`, `?lang=zh` or `?lang=es`; the last choice is remembered when browser storage is available.
- Original, uncropped member photographs with accessible profile dialogs.
- Responsive WebP backgrounds and illustrations. The five desktop variants total 949,396 bytes, down from 11,658,591 bytes; mobile variants total 320,662 bytes.
- Optional background film loaded only after the visitor chooses to play. It pauses offscreen, in a background tab, or when motion is disabled.
- Branded favicon, touch icon and sharing card, with metadata for the current Pages URL.
- Separate styles, interaction scripts and contact configuration. No third-party build dependencies.

## Contact and launch status

An actual office email and custom domain have not been supplied. `js/config.js` contains empty contact settings. Visitors can prepare and copy an introduction without saving or sending the message.

Once the office email is confirmed, set `OFFICE_CONFIG.email`. The primary action will open the visitor's email application with a draft; visitors still send it themselves. This is not a hosted email delivery service. A confirmed HTTPS professional-profile URL is optional.

Search indexing remains disabled while contact information and proposed copy await confirmation. After approval, update the robots meta tag, `robots.txt`, the corresponding verification gate and sitemap. For a custom domain, update canonical and social URLs and configure GitHub Pages DNS before adding a CNAME.

Alissa's supplied biography is preserved. No unconfirmed duties, experience or investment record have been added.

## Source layout

| Path | Purpose |
| --- | --- |
| `index.html` | Semantic page and static EN / ZH / ES content |
| `styles/site.css` | Current desktop and mobile presentation |
| `styles/noscript.css` | Fallback without JavaScript |
| `js/site.js` | Navigation and progressive visual enhancements |
| `js/preferences.js` | Language and page metadata |
| `js/hero-video.js` | Optional video loading and playback |
| `js/members.js` | Profile dialogs and keyboard focus |
| `js/config.js`, `js/contact.js` | Contact settings and draft/copy interaction |
| `js/lenis.min.js` | Existing licensed smooth-scroll dependency |
| `assets/` | Current media, font and brand graphics |

Translations remain next to their semantic HTML rather than duplicating unused JSON. `assets/image-variants.json` records conversion sizes and unchanged portrait hashes; it is not deployed.

## Check and build

Requires Node.js 22 or later.

```sh
npm ci
npm run verify
npm run build
```

The verifier checks local assets, JavaScript and JSON syntax, unique IDs, ARIA and anchor targets, profile dialogs, language controls and image dimensions. The build safely replaces this project's `dist/` directory. Serve it with a static HTTP server for review.

Pushes to `main` verify and publish through the existing GitHub Pages workflow. Browser visual checks at 360, 390 and 768 pixels, 200% text size, and device-specific mail-app behavior remain part of release review when a browser is available.

See `MATERIALS.md` for source and license notes. The Aspekta font license is preserved in the HTML.
