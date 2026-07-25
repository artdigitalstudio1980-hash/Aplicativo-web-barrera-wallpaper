# Barrera Wallpaper — Agent Instructions

## Commands

| Command | What it does |
|---------|-------------|
| `yarn dev` | Start dev server |
| `yarn build` | Build (ESLint + TS errors are **ignored** per next.config.js) |
| `yarn lint` | ESLint via `next lint` |
| `yarn seed` | Seed catalog via `tsx scripts/seed-master.ts` |
| `yarn prisma generate` | Auto-runs on `postinstall`; required after schema changes |
| `yarn dev:staging` | Dev server con BD de staging (`.env.staging`) |
| `yarn test:smoke` | Playwright smoke tests contra localhost |
| `yarn seed:staging` | Seed en BD de staging |

CI runs `yarn build` as the primary verification.

## Framework & Key Libraries

- **Next.js 14.2.35** (App Router), React 18, TypeScript 5.2
- **NextAuth v4** — JWT strategy, credentials provider only (no OAuth)
- **Prisma 6** — MySQL, binary engine (`engineType = "binary"`), target `debian-openssl-1.1.x` for Hostinger compat
- **shadcn/ui** — `style: "default"`, `baseColor: "neutral"`, CSS variables
- **Stripe + PayPal** — unified checkout at `/api/checkout`
- **Framer Motion** — all page animations
- **Lucide** — icons
- **Zustand + Jotai** — state management

## Architecture Gotchas

- **Lazy services**: Stripe (`lib/stripe.ts`), Upstash rate limit (`lib/ratelimit.ts`) — they throw/warn at runtime if env vars are missing, not at import time. Rate limit **fails open** (allows requests through) when unconfigured.
- **Prisma singleton**: `lib/prisma.ts` — only one client instance, cached on `globalThis`.
- **Admin auth**: Middleware (`middleware.ts`) protects `/admin/*` and `/api/admin/*` by checking JWT `token.isAdmin`. Uses `next-auth/jwt` `getToken`, not the session API.
- **Rate limiting**: Middleware rate-limits `/api/auth/*` and `/api/contact/*` via Upstash (5 requests / 60s sliding window).
- **Security headers**: CSP in `next.config.js` whitelists Stripe, PayPal, Replicate. Adding new external API calls from the client may require CSP updates.
- **Images**: `unoptimized: true` in next.config.js — no Next.js image optimization. Remote images whitelisted via `remotePatterns` (AWS S3, Replicate, Cloudinary, Unsplash).
- **`trailingSlash: true`** — all routes end with `/`.
- **Redirects** in next.config.js: `/auth/login` → `/login`, `/shop` → `/catalog`, `/ai-studio` → `/design`.

## SEO Infrastructure

- **JSON-LD schemas** in `components/schemas/` — Organization, LocalBusiness, WebSite, BreadcrumbList, Product, ItemList, FAQPage, Service. Rendered via `components/json-ld-script.tsx`. Layouts inject schemas per page; product pages use `generateMetadata` + ProductSchema.
- **Product detail pages** at `/products/[slug]` — server component with `generateMetadata()` for dynamic titles, descriptions, OG per product. Includes BreadcrumbSchema + ProductSchema.
- **Collections metadata** via `app/collections/layout.tsx`. Dynamic metadata for individual collections is not generated server-side (page is `'use client'`).
- **Sitemap** (`app/sitemap.ts`) — dynamically generated, includes static pages + all 3 collections + all product slugs (fetched from `/api/products`).
- **`public/llms.txt`** — AI context file for ChatGPT/Perplexity/Claude.
- **`app/robots.ts`** — allows all AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended). Disallows admin/api/account/cart/checkout/auth.

## API Key

- **`GET /api/products?slug=X`** — the slug filter was added to support product detail pages. The API falls back from DB to local `catalog_master.json` if DB is unreachable. Slugs for fallback products are generated from `nameEs`.

## i18n

Custom client-side i18n via `lib/translations.ts` + `LocaleProvider` (`components/locale-context.tsx`). Full EN/ES translations exist (100+ keys each). Spanish **is functional** — `locale-context.tsx` respects saved browser preference. Use `lib/translations.ts` (complete, active), NOT `lib/i18n.ts` (stale, ~40 keys).

Hreflang tags in root layout: `en-US` and `es-US`.

## Package Manager

- **Yarn** (v1/node-modules linker per `.yarnrc.yml`)
- `legacy-peer-deps=true` in `.npmrc`
- `yarn.lock` is tracked in git (required for Hostinger deployment)

## CI/CD

- **Deploy**: GitHub Actions → SCP → Hostinger, managed by PM2 as `barrera-wallpaper`. Pushes to `main` trigger it.
- **`.env` is generated from GitHub secrets during deployment** (`deploy.yml`), not stored in repo.
- **Pull requests** trigger a build check (`test.yml`). Post-deploy, a smoke check verifies the site responds 200.
- **Branch strategy**: `feature/*` → PR a `main` → build + tests → merge. No commits directo a main.

## Database

- MySQL on Hostinger
- Prisma `relationMode = "prisma"` (no foreign keys in DB)
- Seeding: `scripts/seed-master.ts` reads `prisma/catalog_master.json` + images from `public/catalogo/`
- VSCode setting: `prisma.pinToPrisma6: true`

## Seed Script Quirk

The seed script creates its own `PrismaClient` instance (not the singleton from `lib/prisma.ts`). It reads product images from `public/catalogo/` directory — if the directory is missing, it logs a warning but continues.

## Testing & QA

### Pre-deploy Checklist (ejecutar en orden)
1. `yarn build` — build de producción
2. `yarn dev:staging && yarn test:smoke` — smoke tests contra staging
3. `git push origin main` — CI build + deploy
4. Verificar el post-deploy smoke check en el action

### Staging Environment
- Archivo: `.env.staging` (ignorado por git)
- **BD separada**: crear `staging_barrera` en Hostinger para no afectar producción
- Stripe en modo test (`sk_test_*`), PayPal sandbox
- Seed rápido: `yarn seed:staging`
- Dev local con staging: `yarn dev:staging`

### Playwright Smoke Tests
- Archivo: `tests/smoke.spec.ts`
- Cubren: páginas estáticas (200), API validation (400/401/403), 404
- No requieren BD — testean rutas y validación de entrada
- Ejecutar: `yarn test:smoke` (servidor local debe estar corriendo)
