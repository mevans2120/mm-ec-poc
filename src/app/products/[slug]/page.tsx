import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '@/lib/sanity/client'
import { productBySlugQuery } from '@/lib/sanity/queries'
import { BuyButton } from '@/components/BuyButton'
import type { Product } from '@/lib/sanity/types'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

const productTypeLabels: Record<Product['productType'], string> = {
  digital: 'Digital',
  physical: 'Physical',
  bundle: 'Bundle',
}

const productTypeBadgeStyles: Record<Product['productType'], string> = {
  digital: 'bg-primary text-primary-foreground',
  physical: 'bg-secondary text-secondary-foreground',
  bundle: 'bg-primary text-primary-foreground',
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await client.fetch<Product | null>(productBySlugQuery, { slug })

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: `${product.title} | Maggie Mistal`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await client.fetch<Product | null>(productBySlugQuery, { slug })

  if (!product) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Image / Placeholder */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          <div className="flex h-full items-center justify-center">
            <span className="text-lg text-muted-foreground">
              {productTypeLabels[product.productType]} Product
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          {/* Badge */}
          <span
            className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-medium ${productTypeBadgeStyles[product.productType]}`}
          >
            {productTypeLabels[product.productType]}
          </span>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {product.title}
          </h1>

          <p className="text-2xl font-bold text-foreground">
            ${product.price.toFixed(2)}
          </p>

          <p className="text-base leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <BuyButton
            priceId={product.stripePriceId}
            productType={product.productType}
            productSlug={product.slug.current}
            price={product.price}
          />
        </div>
      </div>
    </main>
  )
}
