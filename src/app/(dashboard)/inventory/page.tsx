import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { InventoryList } from '@/components/inventory/inventory-list'

export default async function InventoryPage() {
  const materials = await prisma.rawMaterial.findMany({
    select: {
      id: true,
      name: true,
      unit: true,
      currentStock: true,
      minimumStock: true,
      costPerUnit: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Raw Materials</h1>
          <p className="page-copy">Manage your inventory and stock levels</p>
        </div>
        <Link href="/inventory/new">
          <Button data-testid="add-material-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </Link>
      </div>

      <InventoryList materials={materials} />
    </div>
  )
}
