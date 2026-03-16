'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
          <Table>
            <TableHeader className="bg-[hsl(var(--surface-soft))]">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-sm text-foreground">
                    {formatDate(payment.paymentDate)}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground">
                    {payment.customer.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {payment.order?.orderNumber || '-'}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-foreground">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <Badge className={methodColors[payment.paymentMethod]}>
                      {payment.paymentMethod.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
