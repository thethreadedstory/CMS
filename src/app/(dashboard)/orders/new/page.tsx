import { prisma } from '@/lib/prisma'
import { OrderForm } from '@/components/orders/order-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewOrderPage() {
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="space-y-5">
      <div>
        <Link href="/orders">
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
