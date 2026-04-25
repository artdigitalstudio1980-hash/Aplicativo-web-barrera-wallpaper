# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Barrera Wallpaper is a Next.js 14 e-commerce platform for wallpaper sales with AI-powered wallpaper generation and dropshipping via Pictorem. Located in `app/` directory.

## Development Commands

```bash
cd app
yarn dev          # Start development server (localhost:3000)
yarn build        # Production build
yarn lint         # Lint with ESLint
yarn tsc --noEmit # TypeScript type check

# Prisma
yarn prisma generate   # Generate Prisma client (also runs on postinstall)
yarn prisma db push    # Push schema changes to database
yarn prisma migrate    # Apply migrations
yarn prisma studio     # Open database GUI
```

## Architecture

### App Router Structure
- `app/app/` — Next.js App Router pages
- `app/app/api/` — API routes (14.x style with route.ts)
- `app/app/admin/` — Admin panel pages (products, orders)
- `app/app/catalog/` — Product catalog pages
- `app/app/checkout/` — Checkout flow including Stripe/PayPal

### Key Libraries
- **Auth:** NextAuth.js 4.24 with Prisma adapter, JWT strategy
- **Database:** Prisma 6.7 with MySQL (use Session Pooler on Supabase: port 6543)
- **Payments:** Stripe and PayPal with webhooks
- **AI:** OpenAI DALL-E for wallpaper generation, Replicate/Flux alternative
- **State:** Zustand for cart, React Query for server state
- **S3:** AWS SDK for product image storage

### API Routes Pattern
API routes use Next.js 14 route handlers (`route.ts`). Key patterns:
- `app/app/api/auth/[...nextauth]/route.ts` — NextAuth handler
- `app/app/api/ai/chat/` — AI chat endpoints (concierge, design, technical)
- `app/app/api/payments/stripe/webhook/route.ts` — Stripe webhook handler

### Database Schema
Prisma schema uses MySQL with relationMode = "prisma" (no foreign key constraints). Key models:
- `User` — Auth with isAdmin flag
- `Product` — Products with multi-language fields (nameEs, descriptionEs)
- `Order` — Order with Stripe/PayPal integration
- `AIWallpaperOrder` — AI-generated wallpaper orders with Pictorem dropshipping

### Translations
- `app/lib/translations.ts` — Static translations
- `app/lib/i18n.ts` — i18n utilities
- Dual-language support: Spanish (es) and English (en)

## Important Notes

### Deployment
- **Hostinger** with Node.js 22.x
- **Build output:** `.build/standalone/app/server.js` — specify in Hostinger config
- **Environment:** Use Session Pooler DATABASE_URL (port 6543, not 5432)
- GitHub Actions CI runs on every PR to main: `yarn tsc --noEmit` then `yarn build`

### Authentication
Admin access: `isAdmin: true` on User model. Admin panel at `/admin/products`. Default admin credentials are in README but must be changed in production.

### Payments
Stripe and PayPal both use server-side SDKs. Webhooks handle async payment confirmation. Guest checkout supported via email capture on orders.

### AI Integration
AI wallpaper generation uses OpenAI by default (DALL-E). Replicate/Flux available as alternative. Generated images stored in S3, pricing calculated via Pictorem API for dropshipping.

## File Locations

- Prisma schema: `app/prisma/schema.prisma`
- Auth config: `app/lib/auth-options.ts`
- Stripe client: `app/lib/stripe.ts`
- Catalog sync: `app/lib/sync-service.ts`
- Environment template: `app/.env.example`