# Ode Works — Motorcycle Repair Shop Website

A modern, premium, responsive website for **Ode Works**, a motorcycle repair, maintenance, and diagnostics shop in Galas, Quezon City, Philippines. Built with plain HTML5, CSS3, and vanilla JavaScript — no frameworks, no build step, and no required backend to run it.

## Tech Stack
- HTML5 / CSS3 / Vanilla JavaScript (ES modules)
- [AOS](https://michalsnik.github.io/aos/) (scroll animations) and [Font Awesome](https://fontawesome.com) (icons) — loaded via CDN
- Deploy target: [Vercel](https://vercel.com) (static hosting, no build command needed)
- **Database-ready, not database-required**: content and form submissions are handled by a small local data/API layer today (see below), written so a real backend (Supabase or anything else) can be dropped in later without touching any page's HTML.

## Folder Structure
```
index.html, about.html, services.html, gallery.html,
booking.html, blog.html, blog-post.html, contact.html, 404.html

partials/          header.html, footer.html (shared, injected via includes.js)

assets/css/        main.css        design tokens, reset, glassmorphism base
                    components.css  buttons, cards, badges, forms, toasts, modal, nav
                    site.css        page-specific styles (hero, services, gallery, booking, etc.)

assets/js/         includes.js     fetches and injects header/footer partials
                    nav.js          sticky header, mobile menu, back-to-top
                    toast.js        toast notifications
                    modal.js        modal/confirm dialog helper
                    utils.js        formatting/date/debounce helpers
                    render.js       shared card renderers (service/gallery/testimonial/blog/mechanic)
                    data.js         sample content — services, mechanics, testimonials, gallery, blog posts
                    api.js          submitBooking() / submitContactMessage() / getBookedSlots()
                                    — localStorage-backed today, swap for a real DB call later

assets/js/pages/    one script per page (home.js, about.js, services.js, gallery.js,
                    booking.js, blog.js, blog-post.js, contact.js)

assets/img/        logo.jpg

supabase/schema.sql  optional future schema — table shapes mirror data.js/api.js
                      exactly, so wiring up a real backend later is a drop-in swap

vercel.json, serve.ps1, .gitignore
```

## How content works right now
Every page reads its content from **`assets/js/data.js`** — plain JS arrays of objects shaped like database rows (each with an `id`). There's nothing to configure or connect; edit that file directly to change services, team members, testimonials, gallery items, or blog posts.

Two things that involve user input — the **booking wizard** and the **contact form** — go through **`assets/js/api.js`**, which currently just validates, simulates a short delay, and saves to `localStorage` so the flow feels real end-to-end (you can inspect `ow_bookings` / `ow_contact_messages` in DevTools → Application → Local Storage).

## Adding a real backend later (optional)
When you're ready to persist data for real:
1. Run `supabase/schema.sql` in your Supabase project's SQL Editor — its tables (`services`, `mechanics`, `appointments`, `testimonials`, `gallery_images`, `blog_posts`, `contact_messages`) mirror `data.js`/`api.js` field-for-field.
2. Add a Supabase client (`npm i @supabase/supabase-js` or the `esm.sh` CDN import used in earlier iterations of this project) and replace the bodies of `submitBooking()` / `submitContactMessage()` in `assets/js/api.js` with `supabase.from(...).insert(...)` calls — the function signatures stay the same, so no page-level code needs to change.
3. Swap the static arrays in `data.js` for `supabase.from('services').select('*')`-style calls (or keep `data.js` as a fallback while the DB is being populated).

## Run Locally
Because pages use ES modules (`fetch()` for header/footer partials, dynamic imports), serve the folder over HTTP — opening the HTML files directly (`file://`) will not work correctly. From this folder:
```bash
npx serve .
```
or:
```bash
python -m http.server 5500
```
Then visit `http://localhost:5500`. (A Windows PowerShell static server, `serve.ps1`, is also included and wired up in `.claude/launch.json` for local preview.)

## Deploy to Vercel
1. Push this folder to your GitHub repo (`https://github.com/xxdarbxx/odeworks`).
2. In Vercel, **Import Project** from that repo.
3. Framework preset: **Other** (static site — no build command, no output directory override).
4. Deploy. `vercel.json` sets long-term caching for `/assets`.

No environment variables or secrets are required — there is no backend dependency in this build.
