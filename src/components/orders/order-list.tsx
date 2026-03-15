'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Eye, Edit, Trash2 } from 'lucide-react'
import { deleteOrder } from '@/app/actions/orders'

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
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleFilter = (searchValue: string, statusValue: string, paymentValue: string) => {
    const params = new URLSearchParams()
    if (searchValue) params.set('search', searchValue)
    if (statusValue) params.set('status', statusValue)
    if (paymentValue) params.set('payment', paymentValue)
    router.push(`/orders${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const handleDelete = async (id: string, orderNumber: string) => {
    if (confirm(`Are you sure you want to delete order "${orderNumber}"?`)) {
      setDeletingId(id)
      try {
        await deleteOrder(id)
        router.refresh()
      } catch (error) {
        alert('Failed to delete order.')
      } finally {
        setDeletingId(null)
      }
    }
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
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50" data-testid={`order-row-${order.id}`}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{order.items.length} item(s)</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.customer.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-xs text-gray-500">Paid: {formatCurrency(order.paidAmount)}</p>
                        {order.pendingAmount > 0 && (
                          <p className="text-xs text-red-600">Due: {formatCurrency(order.pendingAmount)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <Badge className={statusColors[order.orderStatus]}>
                          {order.orderStatus.replace('_', ' ')}
                        </Badge>
                        <Badge className={paymentColors[order.paymentStatus]}>
                          {order.paymentStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" data-testid={`view-order-${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/orders/${order.id}/edit`}>
                          <Button variant="ghost" size="sm" data-testid={`edit-order-${order.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(order.id, order.orderNumber)}
                          disabled={deletingId === order.id}
                          data-testid={`delete-order-${order.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
