import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { Resend } from 'resend'
import { PurchaseConfirmation } from '@/emails/purchase-confirmation'
import type Stripe from 'stripe'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const body = await request.text() // MUST be .text(), never .json()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
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
      const isPhysical = productType === 'physical'

      // For digital products: generate a download URL
      // In production, this would be a signed, time-limited URL
      const downloadUrl = isPhysical
        ? undefined
        : `${process.env.NEXT_PUBLIC_URL}/api/download/${productSlug}?session_id=${session.id}`

      await resend.emails.send({
        from: 'Maggie Mistal <onboarding@resend.dev>',
        to: [customerEmail],
        subject: 'Your purchase is confirmed!',
        react: PurchaseConfirmation({
          customerName,
          productName: productSlug?.replace(/-/g, ' ') || 'your product',
          downloadUrl,
          isPhysical,
        }),
      })
    }
  }

  return new Response('OK', { status: 200 })
}
