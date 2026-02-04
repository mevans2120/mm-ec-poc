# Maggie Mistal Ecommerce PoC - Claude Instructions

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Maggie Mistal Ecommerce PoC** is a proof-of-concept for selling physical and digital products using Stripe Checkout, built as a standalone Next.js app that validates the ecommerce pattern before integrating into the main Maggie Mistal website.

**Client:** Maggie Mistal (maggiemistal.com)
**Type:** Ecommerce PoC (digital + physical products)
**Status:** Development
**Related Projects:**
- `/Users/michaelevans/maggie-mistal/` — Main website project (planning phase)
- `/Users/michaelevans/repos/product-one/` — Skills, research, and platform docs

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui (minimal: button, card, dialog, sonner, toaster) |
| CMS | Sanity (product catalog content) |
| Payments | Stripe (Checkout Sessions + webhooks) |
| Email | Resend + React Email |
| Deployment | Vercel |
| Package Manager | npm |

## Development Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run lint             # Run ESLint

# Stripe
stripe listen --forward-to localhost:3000/api/webhooks/stripe  # Forward webhooks locally
stripe trigger checkout.session.completed                       # Test webhook handler
stripe fixtures ./stripe/seed.json                              # Seed test products

# Email templates
npm run email:dev        # Preview email templates (http://localhost:4000)

# Sanity
# Studio available at http://localhost:3000/studio
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage (product listing)
│   ├── products/
│   │   └── [slug]/
│   │       └── page.tsx         # Product detail + buy button
│   ├── purchase/
│   │   └── success/
│   │       └── page.tsx         # Post-purchase confirmation + download
│   ├── api/
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts     # Stripe webhook handler
│   ├── studio/
│   │   └── [[...index]]/
│   │       └── page.tsx         # Embedded Sanity Studio
│   └── actions/
│       └── checkout.ts          # Server Action: create Checkout Session
├── components/
│   ├── ui/                      # shadcn/ui components (minimal set)
│   ├── ProductCard.tsx          # Product display card
│   ├── ProductGrid.tsx          # Product listing grid
│   └── BuyButton.tsx            # Purchase CTA button
├── lib/
│   ├── stripe.ts                # Stripe client singleton
│   ├── sanity/
│   │   ├── client.ts            # Sanity client
│   │   └── queries.ts           # GROQ queries
│   └── utils.ts                 # Helpers (cn, etc.)
├── emails/
│   └── purchase-confirmation.tsx # React Email template
└── hooks/

sanity/
├── schemas/
│   ├── product.ts               # Product document type
│   └── index.ts                 # Schema registry
└── lib/

stripe/
├── seed.json                    # Stripe fixtures for seeding test products
└── products.ts                  # Product-to-Stripe mapping helpers
```

## Sanity CMS

**Project ID:** TBD (create during setup)
**Dataset:** production
**Studio:** http://localhost:3000/studio

### Content Types
- **Product** — Digital/physical products with title, description, image, price, type, Stripe Price ID, and optional downloadable file

### Key Files
- `sanity.config.ts` — Studio configuration
- `src/lib/sanity/client.ts` — Sanity client
- `src/lib/sanity/queries.ts` — GROQ queries
- `sanity/schemas/product.ts` — Product schema

## Stripe Integration

### Architecture
- **Products/Prices** created in Stripe Dashboard or via CLI fixtures
- **Stripe Price IDs** stored in Sanity product documents
- **Checkout** via Server Action → Stripe Checkout Session (hosted redirect)
- **Fulfillment** via webhook handler on `checkout.session.completed`
- **Digital delivery** via Resend email with signed download URL
- **Physical products** collect shipping address via Checkout config

### Key Patterns

**Checkout Session creation (Server Action, not API route):**
```typescript
'use server'
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{ price: priceId, quantity: 1 }],
  automatic_tax: { enabled: true },
  // Add shipping_address_collection for physical products
  success_url: `${process.env.NEXT_PUBLIC_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_URL}/products`,
})
```

**Webhook signature verification (always use request.text(), never .json()):**
```typescript
const body = await request.text()
const event = stripe.webhooks.constructEvent(body, sig, secret)
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...        # From `stripe listen` output
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=...                    # Read token for preview
RESEND_API_KEY=re_...
NEXT_PUBLIC_URL=http://localhost:3000   # Base URL for redirects
```

## Code Conventions

### Naming
- **Components:** PascalCase (`ProductCard.tsx`)
- **Utilities:** camelCase (`utils.ts`)
- **Server Actions:** camelCase in `actions/` directory (`checkout.ts`)
- **Schemas:** camelCase (`product.ts`)

### Styling
- Use Tailwind CSS utility classes
- Use `cn()` from `@/lib/utils` for conditional classes
- Follow design tokens in `globals.css`
- Maggie's brand colors:
  - Primary Teal: `#7dd1e1`
  - Burgundy: `#660000`
  - Light Gray: `#f4f4f4`
  - Body Text: `#333333`

### TypeScript
- Strict mode enabled
- Prefer interfaces for object types
- Use type imports: `import type { ... }`

### Anti-Patterns
- Do NOT use hardcoded colors in components (use CSS variables)
- Do NOT use `request.json()` in webhook handlers (use `request.text()`)
- Do NOT store Stripe secret keys in `NEXT_PUBLIC_` variables
- Do NOT skip webhook signature verification
- Do NOT use Lemon Squeezy (project uses Stripe — see research in product-one)

## CLI & MCP Tools

### Stripe CLI
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe  # Webhooks
stripe trigger checkout.session.completed                       # Test events
stripe fixtures ./stripe/seed.json                              # Seed data
stripe products list                                            # Check products
stripe logs tail                                                # Debug API calls
```

### Stripe MCP Server
Connected via Claude Code for AI-assisted Stripe operations:
```bash
claude mcp add --transport http stripe https://mcp.stripe.com/
```
Enables: creating products/prices, searching docs, managing test data directly from Claude Code.

### Vercel CLI
```bash
vercel link                    # Link to Vercel project
vercel env pull .env.local     # Pull env vars
vercel deploy                  # Preview deploy
vercel deploy --prod           # Production deploy
```

## Skills & Workflows

**IMPORTANT: Use product-one skills when the task matches their purpose.**

| Skill | When to Use |
|-------|-------------|
| `design-system-init` | Setting up initial styles/tokens |
| `sanity-setup` | Configuring Sanity CMS |
| `cms-verify` | Before declaring products "done" |
| `performance-audit` | Before any deployment meant for review |

## Planning vs Implementation

### When Asked to "Plan"
- Create the plan document
- Do NOT implement anything
- Wait for explicit approval

### Clear Implementation Signals
- "Proceed with implementation"
- "Start building"
- "Let's code this"

### When in Doubt
Ask: "Would you like me to proceed with implementation?"

## Git Workflow

### Commits
```bash
git commit -m "feat: description

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### What NOT to Commit
- `.env` / `.env.local`
- `node_modules/`
- `.next/`
- Stripe secret keys

## Documentation

All project documentation lives in `docs/`. Check there for plans, research, and decisions.

Related research in product-one:
- `docs/research/ecommerce-poc-lemon-squeezy-vs-stripe.md` — Platform comparison and architecture
- `docs/research/projects-comparison.md` — Cross-project patterns

## Quick Reference

| Need | Command/Location |
|------|------------------|
| Start dev | `npm run dev` |
| Stripe webhooks | `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
| Seed Stripe data | `stripe fixtures ./stripe/seed.json` |
| Test purchase | `stripe trigger checkout.session.completed` |
| Preview emails | `npm run email:dev` |
| Sanity Studio | http://localhost:3000/studio |
| Add component | `src/components/` |
| Add page | `src/app/[route]/page.tsx` |
| Add schema | `sanity/schemas/` |
| Design tokens | `src/app/globals.css` |
| Documentation | `docs/` |
