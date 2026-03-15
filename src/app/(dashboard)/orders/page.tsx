import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { OrderList } from '@/components/orders/order-list'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { 
    search?: string
    status?: string
    payment?: string
  }
}) {
  const search = searchParams.search || ''
  const statusFilter = searchParams.status || ''
  const paymentFilter = searchParams.payment || ''

  const orders = await prisma.order.findMany({
    where: {
      AND: [
        search ? { orderNumber: { contains: search, mode: 'insensitive' } } : {},
        statusFilter ? { orderStatus: statusFilter as any } : {},
        paymentFilter ? { paymentStatus: paymentFilter as any } : {},
      ],
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
      _count: {
        select: { payments: true },
      },
    },
    orderBy: { orderDate: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage customer orders and fulfillment</p>
        </div>
        <Link href="/orders/new">
          <Button data-testid="create-order-button">
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </Link>
      </div>

      <OrderList
        orders={orders}
        initialSearch={search}
        initialStatus={statusFilter}
        initialPayment={paymentFilter}
      />
    </div>
  )
}
