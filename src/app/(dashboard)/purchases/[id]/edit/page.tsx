import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getPurchaseFormData } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { PurchaseForm } from '@/components/purchases/purchase-form'

export default async function EditPurchasePage({
  params,
}: {
  params: { id: string }
}) {
  const [purchase, { suppliers, materials }] = await Promise.all([
    prisma.rawMaterialPurchase.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        purchaseNumber: true,
        supplierId: true,
        purchaseDate: true,
        paymentStatus: true,
        notes: true,
        items: {
          select: {
            materialId: true,
            quantity: true,
            costPerUnit: true,
          },
        },
      },
    }),
    getPurchaseFormData(),
  ])

  if (!purchase) {
    notFound()
  }

  const initialData = {
    supplierId: purchase.supplierId ?? '',
    purchaseDate: purchase.purchaseDate.toISOString().split('T')[0],
    paymentStatus: purchase.paymentStatus,
    notes: purchase.notes ?? '',
    items: purchase.items.map((item) => ({
      materialId: item.materialId,
      quantity: item.quantity,
      costPerUnit: item.costPerUnit,
    })),
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/purchases" replace>
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Purchases
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="page-title">Edit Purchase</h1>
        <p className="page-copy">Update details for {purchase.purchaseNumber}</p>
      </div>

      <PurchaseForm
        purchaseId={purchase.id}
        suppliers={suppliers}
        materials={materials}
        initialData={initialData}
      />
    </div>
  )
}
