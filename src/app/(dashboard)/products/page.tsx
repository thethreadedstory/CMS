import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ProductList } from '@/components/products/product-list'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string }
}) {
  const search = searchParams.search || ''
  const categoryFilter = searchParams.category || ''

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { sku: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
          categoryFilter ? { categoryId: categoryFilter } : {},
        ],
      },
      include: {
        category: true,
        variants: true,
        _count: {
          select: { orderItems: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.productCategory.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-copy">Manage your product catalog</p>
        </div>
        <div className="flex gap-3">
          <Link href="/products/categories">
            <Button variant="outline" data-testid="manage-categories-button">
              Manage Categories
            </Button>
          </Link>
          <Link href="/products/new">
            <Button data-testid="add-product-button">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <ProductList
        products={products}
        categories={categories}
        initialSearch={search}
        initialCategory={categoryFilter}
      />
    </div>
  )
}
