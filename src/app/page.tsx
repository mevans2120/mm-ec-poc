import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { allProductsQuery } from '@/lib/sanity/queries'
import { ProductGrid } from '@/components/ProductGrid'
import type { Product } from '@/lib/sanity/types'

export default async function HomePage() {
  let products: Product[] = []

  try {
    products = await client.fetch<Product[]>(allProductsQuery)
  } catch {
    // Sanity may not be configured yet
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Ecommerce PoC
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          A proof of concept for selling digital and physical products with
          Stripe Checkout, Sanity CMS, and Resend.
        </p>
      </section>

      {/* Products */}
      <section>
        <h2 className="mb-8 text-2xl font-semibold text-foreground">Products</h2>
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h3 className="mb-2 text-lg font-medium text-foreground">
              No products found
            </h3>
            <p className="text-sm text-muted-foreground">
              Products will appear here once they are added in Sanity Studio.
              Visit{' '}
              <Link
                href="/studio"
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              >
                /studio
              </Link>{' '}
              to create your first product.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
