import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { PurchaseList } from '@/components/purchases/purchase-list'

export default async function PurchasesPage() {
  const purchases = await prisma.rawMaterialPurchase.findMany({
    select: {
      id: true,
      purchaseNumber: true,
      purchaseDate: true,
      totalAmount: true,
      paymentStatus: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: { purchaseDate: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Purchases</h1>
          <p className="page-copy">Manage raw material purchases</p>
        </div>
        <Link href="/purchases/new">
          <Button data-testid="create-purchase-button">
            <Plus className="h-4 w-4 mr-2" />
            New Purchase
          </Button>
        </Link>
      </div>

      <PurchaseList purchases={purchases} />
    </div>
  )
}
