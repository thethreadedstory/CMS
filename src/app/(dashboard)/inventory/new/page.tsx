import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { MaterialForm } from '@/components/inventory/material-form'
import { Button } from '@/components/ui/button'

export default async function NewMaterialPage() {
  const [categories, suppliers] = await Promise.all([
    prisma.rawMaterialCategory.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.supplier.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="space-y-5">
      <div>
        <Link href="/inventory">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Raw Materials
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="page-title">Add New Raw Material</h1>
        <p className="page-copy">Enter inventory details below</p>
      </div>

      <MaterialForm categories={categories} suppliers={suppliers} />
    </div>
  )
}
