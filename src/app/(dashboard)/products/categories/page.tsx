import { prisma } from '@/lib/prisma'
import { CategoryManager } from '@/components/products/category-manager'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function CategoriesPage() {
  const categories = await prisma.productCategory.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <Link href="/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product Categories</h1>
        <p className="text-gray-600 mt-1">Organize your products into categories</p>
      </div>

      <CategoryManager categories={categories} />
    </div>
  )
}
