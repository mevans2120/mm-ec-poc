import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/sanity/types'

const productTypeBadgeStyles: Record<Product['productType'], string> = {
  digital: 'bg-primary text-primary-foreground',
  physical: 'bg-secondary text-secondary-foreground',
  bundle: 'bg-primary text-primary-foreground',
}

const productTypeLabels: Record<Product['productType'], string> = {
  digital: 'Digital',
  physical: 'Physical',
  bundle: 'Bundle',
}

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug.current}`} className="group">
      <Card className="h-full transition-shadow hover:shadow-md">
        {/* Image placeholder */}
        <div className="relative mx-6 aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-muted-foreground">
              {productTypeLabels[product.productType]} Product
            </span>
          </div>
          {/* Badge */}
          <span
            className={cn(
              'absolute right-2 top-2 rounded-md px-2 py-0.5 text-xs font-medium',
              productTypeBadgeStyles[product.productType]
            )}
          >
            {productTypeLabels[product.productType]}
          </span>
        </div>

        <CardHeader className="pb-0">
          <CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">
            {product.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        </CardContent>

        <CardFooter>
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
