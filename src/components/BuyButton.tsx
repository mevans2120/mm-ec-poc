'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { createCheckoutSession } from '@/app/actions/checkout'

function SubmitButton({ price, disabled }: { price: number; disabled: boolean }) {
  const { pending } = useFormStatus()

  if (disabled) {
    return (
      <Button size="lg" disabled className="w-full">
        Coming Soon
      </Button>
    )
  }

  return (
    <Button size="lg" type="submit" disabled={pending} className="w-full">
      {pending ? 'Redirecting...' : `Buy Now — $${price.toFixed(2)}`}
    </Button>
  )
}

interface BuyButtonProps {
  priceId: string
  productType: string
  productSlug: string
  price: number
}

export function BuyButton({ priceId, productType, productSlug, price }: BuyButtonProps) {
  const disabled = !priceId

  return (
    <form action={createCheckoutSession}>
      <input type="hidden" name="priceId" value={priceId ?? ''} />
      <input type="hidden" name="productType" value={productType} />
      <input type="hidden" name="productSlug" value={productSlug} />
      <SubmitButton price={price} disabled={disabled} />
    </form>
  )
}
