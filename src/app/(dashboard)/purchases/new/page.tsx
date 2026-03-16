import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PurchaseForm } from '@/components/purchases/purchase-form'
import { Button } from '@/components/ui/button'
import { getPurchaseFormData } from '@/lib/data'

export default async function NewPurchasePage() {
  const { suppliers, materials, orders } = await getPurchaseFormData()

  return (
    <div className="space-y-5">
      <div>
        <Link href="/purchases">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Purchases
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="page-title">Create New Purchase</h1>
        <p className="page-copy">Record raw material purchases and update stock levels</p>
      </div>

      <PurchaseForm suppliers={suppliers} materials={materials} orders={orders} />
    </div>
  )
}
