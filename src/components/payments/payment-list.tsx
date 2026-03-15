'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Payment {
  id: string
  amount: number
  paymentDate: Date
  paymentMethod: string
  notes: string | null
  customer: {
    id: string
    name: string
  }
  order: {
    id: string
    orderNumber: string
  } | null
}

interface PaymentListProps {
  payments: Payment[]
}

const methodColors: Record<string, string> = {
  CASH: 'border-emerald-200 bg-emerald-100/80 text-emerald-900',
  UPI: 'border-sky-200 bg-sky-100/80 text-sky-900',
  BANK_TRANSFER: 'border-violet-200 bg-violet-100/80 text-violet-900',
  CARD: 'border-amber-200 bg-amber-100/80 text-amber-900',
}

export function PaymentList({ payments }: PaymentListProps) {
  return (
    <div className="space-y-4">
      {payments.length === 0 ? (
        <Card className="empty-state">
          <div>
            <p className="text-base font-medium text-muted-foreground">No payments recorded yet.</p>
          </div>
        </Card>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>
                  Date
                </th>
                <th>
                  Customer
                </th>
                <th>
                  Order
                </th>
                <th>
                  Amount
                </th>
                <th>
                  Method
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="text-sm text-foreground">
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className="text-sm font-medium text-foreground">
                    {payment.customer.name}
                  </td>
                  <td className="text-sm text-muted-foreground">
                    {payment.order?.orderNumber || '-'}
                  </td>
                  <td className="text-sm font-semibold text-foreground">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="text-sm">
                    <Badge className={methodColors[payment.paymentMethod]}>
                      {payment.paymentMethod.replace('_', ' ')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
