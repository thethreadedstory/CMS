import { OrderForm } from '@/components/orders/order-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getOrderFormData } from '@/lib/data'

export default async function NewOrderPage() {
  const { customers, products } = await getOrderFormData()

  return (
    <div className="space-y-5">
      <div>
        <Link href="/orders" replace>
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="page-title">Create New Order</h1>
        <p className="page-copy">Fill in the order details below</p>
      </div>

      <OrderForm customers={customers} products={products} />
    </div>
  )
}
