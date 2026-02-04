# Maggie Mistal Ecommerce PoC

Proof-of-concept for selling digital and physical products using Stripe Checkout, built with Next.js 15 (App Router), Sanity CMS, and Resend.

## Purpose

Validates the full purchase flow before integrating into the main [Maggie Mistal website](https://maggiemistal.com) redesign:

- Browse products (managed in Sanity)
- Buy via Stripe Checkout (hosted redirect)
- Receive digital product via email (Resend) or trigger physical fulfillment

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| CMS | Sanity |
| Payments | Stripe (Checkout Sessions + Webhooks) |
| Email | Resend + React Email |
| Deployment | Vercel |

## Product Catalog

| Product | Type |
|---------|------|
| Soul Search Workbook | Digital (PDF) |
| Research Workbook | Digital (PDF) |
| Job Search Workbook | Digital (PDF) |
| 3-Workbook Bundle | Digital (PDF) |
| Five Elements Assessment | Digital |
| Career Empowerment Webinar | Digital (Video) |
| How-To Book | Digital (ebook) |
| Physical Workbook Set | Physical (shipped) |

## Architecture

```
Sanity (product content) → Next.js (display) → Stripe Checkout (payment)
                                                       │
                                                       ▼
                                                Stripe Webhook
                                                       │
                                    ┌──────────────────┼──────────────────┐
                                    ▼                                     ▼
                            Digital Delivery                     Physical Fulfillment
                          (Resend email w/ link)              (shipping notification)
```

## Development

```bash
npm run dev                # Start dev server (localhost:3000)
npm run build              # Production build
npm run email:dev          # Preview email templates (localhost:4000)
```

### Stripe CLI (local webhook testing)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
stripe fixtures ./stripe/seed.json
```

## Documentation

- [`CLAUDE.md`](./CLAUDE.md) — Claude Code project instructions
- [`docs/implementation-plan.md`](./docs/implementation-plan.md) — Detailed build plan with parallel work tracks

## Related Projects

- [product-one](https://github.com/mevans2120/product-one) — Skills, research, and platform docs
