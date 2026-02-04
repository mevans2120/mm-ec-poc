/**
 * Seed Sanity with product data
 *
 * Usage:
 *   npx tsx scripts/seed-sanity.ts
 *
 * Requires SANITY_API_TOKEN with write access in .env.local
 */

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

interface ProductSeed {
  title: string
  slug: string
  description: string
  price: number
  productType: 'digital' | 'physical' | 'bundle'
  stripePriceId: string
  featured: boolean
  order: number
}

const products: ProductSeed[] = [
  {
    title: 'Soul Search Workbook',
    slug: 'soul-search-workbook',
    description:
      'A comprehensive digital workbook to help you discover your true career calling. Explore your values, passions, and strengths through guided exercises and reflective prompts.',
    price: 19.99,
    productType: 'digital',
    stripePriceId: 'price_1SxDnEAUnkaWZ0lgCqtsgn86',
    featured: true,
    order: 1,
  },
  {
    title: 'Research Workbook',
    slug: 'research-workbook',
    description:
      'Learn how to research career paths, industries, and companies effectively. This workbook provides frameworks and templates for gathering the information you need to make informed career decisions.',
    price: 19.99,
    productType: 'digital',
    stripePriceId: 'price_1SxDnFAUnkaWZ0lgZcslueNF',
    featured: false,
    order: 2,
  },
  {
    title: 'Job Search Workbook',
    slug: 'job-search-workbook',
    description:
      'Your complete guide to landing your dream job. Covers resume writing, networking strategies, interview preparation, and salary negotiation tactics.',
    price: 19.99,
    productType: 'digital',
    stripePriceId: 'price_1SxDnFAUnkaWZ0lgHwAxFPB4',
    featured: false,
    order: 3,
  },
  {
    title: '3-Workbook Bundle',
    slug: 'workbook-bundle',
    description:
      'Get all three workbooks at a discounted price! Includes Soul Search, Research, and Job Search workbooks — everything you need for a complete career transformation.',
    price: 49.99,
    productType: 'bundle',
    stripePriceId: 'price_1SxDnGAUnkaWZ0lgSYpww40z',
    featured: true,
    order: 4,
  },
  {
    title: 'Five Elements Assessment',
    slug: 'five-elements-assessment',
    description:
      'Discover your unique career personality through this interactive assessment based on the Five Elements framework. Receive personalized insights and career recommendations.',
    price: 29.99,
    productType: 'digital',
    stripePriceId: 'price_1SxDnGAUnkaWZ0lgBZsJv1JL',
    featured: true,
    order: 5,
  },
  {
    title: 'Career Empowerment Webinar',
    slug: 'career-empowerment-webinar',
    description:
      'A recorded 90-minute masterclass on taking control of your career. Learn proven strategies for career advancement, work-life balance, and professional fulfillment.',
    price: 39.99,
    productType: 'digital',
    stripePriceId: 'price_1SxDnHAUnkaWZ0lgjOZcfyLk',
    featured: false,
    order: 6,
  },
  {
    title: 'How-To Book (ebook)',
    slug: 'how-to-book',
    description:
      "Maggie Mistal's complete guide to career change and fulfillment. This ebook distills decades of coaching experience into actionable advice you can implement today.",
    price: 14.99,
    productType: 'digital',
    stripePriceId: 'price_1SxDnHAUnkaWZ0lgKmG4xhQ9',
    featured: false,
    order: 7,
  },
  {
    title: 'Physical Workbook Set',
    slug: 'physical-workbook-set',
    description:
      'Premium printed versions of all three workbooks, shipped directly to your door. Perfect for those who prefer pen and paper for their career exploration journey.',
    price: 59.99,
    productType: 'physical',
    stripePriceId: 'price_1SxDnIAUnkaWZ0lgBi4Heycp',
    featured: false,
    order: 8,
  },
]

async function seedProducts() {
  console.log('🌱 Seeding Sanity products...\n')

  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ SANITY_API_TOKEN is required in .env.local')
    console.error('   Create a token at: https://www.sanity.io/manage/project/cry0jfo9/api#tokens')
    process.exit(1)
  }

  for (const product of products) {
    const doc = {
      _type: 'product',
      _id: `product-${product.slug}`, // Deterministic ID for upsert
      title: product.title,
      slug: { _type: 'slug', current: product.slug },
      description: product.description,
      price: product.price,
      productType: product.productType,
      stripePriceId: product.stripePriceId,
      featured: product.featured,
      order: product.order,
    }

    try {
      const result = await client.createOrReplace(doc)
      console.log(`✓ ${product.title} (${result._id})`)
    } catch (error) {
      console.error(`✗ Failed to create ${product.title}:`, error)
    }
  }

  console.log('\n✅ Done! Products are now available in Sanity.')
  console.log('   View them at: http://localhost:3000/studio')
}

seedProducts()
