import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  orderStatus: string
  paymentStatus: string
  orderDate: Date
  customer: {
    name: string
  }
}

interface RecentOrdersProps {
  orders: Order[]
}

const statusColors: Record<string, string> = {
  PENDING: 'border-yellow-200 bg-yellow-100/80 text-yellow-900',
  CONFIRMED: 'border-sky-200 bg-sky-100/80 text-sky-900',
  IN_PROGRESS: 'border-violet-200 bg-violet-100/80 text-violet-900',
  DELIVERED: 'border-emerald-200 bg-emerald-100/80 text-emerald-900',
  CANCELLED: 'border-rose-200 bg-rose-100/80 text-rose-900',
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card data-testid="recent-orders">
      <CardHeader>
        <span className="section-label w-fit">Activity</span>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent orders</p>
          ) : (
            orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-border/70 bg-[hsl(var(--surface-soft))]/55 p-4 transition-colors hover:bg-[hsl(var(--surface-soft))]"
                data-testid={`recent-order-${order.orderNumber}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{order.orderNumber}</p>
                    <Badge className={statusColors[order.orderStatus]}>
                      {order.orderStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{order.customer.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{formatDate(order.orderDate)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{formatCurrency(order.totalAmount)}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
