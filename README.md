# Two Bit Code — website

Static landing page (HTML/CSS/vanilla JS, no build step) plus one serverless function for the contact form.

```
index.html          page markup, SEO + Open Graph metadata
assets/styles.css   design system + all styles
assets/main.js      interactions, project rendering, form logic
assets/config.js    ← edit this: email, form endpoint, portfolio projects
api/contact.js      contact form backend (Vercel function → Resend email)
```

## Before launch — replace placeholders
- `yourdomain.com` in `index.html` (canonical, og:url, og:image, JSON-LD) and `assets/config.js`.
- `hello@yourdomain.com` → your real inbox (`assets/config.js`; the page updates automatically).
- Social links in the footer (`href="#"`), Privacy Policy and Terms of Service pages.
- Add `assets/og-image.png` (1200×630) for link previews.
- Portfolio: edit `projects` in `assets/config.js`. Set `placeholder: false` once a project is real.
- Optional hero video: drop a licensed clip (e.g. Pexels/Coverr free license) at `assets/hero.mp4` and set `heroVideo` in `assets/config.js`. It is shown in grayscale and tinted by the animated light field (`assets/hero.js`).

## Themes
Dark is the default; light mode follows the visitor's system setting, and the nav toggle remembers their choice. The hero and product mockups stay dark in both themes. Colors are tokens at the top of `assets/styles.css`.

## Activate the contact form (pick one)

**A. Bundled function (recommended) — Vercel + Resend**
1. Create a free account at resend.com, verify your domain, create an API key.
2. Deploy this folder to Vercel (`vercel` CLI or import the repo). `api/contact.js` is picked up automatically.
3. In Vercel → Project → Settings → Environment Variables add:
   - `RESEND_API_KEY`
   - `CONTACT_TO_EMAIL` (comma-separated for both founders)
   - `CONTACT_FROM_EMAIL` e.g. `Two Bit Code <inquiries@yourdomain.com>`
   - optional `ALLOWED_ORIGIN=https://yourdomain.com`
4. Redeploy. Keep `form.endpoint: '/api/contact'` in `config.js`.

**B. No backend — Formspree or Web3Forms**
Set `form.endpoint` in `config.js` to your Formspree URL, or to `https://api.web3forms.com/submit` with `extraFields: { access_key: '…' }`.

Until one of these is set up, submitting shows an error with a direct email link, so no inquiry is silently lost.

**Spam protection:** hidden honeypot field + minimum fill time, checked in the browser and again on the server. If spam gets through, add Cloudflare Turnstile.

## Local preview
Any static server works, e.g. `npx serve .` or `python -m http.server`. (`vercel dev` also runs the form function locally.)
