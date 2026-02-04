export interface Product {
  _id: string
  title: string
  slug: { current: string }
  description: string
  image?: {
    asset: { _ref: string }
    hotspot?: { x: number; y: number }
  }
  price: number
  productType: 'digital' | 'physical' | 'bundle'
  stripePriceId: string
  featured: boolean
  digitalFileUrl?: string
}
