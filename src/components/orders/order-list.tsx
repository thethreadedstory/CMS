'use client'

import { startTransition, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SelectField } from '@/components/ui/select-field'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Eye, Edit, Trash2 } from 'lucide-react'
import { deleteOrder } from '@/app/actions/orders'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

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
  _count: {
    items: number
  }
}

interface OrderListProps {
  orders: Order[]
  initialSearch: string
  initialStatus: string
  initialPayment: string
}

const statusColors: Record<string, string> = {
  PENDING: 'border-yellow-200 bg-yellow-100/80 text-yellow-900',
  CONFIRMED: 'border-sky-200 bg-sky-100/80 text-sky-900',
  IN_PROGRESS: 'border-violet-200 bg-violet-100/80 text-violet-900',
  READY: 'border-cyan-200 bg-cyan-100/80 text-cyan-900',
  SHIPPED: 'border-indigo-200 bg-indigo-100/80 text-indigo-900',
  DELIVERED: 'border-emerald-200 bg-emerald-100/80 text-emerald-900',
  CANCELLED: 'border-rose-200 bg-rose-100/80 text-rose-900',
}

const paymentColors: Record<string, string> = {
  UNPAID: 'border-rose-200 bg-rose-100/80 text-rose-900',
  PARTIALLY_PAID: 'border-amber-200 bg-amber-100/80 text-amber-900',
  PAID: 'border-emerald-200 bg-emerald-100/80 text-emerald-900',
  REFUNDED: 'border-stone-200 bg-stone-100/80 text-stone-800',
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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<{ id: string; orderNumber: string } | null>(null)

  const navigateWithFilters = (searchValue: string, statusValue: string, paymentValue: string) => {
    const params = new URLSearchParams()
    if (searchValue) params.set('search', searchValue)
    if (statusValue) params.set('status', statusValue)
    if (paymentValue) params.set('payment', paymentValue)
    startTransition(() => {
      router.replace(`/orders${params.toString() ? `?${params.toString()}` : ''}`, {
        scroll: false,
      })
    })
  }

  useEffect(() => {
    if (search === initialSearch) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      navigateWithFilters(search, status, payment)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [search, status, payment, initialSearch])

  const handleDeleteClick = (id: string, orderNumber: string) => {
    setSelectedOrder({ id, orderNumber })
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedOrder) return
    
    setDeletingId(selectedOrder.id)
    
    try {
      await deleteOrder(selectedOrder.id)
      toast.success(`Order "${selectedOrder.orderNumber}" deleted successfully`)
      setConfirmOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete order')
    } finally {
      setDeletingId(null)
      setSelectedOrder(null)
    }
  }

  return (
    <>
      <div className="space-y-4">
      <div className="rounded-[1.6rem] border border-border/80 bg-white/78 p-4 shadow-[0_18px_45px_rgba(34,48,51,0.06)]">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="order-search-input"
          />
        </div>
        <SelectField
          value={status}
          onValueChange={(value) => {
            setStatus(value)
            navigateWithFilters(search, value, payment)
          }}
          placeholder="All Statuses"
          emptyLabel="All Statuses"
          options={[
            { value: 'PENDING', label: 'Pending' },
            { value: 'CONFIRMED', label: 'Confirmed' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'READY', label: 'Ready' },
            { value: 'SHIPPED', label: 'Shipped' },
            { value: 'DELIVERED', label: 'Delivered' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ]}
          className="sm:max-w-[220px]"
          dataTestId="order-status-filter"
        />
        <SelectField
          value={payment}
          onValueChange={(value) => {
            setPayment(value)
            navigateWithFilters(search, status, value)
          }}
          placeholder="All Payments"
          emptyLabel="All Payments"
          options={[
            { value: 'UNPAID', label: 'Unpaid' },
            { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
            { value: 'PAID', label: 'Paid' },
            { value: 'REFUNDED', label: 'Refunded' },
          ]}
          className="sm:max-w-[220px]"
          dataTestId="order-payment-filter"
        />
      </div>
      </div>

      {orders.length === 0 ? (
        <Card className="empty-state">
          <div>
            <p className="text-base font-medium text-muted-foreground">No orders found.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or create a new order.</p>
          </div>
        </Card>
        ) : (
        <div className="data-table">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[hsl(var(--surface-soft))]">
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} data-testid={`order-row-${order.id}`}>
                    <TableCell>
                      <p className="font-medium text-foreground">{order.orderNumber}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{order._count.items} item(s)</p>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {order.customer.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(order.orderDate)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-semibold text-foreground">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-xs text-muted-foreground">Paid: {formatCurrency(order.paidAmount)}</p>
                        {order.pendingAmount > 0 && (
                          <p className="text-xs text-destructive">Due: {formatCurrency(order.pendingAmount)}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={statusColors[order.orderStatus]}>
                          {order.orderStatus.replace('_', ' ')}
                        </Badge>
                        <Badge className={paymentColors[order.paymentStatus]}>
                          {order.paymentStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid={`view-order-${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/orders/${order.id}/edit`}>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" data-testid={`edit-order-${order.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteClick(order.id, order.orderNumber)}
                          disabled={deletingId === order.id}
                          data-testid={`delete-order-${order.id}`}
                        >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>

    <ConfirmDialog
      open={confirmOpen}
      onOpenChange={setConfirmOpen}
      onConfirm={handleDeleteConfirm}
      title="Delete Order"
      description={`Are you sure you want to delete order "${selectedOrder?.orderNumber}"? This action cannot be undone.`}
      loading={!!deletingId}
      confirmText="Delete Order"
      loadingText="Deleting..."
    />
  </>
  )
}
