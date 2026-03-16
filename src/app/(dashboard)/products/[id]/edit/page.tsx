import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/products/product-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getProductCategoryOptions } from '@/lib/data'

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        sku: true,
        description: true,
        categoryId: true,
        sellingPrice: true,
        costPrice: true,
        currentStock: true,
        lowStockAlert: true,
        isActive: true,
        notes: true,
        variants: {
          select: {
            id: true,
            variantType: true,
            variantValue: true,
            sku: true,
            price: true,
            stock: true,
          },
        },
      },
    }),
    getProductCategoryOptions(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/products">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="page-title">Edit Product</h1>
        <p className="page-copy">Update product details</p>
      </div>

      <ProductForm product={product} categories={categories} />
    </div>
  )
}
