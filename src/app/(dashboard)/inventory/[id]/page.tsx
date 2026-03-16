import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Edit } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function MaterialDetailPage({
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/inventory">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Raw Materials
          </Button>
        </Link>
        <Link href={`/inventory/${material.id}/edit`}>
          <Button data-testid="edit-material-button">
            <Edit className="mr-2 h-4 w-4" />
            Edit Material
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">{material.name}</h1>
          <p className="page-copy">{material.unit}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Material Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Material Name</span>
            <span className="font-medium text-foreground">{material.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Unit</span>
            <span className="font-medium text-foreground">{material.unit}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
