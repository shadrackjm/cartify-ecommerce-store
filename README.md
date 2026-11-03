# Cartify — an E-Commerce Store with Laravel 13 + React 19

Source code for the **Code with SJM** YouTube series *Cartify E-Commerce Store: Laravel 13 + React 19*.

A complete store for physical goods: every size and color is its own variant with its own stock and price, a session
cart that guests can use, checkout with saved addresses and shipping, real Stripe payments with webhooks, order
tracking from paid to delivered, reviews only from customers whose order arrived, and an admin back office with a
dashboard and CSV reports. Built with Laravel 13, Inertia.js, React 19, TypeScript, Tailwind CSS and shadcn/ui, on
SQLite, with the raw Stripe PHP SDK (no Cashier).

## Episodes

| # | Episode | What you build |
|---|---|---|
| 1 | Intro & Data Model | Create the project, design the whole data model on paper |
| 2 | Migrations & Models | Products and independently stocked variants, and why a unique key allows duplicate NULLs |
| 3 | Roles & Seeding | Admin and customer roles, one admin route group, a realistic seeded store |
| 4 | Storefront Catalog | Search, filters and sorting with `when()`; a layout per section of the app |
| 5 | Product Detail & Variants | A size and a color resolve to one variant (`useMemo`); the wishlist |
| 6 | The Cart | A session cart keyed by variant, clamped to real stock; coupon codes |
| 7 | Checkout & Addresses | One default address; cart to order in one `DB::transaction`, prices frozen |
| 8 | Stripe & Webhooks | Stripe Checkout with the raw SDK, the webhook, an idempotent `markPaid()` |
| 9 | Order Status & Tracking | Status timestamps, a tracking timeline, a printable invoice with `window.print()` |
| 10 | Reviews | Reviews only after delivery; one review per customer with `updateOrCreate` |
| 11 | Admin Catalog | Categories, products and inline variants; `unique()->ignore()`; image uploads |
| 12 | Dashboard & Reports | Revenue, low stock, best sellers, a Tailwind-only bar chart, memory-safe CSV exports |
| 13 | The Landing Page | Choosing amber, one call to action for everyone, real best sellers |
| 14 | Tests & Capstone | Build before testing Inertia pages, Pest feature tests, a tour of the whole app |

### Which code to look at
- **`ep01` tag** — the project at the end of Episode 1: a fresh Laravel 13 + React starter kit.
- **`main`** (tag `final`) — the finished app from Episode 14. Every episode's code is in here; the episode shows
  which files it touches (for example Episode 6: `app/Http/Controllers/CartController.php` and
  `resources/js/pages/cart/index.tsx`).

Compare the two tags to see everything the series adds:
```bash
git diff ep01 final --stat
```

## Run it

Requires PHP 8.3+, Composer and Node.js (Laravel Herd works out of the box).

```bash
composer install
cp .env.example .env
php artisan key:generate
php -r "touch('database/database.sqlite');"
php artisan migrate:fresh --seed
php artisan storage:link
npm install
npm run build
```

Then open the site (with Herd: `http://cartify-ecommerce-store.test`) and sign in with one of the demo accounts
(password `password` for both):

| Role | Email |
|---|---|
| Admin | `admin@shop.test` |
| Customer | `customer@shop.test` |

The seeder creates 8 products with 39 variants (a few deliberately low on stock), the coupons `WELCOME10`, `SAVE20`
and an expired `EXPIRED5`, and a week of orders so the admin dashboard has data.

### Payments (Episode 8)
Without Stripe keys, checkout uses a simulated payment so you can try the whole flow. To take real test payments,
add your Stripe **test** keys to `.env`:
```
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
and forward webhooks locally with the Stripe CLI: `stripe listen --forward-to <your-site>/stripe/webhook`.

### Tests (Episode 14)
Inertia page tests need the built frontend, so build first:
```bash
npm run build
php artisan test
```
