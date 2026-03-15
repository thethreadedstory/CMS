import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { InventoryList } from '@/components/inventory/inventory-list'

export default async function InventoryPage() {
  const [materials, categories] = await Promise.all([
    prisma.rawMaterial.findMany({
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.rawMaterialCategory.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Raw Materials</h1>
          <p className="text-gray-600 mt-1">Manage your inventory and stock levels</p>
        </div>
        <Link href="/inventory/new">
          <Button data-testid="add-material-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </Link>
      </div>

      <InventoryList materials={materials} categories={categories} />
    </div>
  )
}
