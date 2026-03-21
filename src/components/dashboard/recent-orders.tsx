import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate, getEffectiveOrderDueDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { differenceInCalendarDays, startOfDay } from 'date-fns'

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  orderStatus: string
  paymentStatus: string
  orderDate: Date
  dueDate: Date | null
  deliveryDate: Date | null
  updatedAt: Date
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
  READY: 'border-cyan-200 bg-cyan-100/80 text-cyan-900',
  SHIPPED: 'border-indigo-200 bg-indigo-100/80 text-indigo-900',
  PARTIALLY_DELIVERED: 'border-amber-200 bg-amber-100/80 text-amber-900',
  DELIVERED: 'border-emerald-200 bg-emerald-100/80 text-emerald-900',
  CANCELLED: 'border-rose-200 bg-rose-100/80 text-rose-900',
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const today = startOfDay(new Date())

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
            orders.map((order) => {
              const effectiveDueDate = getEffectiveOrderDueDate(order)
              const dueInDays = effectiveDueDate
                ? differenceInCalendarDays(startOfDay(new Date(effectiveDueDate)), today)
                : null
              const isDueSoon =
                effectiveDueDate &&
                dueInDays !== null &&
                dueInDays >= 0 &&
                dueInDays <= 3 &&
                !['DELIVERED', 'CANCELLED'].includes(order.orderStatus)

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className={`flex items-center justify-between gap-4 rounded-[1.35rem] border p-4 transition-colors ${
                    isDueSoon
                      ? 'border-amber-300 bg-amber-50/90 hover:bg-amber-100/80'
                      : 'border-border/70 bg-[hsl(var(--surface-soft))]/55 hover:bg-[hsl(var(--surface-soft))]'
                  }`}
                  data-testid={`recent-order-${order.orderNumber}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{order.orderNumber}</p>
                      <Badge className={statusColors[order.orderStatus]}>
                        {order.orderStatus.replace('_', ' ')}
                      </Badge>
                      {isDueSoon ? (
                        <Badge className="border-amber-300 bg-amber-100 text-amber-950">
                          Due in {dueInDays} {dueInDays === 1 ? 'day' : 'days'}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{order.customer.name}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      <p>{formatDate(order.orderDate)}</p>
                      <p className={isDueSoon ? 'font-semibold text-amber-900' : undefined}>
                        Due: {effectiveDueDate ? formatDate(effectiveDueDate) : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(order.totalAmount)}</p>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
