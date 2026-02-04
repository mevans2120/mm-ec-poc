# Maggie Mistal Ecommerce PoC — Implementation Plan

**Date:** 2026-02-04
**Goal:** Build a working Stripe ecommerce proof-of-concept for Maggie Mistal's digital and physical products
**Location:** `/Users/michaelevans/repos/mm-ec-poc/`

---

## Overview

This plan builds a standalone Next.js app that proves out the full purchase flow: browse products (Sanity) → buy (Stripe Checkout) → receive digital product (Resend email) or trigger physical fulfillment. The PoC validates the pattern before integrating into the main Maggie Mistal website build.

### What "Done" Looks Like

- A customer can browse products on a page
- Clicking "Buy Now" opens Stripe Checkout (hosted redirect)
- After payment, digital customers receive an email with a download link
- Physical product purchases collect a shipping address
- The success page confirms the purchase and shows next steps
- All products are managed in Sanity with Stripe Price IDs as references

---

## Parallel Work Tracks

The PoC has three independent workstreams that can run concurrently. Dependencies are called out explicitly.

```
Track A: Project Setup          Track B: Stripe Config         Track C: Content & Email
─────────────────────           ──────────────────────         ──────────────────────
A1. Scaffold Next.js            B1. Stripe account setup       C1. Sanity project setup
A2. Design system init          B2. Create products/prices     C2. Product schema
A3. Install dependencies        B3. Seed fixture file          C3. Product content entry
A4. Project structure           B4. Stripe MCP setup           C4. Email template
                                                               C5. React Email dev server
        │                              │                              │
        └──────────────┬───────────────┘                              │
                       ▼                                              │
              D. Integration (requires A + B)                         │
              ─────────────────────────────                           │
              D1. Checkout Server Action                              │
              D2. Webhook route handler ◄─────────────────────────────┘
              D3. Success page
              D4. Product pages (requires A + C)
                       │
                       ▼
              E. Testing & Polish
              ────────────────────
              E1. End-to-end purchase test
              E2. Physical product flow
              E3. Error handling
              E4. Deploy to Vercel
```

### What Can Run in Parallel

| Phase | Tracks | Can Parallelize? |
|-------|--------|-----------------|
| Setup | A + B + C | All three simultaneously |
| Integration | D1-D4 | Sequential (each builds on previous) |
| Testing | E1-E4 | E1-E3 parallel, E4 after all pass |

### Agent Parallelization Strategy

When using Claude Code, these tasks can be dispatched to parallel agents:

**Batch 1 (fully independent):**
- Agent 1: Scaffold project, install deps, set up structure (Track A)
- Agent 2: Create Stripe fixture file, document product mapping (Track B)
- Agent 3: Set up Sanity project, create schema, seed content (Track C)

**Batch 2 (after Batch 1 completes):**
- Agent 1: Build checkout action + webhook handler (D1-D2)
- Agent 2: Build product pages + success page (D3-D4)
- Agent 3: Build email template + test delivery (C4-C5)

**Batch 3 (after Batch 2 completes):**
- Single agent: End-to-end testing, error handling, deploy (Track E)

---

## CLI & MCP Efficiency Tools

### Stripe MCP Server (High Impact)

Connect the Stripe MCP server to Claude Code for AI-assisted Stripe operations:

```bash
claude mcp add --transport http stripe https://mcp.stripe.com/
```

**What this enables:**
- Create products and prices directly from Claude Code (no dashboard switching)
- Search Stripe documentation inline while coding
- List and inspect existing resources
- Create payment links for quick testing

**When to use:** During Track B (Stripe config) and Track D (integration debugging).

### Stripe CLI (Essential)

```bash
brew install stripe/stripe-cli/stripe
stripe login
```

| Command | When | Why |
|---------|------|-----|
| `stripe fixtures ./stripe/seed.json` | Track B | Seed all test products in one command |
| `stripe listen --forward-to localhost:3000/api/webhooks/stripe` | Track D | Test webhooks locally without deploying |
| `stripe trigger checkout.session.completed` | Track E | Simulate purchases without using test cards |
| `stripe logs tail` | Track D-E | Debug API calls in real time |
| `stripe products list` | Track B | Verify products were created correctly |

### Vercel CLI (Deployment)

```bash
npm i -g vercel
vercel link
```

| Command | When | Why |
|---------|------|-----|
| `vercel env add STRIPE_SECRET_KEY` | Track A | Set env vars without dashboard |
| `vercel env pull .env.local` | Track A | Pull all env vars to local |
| `vercel deploy` | Track E | Preview deployment for testing |
| `vercel deploy --prod` | Track E | Production deployment |

### React Email Dev Server (Email Templates)

```bash
npm run email:dev  # Opens http://localhost:4000
```

**When to use:** Track C (email template development). Preview templates visually without sending real emails.

### Resend Test Addresses (Email Testing)

| Address | Purpose |
|---------|---------|
| `delivered@resend.dev` | Verify send logic works |
| `bounced@resend.dev` | Test error handling |

**When to use:** Track E (end-to-end testing). No real emails sent, no domain reputation impact.

---

## Detailed Task Breakdown

### Track A: Project Setup

#### A1. Scaffold Next.js Project
```bash
npx create-next-app@latest mm-ec-poc \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --turbopack
```

#### A2. Design System Init
Use the `design-system-init` skill from product-one to establish Maggie's brand tokens:

```css
/* globals.css */
:root {
  --color-primary: 189 64% 69%;      /* Teal #7dd1e1 */
  --color-accent: 0 100% 20%;        /* Burgundy #660000 */
  --color-accent-hover: 2 68% 32%;   /* Burgundy hover #8a201b */
  --color-background: 0 0% 96%;      /* Light gray #f4f4f4 */
  --color-foreground: 0 0% 20%;      /* Body text #333333 */
  --color-surface: 0 0% 100%;        /* White */
}
```

Font: TBD based on design concept selection (Fraunces, DM Sans, or Montserrat).

#### A3. Install Dependencies
```bash
npm install stripe @stripe/stripe-js
npm install next-sanity @sanity/image-url @sanity/vision
npm install resend @react-email/components react-email
npm install react-hook-form @hookform/resolvers zod
npm install sonner
npx shadcn@latest add button card dialog sonner toaster
```

#### A4. Create Project Structure
Create the directory structure as documented in CLAUDE.md.

---

### Track B: Stripe Configuration

#### B1. Stripe Account Setup
- Create Stripe account (or use existing) — test mode
- Generate API keys (publishable + secret)
- Note: Stripe MCP server can accelerate B2-B3

#### B2. Create Products and Prices

**Maggie's product catalog:**

| # | Product | Type | Price | Stripe Tax Code |
|---|---------|------|-------|-----------------|
| 1 | Soul Search Workbook (PDF) | Digital | TBD | `txcd_10000000` |
| 2 | Research Workbook (PDF) | Digital | TBD | `txcd_10000000` |
| 3 | Job Search Workbook (PDF) | Digital | TBD | `txcd_10000000` |
| 4 | 3-Workbook Bundle (PDF) | Digital | TBD | `txcd_10000000` |
| 5 | Five Elements Assessment | Digital | TBD | `txcd_10000000` |
| 6 | Career Empowerment Webinar | Digital | TBD | `txcd_10000000` |
| 7 | How-To Book (ebook) | Digital | TBD | `txcd_10000000` |
| 8 | Physical Workbook Set | Physical | TBD | `txcd_99999999` |

*Prices TBD — currently hidden on Maggie's site. Use placeholder prices ($19.99, $29.99, $49.99, etc.) for PoC.*

#### B3. Create Stripe Fixtures File

```json
// stripe/seed.json
{
  "_meta": { "template_version": 0 },
  "fixtures": [
    {
      "name": "product_soul_search",
      "path": "/v1/products",
      "method": "post",
      "params": {
        "name": "Soul Search Workbook",
        "description": "Digital workbook for career soul searching",
        "metadata": { "type": "digital", "slug": "soul-search-workbook" },
        "tax_code": "txcd_10000000"
      }
    },
    {
      "name": "price_soul_search",
      "path": "/v1/prices",
      "method": "post",
      "params": {
        "product": "${product_soul_search:id}",
        "unit_amount": 1999,
        "currency": "usd",
        "tax_behavior": "exclusive"
      }
    }
    // ... repeat for all 8 products
  ]
}
```

Run with: `stripe fixtures ./stripe/seed.json`

#### B4. Stripe MCP Setup
```bash
claude mcp add --transport http stripe https://mcp.stripe.com/
```
Authenticate and verify connection. Use for product creation and documentation search.

---

### Track C: Content & Email

#### C1. Sanity Project Setup
Use the `sanity-setup` skill from product-one:
- Create Sanity project (or use shared project from main MM build)
- Configure `sanity.config.ts`
- Set up embedded studio at `/studio`
- Configure CORS for localhost

#### C2. Product Schema

```typescript
// sanity/schemas/product.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'description', type: 'text' }),
    defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'price',
      type: 'number',
      description: 'Display price in dollars (e.g., 19.99)'
    }),
    defineField({
      name: 'productType',
      type: 'string',
      options: { list: ['digital', 'physical', 'bundle'] }
    }),
    defineField({
      name: 'stripePriceId',
      type: 'string',
      description: 'Stripe Price ID (from Stripe Dashboard or CLI)'
    }),
    defineField({
      name: 'digitalFile',
      type: 'file',
      description: 'Downloadable file for digital products',
      hidden: ({ parent }) => parent?.productType === 'physical'
    }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'order', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
})
```

#### C3. Seed Product Content
Enter all 8 products into Sanity Studio with:
- Titles, descriptions, images (can use placeholders)
- Display prices
- Stripe Price IDs (from Track B output)
- Product type (digital/physical)
- For digital products: upload sample PDF files

#### C4. Email Template

```tsx
// src/emails/purchase-confirmation.tsx
import { Html, Head, Body, Container, Heading, Text, Button, Section } from '@react-email/components'

interface PurchaseConfirmationProps {
  customerName: string
  productName: string
  downloadUrl?: string  // Only for digital products
  isPhysical: boolean
}

export function PurchaseConfirmation({
  customerName, productName, downloadUrl, isPhysical
}: PurchaseConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Heading>Thank you for your purchase!</Heading>
          <Text>Hi {customerName},</Text>
          <Text>Your purchase of {productName} is confirmed.</Text>
          {!isPhysical && downloadUrl && (
            <Section>
              <Text>Download your product:</Text>
              <Button href={downloadUrl}>Download Now</Button>
              <Text>This link expires in 7 days.</Text>
            </Section>
          )}
          {isPhysical && (
            <Text>Your order will ship within 5-7 business days. We will send tracking information when available.</Text>
          )}
          <Text>— Maggie Mistal</Text>
        </Container>
      </Body>
    </Html>
  )
}
```

#### C5. React Email Dev Server
Add script to `package.json`:
```json
{ "scripts": { "email:dev": "email dev --dir ./src/emails --port 4000" } }
```

---

### Track D: Integration (requires A + B + C)

#### D1. Stripe Client Singleton

```typescript
// src/lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})
```

#### D2. Checkout Server Action

```typescript
// src/app/actions/checkout.ts
'use server'

import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'

export async function createCheckoutSession(formData: FormData) {
  const priceId = formData.get('priceId') as string
  const productType = formData.get('productType') as string
  const productSlug = formData.get('productSlug') as string

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    automatic_tax: { enabled: true },
    metadata: { productSlug, productType },
    success_url: `${process.env.NEXT_PUBLIC_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/products/${productSlug}`,
  }

  if (productType === 'physical') {
    sessionConfig.shipping_address_collection = {
      allowed_countries: ['US', 'CA'],
    }
  }

  const session = await stripe.checkout.sessions.create(sessionConfig)
  redirect(session.url!)
}
```

#### D3. Webhook Route Handler

```typescript
// src/app/api/webhooks/stripe/route.ts
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { Resend } from 'resend'
import { PurchaseConfirmation } from '@/emails/purchase-confirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const body = await request.text()  // MUST be .text(), never .json()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { productSlug, productType } = session.metadata || {}
    const customerEmail = session.customer_details?.email
    const customerName = session.customer_details?.name || 'there'

    if (customerEmail) {
      // For digital products: generate download URL and send email
      // For physical: send confirmation with shipping info
      const isPhysical = productType === 'physical'
      const downloadUrl = isPhysical ? undefined : `${process.env.NEXT_PUBLIC_URL}/api/download/${productSlug}?token=GENERATED_TOKEN`

      await resend.emails.send({
        from: 'Maggie Mistal <noreply@maggiemistal.com>',
        to: [customerEmail],
        subject: `Your purchase is confirmed!`,
        react: PurchaseConfirmation({
          customerName,
          productName: productSlug || 'your product',
          downloadUrl,
          isPhysical,
        }),
      })
    }
  }

  return new Response('OK', { status: 200 })
}
```

#### D4. Product Pages

**Product listing** (`/products`):
- Fetch all products from Sanity, sorted by order
- Render ProductGrid with ProductCards
- Show title, image, price, "Buy Now" button

**Product detail** (`/products/[slug]`):
- Fetch single product from Sanity by slug
- Show full description, image, price
- "Buy Now" form that calls createCheckoutSession Server Action
- Conditional UI for digital vs physical products

**Success page** (`/purchase/success`):
- Retrieve Checkout Session by `session_id` query param
- Show confirmation message
- For digital: display download link immediately
- For physical: show shipping info confirmation

---

### Track E: Testing & Polish

#### E1. End-to-End Purchase Test (Digital)
1. Start dev server: `npm run dev`
2. Start Stripe listener: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Navigate to `/products`
4. Click "Buy Now" on a digital product
5. Complete Stripe Checkout with test card `4242 4242 4242 4242`
6. Verify redirect to success page
7. Verify webhook fires and email sends (check Stripe CLI output + Resend dashboard)

#### E2. End-to-End Purchase Test (Physical)
1. Same as E1, but select a physical product
2. Verify shipping address collection appears in Checkout
3. Verify confirmation email mentions shipping (not download)

#### E3. Error Handling
- Invalid/expired session ID on success page → graceful error
- Webhook signature mismatch → 400 response (verify in Stripe CLI)
- Missing Stripe Price ID in Sanity → disabled buy button with message

#### E4. Deploy to Vercel
1. `vercel link` → create new project
2. Add environment variables:
   ```
   STRIPE_SECRET_KEY
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   STRIPE_WEBHOOK_SECRET (production webhook, not CLI secret)
   NEXT_PUBLIC_SANITY_PROJECT_ID
   NEXT_PUBLIC_SANITY_DATASET
   SANITY_API_TOKEN
   RESEND_API_KEY
   NEXT_PUBLIC_URL
   ```
3. `vercel deploy` → test on preview URL
4. Register production webhook URL in Stripe Dashboard:
   `https://your-domain.vercel.app/api/webhooks/stripe`
5. Test purchase on deployed version
6. `vercel deploy --prod` when verified

---

## Implementation Checklist

### Setup (Track A)
- [ ] Scaffold Next.js project
- [ ] Configure design tokens (globals.css, tailwind.config)
- [ ] Install all dependencies
- [ ] Create directory structure
- [ ] Set up .env.local with placeholder values
- [ ] Initialize git repo

### Stripe (Track B)
- [ ] Set up Stripe test account
- [ ] Connect Stripe MCP server to Claude Code
- [ ] Create all 8 products with prices
- [ ] Write stripe/seed.json fixture file
- [ ] Test fixture seeding: `stripe fixtures ./stripe/seed.json`
- [ ] Document Product → Price ID mapping

### Content (Track C)
- [ ] Create Sanity project
- [ ] Configure embedded studio
- [ ] Create product schema
- [ ] Enter all 8 products in Sanity
- [ ] Map Stripe Price IDs to Sanity documents
- [ ] Build purchase confirmation email template
- [ ] Test email template in React Email dev server

### Integration (Track D)
- [ ] Create Stripe client singleton
- [ ] Build checkout Server Action
- [ ] Build webhook route handler
- [ ] Build product listing page
- [ ] Build product detail page with buy button
- [ ] Build success page with session retrieval
- [ ] Wire up digital delivery (download URL in email)

### Testing (Track E)
- [ ] Test digital product purchase end-to-end
- [ ] Test physical product purchase (shipping address)
- [ ] Test error states (bad session, missing price, failed webhook)
- [ ] Deploy to Vercel preview
- [ ] Register production webhook in Stripe Dashboard
- [ ] Test purchase on deployed preview
- [ ] Run performance audit skill

---

## Open Questions (Resolve Before or During Build)

| # | Question | Impact | Default if No Answer |
|---|----------|--------|---------------------|
| 1 | Does Maggie have an existing Stripe account? | Track B | Create new test account |
| 2 | What are the actual product prices? | Track B, C | Use placeholder prices |
| 3 | Do we have product images/covers? | Track C | Use placeholder images |
| 4 | Do we have the actual workbook PDF files? | Track C, D | Use sample PDFs |
| 5 | Which email domain for Resend? | Track D | Use sandbox `onboarding@resend.dev` |
| 6 | Should the PoC share the Sanity project with the main MM build? | Track C | Create separate project |
| 7 | How-To Book: sell directly or link to Amazon? | Track B | Include in Stripe (can change later) |

---

## Success Criteria

The PoC is complete when:

1. **Browse**: A product listing page shows all 8 products from Sanity
2. **Buy (digital)**: Clicking "Buy Now" → Stripe Checkout → success page + email with download link
3. **Buy (physical)**: Same flow but Checkout collects shipping address, email confirms shipment
4. **Manage**: Products are editable in Sanity Studio (title, price, image, description)
5. **Deploy**: Working on Vercel with production webhook registered
6. **Repeatable**: Stripe fixture file can seed a fresh test account in one command

---

## What This PoC Does NOT Include

Intentionally deferred to the main Maggie Mistal build:

- User accounts / login
- Order history / re-download page
- Cart / multi-item checkout
- Subscription billing (Mastermind)
- Stripe Tax registration and filing
- Embedded checkout (uses hosted redirect)
- Full brand styling (uses basic tokens)
- SEO optimization
- Blog, services, booking, and other non-ecommerce pages

---

## Integration Path to Main Build

Once the PoC is validated, the ecommerce code ports into the main Maggie Mistal project:

1. Copy `sanity/schemas/product.ts` → main project schemas
2. Copy `src/app/actions/checkout.ts` → main project actions
3. Copy `src/app/api/webhooks/stripe/route.ts` → main project API routes
4. Copy `src/emails/purchase-confirmation.tsx` → main project emails
5. Adapt product pages to match the main site's design system
6. Add Stripe env vars to the main project's Vercel config
7. Register the main project's webhook URL in Stripe Dashboard

The Sanity product schema and Stripe integration code are designed to be portable.
