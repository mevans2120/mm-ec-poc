export interface ProductMapping {
  slug: string
  name: string
  type: 'digital' | 'physical' | 'bundle'
  description: string
}

export const products: ProductMapping[] = [
  {
    slug: 'soul-search-workbook',
    name: 'Soul Search Workbook',
    type: 'digital',
    description: 'Digital workbook for career soul searching',
  },
  {
    slug: 'research-workbook',
    name: 'Research Workbook',
    type: 'digital',
    description: 'Digital workbook for career research',
  },
  {
    slug: 'job-search-workbook',
    name: 'Job Search Workbook',
    type: 'digital',
    description: 'Digital workbook for job searching',
  },
  {
    slug: 'workbook-bundle',
    name: '3-Workbook Bundle',
    type: 'bundle',
    description: 'Bundle of all three digital workbooks',
  },
  {
    slug: 'five-elements-assessment',
    name: 'Five Elements Assessment',
    type: 'digital',
    description: 'Digital career assessment based on the Five Elements framework',
  },
  {
    slug: 'career-empowerment-webinar',
    name: 'Career Empowerment Webinar',
    type: 'digital',
    description: 'Digital webinar on career empowerment strategies',
  },
  {
    slug: 'how-to-book',
    name: 'How-To Book (ebook)',
    type: 'digital',
    description: 'Digital ebook with practical career guidance',
  },
  {
    slug: 'physical-workbook-set',
    name: 'Physical Workbook Set',
    type: 'physical',
    description: 'Printed set of career workbooks shipped to your door',
  },
]

export function getProductBySlug(slug: string): ProductMapping | undefined {
  return products.find((p) => p.slug === slug)
}
