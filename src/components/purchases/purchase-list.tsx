'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Purchase {
  id: string
  purchaseNumber: string
  purchaseDate: Date
  totalAmount: number
  paymentStatus: string
  supplier: {
    id: string
    name: string
  } | null
  items: Array<{
    id: string
    quantity: number
    material: {
      name: string
    }
  }>
}

interface PurchaseListProps {
  purchases: Purchase[]
}

const statusColors: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-800',
  PARTIALLY_PAID: 'bg-orange-100 text-orange-800',
  PAID: 'bg-green-100 text-green-800',
}

export function PurchaseList({ purchases }: PurchaseListProps) {
  return (
    <div className="space-y-4">
      {purchases.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-gray-500">No purchases recorded yet.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{purchase.purchaseNumber}</h3>
                      <Badge className={statusColors[purchase.paymentStatus]}>
                        {purchase.paymentStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Supplier: <span className="font-medium text-gray-900">{purchase.supplier?.name || 'N/A'}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(purchase.purchaseDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(purchase.totalAmount)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t text-sm text-gray-600">
                  {purchase.items.length} item(s)
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
