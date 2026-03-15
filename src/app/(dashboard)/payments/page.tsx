import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { PaymentList } from '@/components/payments/payment-list'

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: {
      customer: true,
      order: true,
    },
    orderBy: { paymentDate: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-copy">Track all customer payments</p>
        </div>
        <Link href="/payments/new">
          <Button data-testid="record-payment-button">
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </Link>
      </div>

      <PaymentList payments={payments} />
    </div>
  )
}
