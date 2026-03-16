import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { MaterialForm } from '@/components/inventory/material-form'
import { Button } from '@/components/ui/button'

export default async function EditMaterialPage({
  params,
}: {
  params: { id: string }
}) {
  const [material, categories, suppliers] = await Promise.all([
    prisma.rawMaterial.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        categoryId: true,
        supplierId: true,
        unit: true,
        currentStock: true,
        minimumStock: true,
        costPerUnit: true,
        notes: true,
      },
    }),
    prisma.rawMaterialCategory.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.supplier.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    }),
  ])

  if (!material) {
    notFound()
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/inventory" replace>
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Raw Materials
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="page-title">Edit Material</h1>
        <p className="page-copy">Update raw material details</p>
      </div>

      <MaterialForm material={material} categories={categories} suppliers={suppliers} />
    </div>
  )
}
