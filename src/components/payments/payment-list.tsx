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
  CASH: 'bg-green-100 text-green-800',
  UPI: 'bg-blue-100 text-blue-800',
  BANK_TRANSFER: 'bg-purple-100 text-purple-800',
  CARD: 'bg-orange-100 text-orange-800',
}

export function PaymentList({ payments }: PaymentListProps) {
  return (
    <div className="space-y-4">
      {payments.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-gray-500">No payments recorded yet.</p>
          </div>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {payment.customer.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {payment.order?.orderNumber || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm">
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
