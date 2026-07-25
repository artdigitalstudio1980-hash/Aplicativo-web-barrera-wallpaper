# SEO Implementation — Barrera Wallpaper

## Schema Markup (JSON-LD)

All schemas live in `components/schemas/` and render via `components/json-ld-script.tsx`.

### Schemas implemented

| Schema | File | Where injected |
|--------|------|----------------|
| `Organization` + `LocalBusiness` | `organization-schema.tsx` | `app/layout.tsx` (all pages) |
| `WebSite` with SearchAction | `organization-schema.tsx` | `app/layout.tsx` (all pages) |
| `BreadcrumbList` | `breadcrumb-schema.tsx` | catalog, about, product detail layouts |
| `Product` | `product-schema.tsx` | `app/products/[slug]/page.tsx` |
| `ItemList` | `product-schema.tsx` | collection pages via client component |
| `FAQPage` | `faq-schema.tsx` | services + installation layouts |
| `Service` | `service-schema.tsx` | services + installation layouts |

### Adding a new schema

```tsx
import JsonLdScript from '@/components/json-ld-script';

export function MySchema() {
  const schema = { '@context': 'https://schema.org', '@type': '...' };
  return <JsonLdScript data={schema} />;
}
```

### Validation
Use Google Rich Results Test before deploying.

---

## Product Detail Pages

Located at `app/products/[slug]/page.tsx`.

- **Server component** with `generateMetadata()` for dynamic title, description, OG per product
- Includes `BreadcrumbSchema` + `ProductSchema`
- Renders `ProductDetailClient` (client component) for interactivity (add-to-cart, quote request)

### How it works

1. `generateMetadata({ params })` fetches product via `GET /api/products?slug=X`
2. If product not found, calls `notFound()` (404)
3. Server component renders schema + client component

### Adding a new product page
No action needed — product pages are dynamic based on slugs from the catalog API.

---

## Sitemap

Located at `app/sitemap.ts`. Dynamically generated on each request.

### Routes included

| Type | Source | Priority |
|------|--------|----------|
| Static pages (11) | Hardcoded in `staticRoutes` | 0.2–1.0 |
| Collections (3) | `CATEGORY_SLUGS` array: `systexx-pure`, `systexx-phantasy`, `systexx-active` | 0.85 |
| Products | Fetched from `GET /api/products` → extracts slugs | 0.8 |

### Adding a new static page
Add to the `staticRoutes` array in `app/sitemap.ts`.

---

## Metadata per page

| Page | Metadata source | Canonical |
|------|----------------|-----------|
| `/` (home) | `app/layout.tsx` | `/` |
| `/catalog` | `app/catalog/layout.tsx` | `/catalog` |
| `/collections/[slug]` | `app/collections/layout.tsx` (static fallback) | `/collections` |
| `/services` | `app/services/layout.tsx` | `/services` |
| `/installation` | `app/installation/layout.tsx` | `/installation` |
| `/design` | `app/design/layout.tsx` | `/design` |
| `/calculator` | `app/calculator/layout.tsx` | `/calculator` |
| `/about` | `app/about/layout.tsx` | `/about` |
| `/contact` | `app/contact/layout.tsx` | `/contact` |
| `/privacy` | `app/privacy/layout.tsx` | noindex |
| `/terms` | `app/terms/layout.tsx` | noindex |
| `/products/[slug]` | `app/products/[slug]/page.tsx` (`generateMetadata`) | `/products/[slug]` |

### Adding metadata to a new page
Create a `layout.tsx` with `export const metadata: Metadata = { ... }`.

---

## AI SEO

### `public/llms.txt`
Context file for AI assistants (ChatGPT, Perplexity, Claude). Contains:
- Company description
- Key page URLs
- Service area
- Contact info

### robots.txt (`app/robots.ts`)
- Allows all AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)
- Disallows: `/admin/`, `/api/`, `/account/`, `/cart/`, `/checkout/`, `/auth/`

---

## i18n (Internationalization)

### Files
- `lib/translations.ts` — Complete (100+ keys, **use this**)
- `lib/i18n.ts` — Stale (~40 keys, **do not use**)
- `components/locale-context.tsx` — Provider, **respects saved ES preference**

### SEO tags
- Hreflang: `en-US` and `es-US` in root `layout.tsx` `alternates.languages`
- `<html lang>` updates dynamically via `locale-context.tsx`

---

## API

### `GET /api/products?slug=X`
- Supports slug filter for product detail pages
- Falls back from DB to `prisma/catalog_master.json` if DB unreachable
- Fallback slugs generated from `nameEs`: `nameEs.toLowerCase().replace(/\s+/g, '-')`

---

## Sitemap Maintenance

- Sitemap is **dynamic** — it fetches product slugs on each request
- Collection slugs are hardcoded — update `CATEGORY_SLUGS` array in `app/sitemap.ts` when adding new collections
- Product slugs come from the API — any product visible in catalog will appear in sitemap
