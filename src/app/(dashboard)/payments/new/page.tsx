import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaymentForm } from '@/components/payments/payment-form'
import { prisma } from '@/lib/prisma'

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: {
    orderId?: string
  }
}) {
  const requestedOrderId = searchParams.orderId || ''

  const [customers, orders] = await Promise.all([
    prisma.customer.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.order.findMany({
      where: {
        pendingAmount: {
          gt: 0,
        },
      },
      select: {
        id: true,
        orderNumber: true,
        customerId: true,
        pendingAmount: true,
      },
      orderBy: { orderDate: 'desc' },
    }),
  ])

  const linkedOrder = requestedOrderId
    ? orders.find((order) => order.id === requestedOrderId)
    : null

  return (
    <div className="space-y-5">
      <div>
        <Link href="/payments" replace>
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payments
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="page-title">Record Payment</h1>
        <p className="page-copy">Capture customer payments and keep order balances up to date.</p>
      </div>

      <PaymentForm
        customers={customers}
        orders={orders}
        initialCustomerId={linkedOrder?.customerId}
        initialOrderId={linkedOrder?.id}
      />
    </div>
  )
}
