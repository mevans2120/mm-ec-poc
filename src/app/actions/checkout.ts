'use server'

import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'

export async function createCheckoutSession(formData: FormData) {
  const priceId = formData.get('priceId') as string
  const productType = formData.get('productType') as string
  const productSlug = formData.get('productSlug') as string

  if (!priceId) {
    throw new Error('Price ID is required')
  }

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { productSlug, productType },
    success_url: `${process.env.NEXT_PUBLIC_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/products/${productSlug}`,
  }

  // Collect shipping address for physical products
  if (productType === 'physical') {
    sessionConfig.shipping_address_collection = {
      allowed_countries: ['US', 'CA'],
    }
  }

  const session = await stripe.checkout.sessions.create(sessionConfig)
  redirect(session.url!)
}
