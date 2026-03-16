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
  const material = await prisma.rawMaterial.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      unit: true,
    },
  })

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
        <p className="page-copy">Update the material name and unit</p>
      </div>

      <MaterialForm material={material} />
    </div>
  )
}
