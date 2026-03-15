'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Eye, Edit } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  orderDate: Date
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  orderStatus: string
  paymentStatus: string
  customer: {
    id: string
    name: string
  }
  items: Array<{
    id: string
    quantity: number
    product: {
      name: string
    }
  }>
  _count: {
    payments: number
  }
}

interface OrderListProps {
  orders: Order[]
  initialSearch: string
  initialStatus: string
  initialPayment: string
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  READY: 'bg-cyan-100 text-cyan-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const paymentColors: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-800',
  PARTIALLY_PAID: 'bg-orange-100 text-orange-800',
  PAID: 'bg-green-100 text-green-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

export function OrderList({
  orders,
  initialSearch,
  initialStatus,
  initialPayment,
}: OrderListProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [status, setStatus] = useState(initialStatus)
  const [payment, setPayment] = useState(initialPayment)

  const handleFilter = (searchValue: string, statusValue: string, paymentValue: string) => {
    const params = new URLSearchParams()
    if (searchValue) params.set('search', searchValue)
    if (statusValue) params.set('status', statusValue)
    if (paymentValue) params.set('payment', paymentValue)
    router.push(`/orders${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by order number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              handleFilter(e.target.value, status, payment)
            }}
            className="pl-10"
            data-testid="order-search-input"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            handleFilter(search, e.target.value, payment)
          }}
          className="h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
          data-testid="order-status-filter"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="READY">Ready</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={payment}
          onChange={(e) => {
            setPayment(e.target.value)
            handleFilter(search, status, e.target.value)
          }}
          className="h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
          data-testid="order-payment-filter"
        >
          <option value="">All Payments</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="PAID">Paid</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-gray-500">No orders found.</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or create a new order.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden" data-testid={`order-card-${order.id}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{order.orderNumber}</h3>
                      <Badge className={statusColors[order.orderStatus]}>
                        {order.orderStatus.replace('_', ' ')}
                      </Badge>
                      <Badge className={paymentColors[order.paymentStatus]}>
                        {order.paymentStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Customer: <span className="font-medium text-gray-900">{order.customer.name}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(order.orderDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Paid: {formatCurrency(order.paidAmount)}
                    </p>
                    {order.pendingAmount > 0 && (
                      <p className="text-sm text-red-600 font-medium">
                        Due: {formatCurrency(order.pendingAmount)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {order.items.length} item(s) • {order._count.payments} payment(s)
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm" data-testid={`view-order-${order.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/orders/${order.id}/edit`}>
                      <Button size="sm" data-testid={`edit-order-${order.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
