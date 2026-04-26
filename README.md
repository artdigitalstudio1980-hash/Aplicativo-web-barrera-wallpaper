# Barrera Wallpaper — E-Commerce Platform

Premium wallpaper e-commerce platform with AI-powered design tools.  
Built with **Next.js 14**, **Prisma**, **MySQL**, and deployed on **Hostinger**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React, Framer Motion |
| UI | shadcn/ui, Tailwind CSS, Lucide Icons |
| Backend | Next.js API Routes, Prisma ORM |
| Database | MySQL (Hostinger) |
| Payments | Stripe + PayPal |
| Storage | AWS S3 |
| AI | Google Gemini, Replicate |
| Analytics | Chart.js, Plotly.js, Recharts |
| Email | Nodemailer (Hostinger SMTP) |
| Deploy | GitHub Actions → Hostinger (PM2) |

## Getting Started

```bash
# 1. Install dependencies
yarn install

# 2. Configure environment
cp .env.example .env
# Fill in all required values

# 3. Generate Prisma client
yarn prisma generate

# 4. Run development server
yarn dev
```

## Project Structure

```
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # Backend API endpoints
│   │   ├── auth/           # Authentication (register, NextAuth)
│   │   ├── checkout/       # Unified checkout (Stripe + PayPal)
│   │   ├── payments/       # Payment webhooks & capture
│   │   ├── products/       # Product CRUD
│   │   └── admin/          # Admin-only endpoints
│   ├── catalog/            # Product catalog/showroom
│   ├── cart/               # Shopping cart
│   ├── checkout/success/   # Post-payment confirmation
│   ├── design/             # AI wallpaper designer
│   ├── login/              # Authentication pages
│   └── register/
├── components/             # Reusable React components
│   ├── ui/                 # shadcn/ui primitives
│   └── layout/             # Header, Footer, etc.
├── lib/                    # Shared utilities & service configs
│   ├── prisma.ts           # Database client (singleton)
│   ├── stripe.ts           # Stripe initialization (lazy)
│   ├── paypal.ts           # PayPal API service
│   ├── mailer.ts           # Email templates & sending
│   ├── s3.ts               # S3 file operations
│   ├── aws-config.ts       # AWS client configuration
│   └── utils.ts            # Shared helpers (parseProductImage, sanitize, etc.)
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── catalog_master.json # Master product data for seeding
├── scripts/
│   └── seed-master.ts      # Database seeding script
└── .github/workflows/
    └── deploy.yml          # CI/CD pipeline
```

## Key Architecture Decisions

- **Single Prisma client** (`lib/prisma.ts`) — prevents connection pool exhaustion
- **Lazy Stripe initialization** — fails clearly if env vars are missing, never uses placeholder keys
- **Centralized PayPal service** (`lib/paypal.ts`) — auth token management in one place
- **Unified checkout** (`/api/checkout`) — single entry point for both Stripe and PayPal flows
- **Server-side price validation** — product prices are always fetched from DB, never trusted from client
- **Hybrid Validation Strategy** — critical flows use Zod, while others maintain native Next.js validation patterns for maximum compatibility.

## Deployment

Automatic via GitHub Actions on push to `main`:

1. Build on GitHub CI
2. Package as tarball
3. Upload via SCP to Hostinger
4. Install production dependencies
5. Seed catalog data
6. Restart via PM2

## Environment Variables

See [`.env.example`](.env.example) for all required configuration.

## License

Proprietary — Barrera Wallpaper © 2024-2026