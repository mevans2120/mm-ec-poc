import Link from 'next/link'
import { stripe } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function PurchaseSuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams

  if (!session_id) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Invalid Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No checkout session was found. If you completed a purchase, check
              your email for confirmation.
            </p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  let session
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'line_items.data.price.product'],
    })
  } catch {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We could not retrieve your checkout session. If you completed a
              purchase, check your email for confirmation details.
            </p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  const customerName = session.customer_details?.name ?? 'there'
  const productType = session.metadata?.productType ?? 'digital'
  const productSlug = session.metadata?.productSlug

  const lineItem = session.line_items?.data[0]
  const productName =
    lineItem?.price?.product &&
    typeof lineItem.price.product === 'object' &&
    'name' in lineItem.price.product
      ? lineItem.price.product.name
      : 'your product'

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Thank you, {customerName}!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Your purchase of <span className="font-semibold text-foreground">{productName}</span> was
            successful.
          </p>

          {productType === 'digital' && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="mb-3 text-sm font-medium text-foreground">
                Your digital product is ready
              </p>
              <p className="text-sm text-muted-foreground">
                Check your email for the download link. You can also access it
                from the link below.
              </p>
              {productSlug && (
                <Button asChild variant="outline" className="mt-4">
                  <Link href={`/products/${productSlug}`}>View Product</Link>
                </Button>
              )}
            </div>
          )}

          {productType === 'physical' && (
            <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-4">
              <p className="mb-2 text-sm font-medium text-foreground">
                Shipping Confirmation
              </p>
              <p className="text-sm text-muted-foreground">
                Your order is being prepared. You will receive a shipping
                confirmation email with tracking information once your item has
                shipped.
              </p>
            </div>
          )}

          {productType === 'bundle' && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="mb-2 text-sm font-medium text-foreground">
                Bundle Purchase
              </p>
              <p className="text-sm text-muted-foreground">
                Digital items are available immediately via your email. Physical
                items will ship separately with tracking information.
              </p>
            </div>
          )}

          <Button asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
