import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { InventoryList } from '@/components/inventory/inventory-list'

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const search = searchParams.search || ''

  const materials = await prisma.rawMaterial.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { unit: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    select: {
      id: true,
      name: true,
      unit: true,
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Raw Materials</h1>
          <p className="page-copy">Manage material names and units</p>
        </div>
        <Link href="/inventory/new">
          <Button data-testid="add-material-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </Link>
      </div>

      <InventoryList materials={materials} initialSearch={search} />
    </div>
  )
}
