import { groq } from 'next-sanity'

export const allProductsQuery = groq`
  *[_type == "product"] | order(order asc) {
    _id,
    title,
    slug,
    description,
    image,
    price,
    productType,
    stripePriceId,
    featured,
    "digitalFileUrl": digitalFile.asset->url
  }
`

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    image,
    price,
    productType,
    stripePriceId,
    featured,
    "digitalFileUrl": digitalFile.asset->url
  }
`
