# Ode Works — Motorcycle Shop Web App

Premium motorcycle dealership web app for **Ode Works** (Galas, Quezon City, Philippines). Vanilla HTML/CSS/ES6 JavaScript customer site + admin dashboard, backed by Supabase (Auth, Postgres, Storage), deploy-ready for Vercel.

## Tech Stack
- HTML5 / CSS3 / Vanilla JavaScript (ES modules, no frontend framework)
- [Supabase](https://supabase.com) — Auth, Postgres database, Row Level Security
- [Swiper.js](https://swiperjs.com) (hero slideshow), [AOS](https://michalsnik.github.io/aos/) (scroll animations), [Chart.js](https://www.chartjs.org) (admin analytics), [Font Awesome](https://fontawesome.com) (icons) — all loaded via CDN
- Deploy target: [Vercel](https://vercel.com) (static hosting, no build step required)

## Folder Structure
```
index.html, motorcycles.html, ... (18 customer pages, flat at project root)
admin/                 16 admin dashboard pages (login + dashboard + 14 modules)
partials/              shared header/footer/admin-sidebar/admin-topbar HTML fragments
assets/css/            main.css (tokens/reset), components.css, customer.css, admin.css
assets/js/             config.js, supabase-client.js, auth.js, cart.js, wishlist.js,
                        toast.js, modal.js, nav.js, includes.js, utils.js, render.js
assets/js/pages/        one script per customer page
assets/js/admin/        admin-auth.js (guard), crud-table.js (generic CRUD engine),
                        dashboard.js, reports.js, settings.js, and one script per module
supabase/               schema.sql, rls_policies.sql, seed.sql
serve.ps1               local static server for Windows (used by .claude/launch.json)
```

### Admin modules
Dashboard, Products, Motorcycle Inventory, Categories, Brands, Customers, Orders,
Appointments, Mechanics, Blog, Promotions, CMS/Banners, Reports, Users, Settings.
All list-based modules share one generic CRUD engine (`assets/js/admin/crud-table.js`):
search, filters, pagination, create/edit modal, delete confirmation, toast feedback.

## 1. Set Up Supabase

1. Create/open your project at [supabase.com](https://supabase.com/dashboard).
2. Go to **SQL Editor** and run, **in this exact order**:
   1. `supabase/schema.sql` — tables, types, indexes, triggers
   2. `supabase/rls_policies.sql` — Row Level Security policies
   3. `supabase/seed.sql` — sample brands, motorcycles, products, mechanics, blog posts, banners, promotions, settings
3. Go to **Settings → API** and copy:
   - **Project URL**
   - **anon / publishable key**
4. Open [assets/js/config.js](assets/js/config.js) and replace:
   ```js
   export const SUPABASE_URL = 'https://TODO-YOUR-PROJECT-REF.supabase.co';
   ```
   with your real Project URL. The anon key has already been filled in for you.

### Creating your first admin account
Sign up normally through the site's **Register** form (this auto-creates a `profiles` row with `role = 'customer'` via the `handle_new_user` trigger). Then, in the Supabase SQL Editor, promote that account:
```sql
update profiles set role = 'admin' where email = 'you@example.com';
```
You can then log in at `admin/login.html`.

### Storage (product/motorcycle images)
The seed data uses placeholder image URLs (`placehold.co`) so the site works immediately. To use real photos: create a public Storage bucket (e.g. `media`) in Supabase, upload images, and swap the URLs in `motorcycle_images` / `product_images` (or manage them from the Admin → Products / Inventory modules once built).

## 2. Run Locally

Because pages use ES modules (`fetch()` for header/footer partials, dynamic `import()`), you must serve the folder over HTTP — opening the HTML files directly (`file://`) will not work. From this folder, run any static server, e.g.:
```bash
npx serve .
```
or the Python one-liner:
```bash
python -m http.server 5500
```
Then visit `http://localhost:5500`.

## 3. Deploy to Vercel

1. Push this folder to your GitHub repo (`https://github.com/xxdarbxx/odeworks`).
2. In Vercel, **Import Project** from that repo.
3. Framework preset: **Other** (static site, no build command, no output directory override needed).
4. Deploy. `vercel.json` sets long-term caching for `/assets`.

No environment variables are required at build time — the Supabase URL/key are public (anon key) and live in `assets/js/config.js`, protected by Row Level Security on every table.

## Checkout / Payments
Checkout creates an **order record only** (no live payment gateway is integrated). Customers choose Cash on Delivery, Bank Transfer, or GCash and the order is stored with `payment_status = 'pending'`; staff confirm payment manually from the Admin → Orders module. To accept real online payments later, integrate a gateway (e.g. PayMongo, Stripe) using your own API keys in `checkout.js`.

## Build Status
- [x] Phase 1 — Foundation: DB schema, design system, shared JS modules, Home page, Login/Register
- [x] Phase 2 — Customer website: Motorcycles, Motorcycle Details, Parts, Product Details,
      Compare, Services, Booking, Financing, About, Blog + Post, Contact, Profile, Wishlist,
      Cart, Checkout
- [x] Phase 3 — Admin dashboard: login/role guard, analytics dashboard with Chart.js, and
      all 14 CRUD modules
- [x] Phase 4 — Responsive pass verified (mobile nav + admin sidebar), all pages checked
      for console errors in-browser

## Known Limitations / Next Steps
- **Supabase URL**: `assets/js/config.js` still has a placeholder Project URL — the app
  will not actually read/write data until you fill it in (see Setup above). Until then,
  every page falls back to graceful empty states rather than erroring.
- **Contact form** does not persist messages (no `contact_messages` table was in the
  original spec) — it shows a success toast only. Add a table + insert call if you want
  submissions stored.
- **Product/motorcycle images** are single-primary-image only from the admin forms
  (a URL field). The `motorcycle_images` / `product_images` tables support multiple
  images per item; extend the admin form UI if you want full gallery management there.
- **Admin/staff accounts** are created by having the person register normally, then
  promoting their role from the Users module (or via the SQL snippet above) — there is
  no "invite user" flow, since creating auth users directly requires a service-role key
  that should never live in client-side code.
