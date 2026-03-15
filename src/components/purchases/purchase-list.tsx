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
  UNPAID: 'border-rose-200 bg-rose-100/80 text-rose-900',
  PARTIALLY_PAID: 'border-amber-200 bg-amber-100/80 text-amber-900',
  PAID: 'border-emerald-200 bg-emerald-100/80 text-emerald-900',
}

export function PurchaseList({ purchases }: PurchaseListProps) {
  return (
    <div className="space-y-4">
      {purchases.length === 0 ? (
        <Card className="empty-state">
          <div>
            <p className="text-base font-medium text-muted-foreground">No purchases recorded yet.</p>
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
                      <h3 className="text-lg font-semibold text-foreground">{purchase.purchaseNumber}</h3>
                      <Badge className={statusColors[purchase.paymentStatus]}>
                        {purchase.paymentStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Supplier: <span className="font-medium text-foreground">{purchase.supplier?.name || 'N/A'}</span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDate(purchase.purchaseDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-foreground">{formatCurrency(purchase.totalAmount)}</p>
                  </div>
                </div>

                <div className="border-t border-border/70 pt-4 text-sm text-muted-foreground">
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
