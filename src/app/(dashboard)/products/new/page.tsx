import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/products/product-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewProductPage() {
  const categories = await prisma.productCategory.findMany({
    orderBy: { name: 'asc' },
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
        <h1 className="page-title">Add New Product</h1>
        <p className="page-copy">Enter product details below</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  )
}
