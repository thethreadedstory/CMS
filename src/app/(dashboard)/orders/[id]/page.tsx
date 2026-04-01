import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { OrderInvoice } from '@/components/orders/order-invoice'
import { OrderStatusManager } from '@/components/orders/order-status-manager'
import { PrintInvoiceButton } from '@/components/orders/print-invoice-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import {
  formatCurrency,
  formatDate,
  getEffectiveDeliveryDate,
  getEffectiveOrderDueDate,
} from '@/lib/utils'

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
      },
      purchases: {
        orderBy: { purchaseDate: 'desc' },
        select: {
          id: true,
          purchaseNumber: true,
          purchaseDate: true,
          totalAmount: true,
          paymentStatus: true,
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    READY: 'bg-cyan-100 text-cyan-900',
    SHIPPED: 'bg-indigo-100 text-indigo-900',
    PARTIALLY_DELIVERED: 'bg-amber-100 text-amber-900',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  const paymentColors: Record<string, string> = {
    UNPAID: 'bg-red-100 text-red-800',
    PARTIALLY_PAID: 'bg-orange-100 text-orange-800',
    PAID: 'bg-green-100 text-green-800',
    REFUNDED: 'border-stone-200 bg-stone-100/80 text-stone-800',
  }

  const rawMaterialSpend = order.purchases.reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0
  )
  const totalOrderedQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const effectiveDueDate = getEffectiveOrderDueDate(order)
  const effectiveDeliveryDate = getEffectiveDeliveryDate(order)
  const estimatedNetProfit = order.totalAmount - rawMaterialSpend
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
        <PrintInvoiceButton orderId={order.id} />
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{order.orderNumber}</h1>
          <p className="page-copy">
            Ordered on {formatDate(order.orderDate)}
            {effectiveDueDate ? ` • Due by ${formatDate(effectiveDueDate)}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className={statusColors[order.orderStatus]}>
            {order.orderStatus.replace('_', ' ')}
          </Badge>
          <Badge className={paymentColors[order.paymentStatus]}>
            {order.paymentStatus.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {order.items.map((item) => {
                const showDelivery = order.orderStatus === 'PARTIALLY_DELIVERED' || order.orderStatus === 'DELIVERED'
                const fullyDelivered = item.deliveredQuantity >= item.quantity

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.product.name}</p>
                      {item.variant ? (
                        <p className="text-xs capitalize text-muted-foreground">
                          {item.variant.variantType}: {item.variant.variantValue}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No variant</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unitPrice)} × {item.quantity}
                      </p>
                      {showDelivery && (
                        <p className={`mt-1 text-xs font-medium ${fullyDelivered ? 'text-emerald-700' : 'text-amber-700'}`}>
                          Delivered: {item.deliveredQuantity} / {item.quantity}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-foreground">
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="font-medium text-destructive">
                    -{formatCurrency(order.discount)}
                  </span>
                </div>
              )}
              {order.shippingCharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="font-medium">
                    +{formatCurrency(order.shippingCharge)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid:</span>
                <span className="font-medium text-emerald-700">
                  {formatCurrency(order.paidAmount)}
                </span>
              </div>
              {order.pendingAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending:</span>
                  <span className="font-medium text-destructive">
                    {formatCurrency(order.pendingAmount)}
                  </span>
                </div>
              )}
            </div>

            {order.notes && (
              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-muted-foreground">Notes:</p>
                <p className="mt-1 text-foreground">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <Link
                  href={`/customers/${order.customer.id}`}
                  className="font-medium text-sky-700 hover:underline"
                >
                  {order.customer.name}
                </Link>
              </div>
              {order.customer.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-foreground">{order.customer.phone}</p>
                </div>
              )}
              {order.customer.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground">{order.customer.email}</p>
                </div>
              )}
              {order.customer.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="text-foreground">{order.customer.address}</p>
                  {order.customer.city && (
                    <p className="text-muted-foreground">{order.customer.city}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fulfillment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ordered quantity</span>
                <span className="font-medium text-foreground">{totalOrderedQuantity}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Delivered quantity</span>
                <span className="font-medium text-foreground">
                  {order.deliveredQuantity} / {totalOrderedQuantity}
                </span>
              </div>
              {effectiveDueDate ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Due date</span>
                  <span className="font-medium text-foreground">
                    {formatDate(effectiveDueDate)}
                  </span>
                </div>
              ) : null}
              {effectiveDeliveryDate ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivered on</span>
                  <span className="font-medium text-foreground">
                    {formatDate(effectiveDeliveryDate)}
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <OrderStatusManager
            orderId={order.id}
            currentStatus={order.orderStatus}
            deliveredQuantity={order.deliveredQuantity}
            totalOrderedQuantity={totalOrderedQuantity}
            items={order.items.map((item) => ({
              id: item.id,
              productName: item.product.name,
              variantLabel: item.variant
                ? `${item.variant.variantType}: ${item.variant.variantValue}`
                : null,
              quantity: item.quantity,
              deliveredQuantity: item.deliveredQuantity,
            }))}
          />

          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {order.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments recorded</p>
              ) : (
                <div className="space-y-3">
                  {order.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-lg bg-[hsl(var(--surface-soft))]/60 p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(payment.paymentDate)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.paymentMethod}
                          </p>
                        </div>
                      </div>
                      {payment.notes && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {payment.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {order.pendingAmount > 0 && (
                <Link href={`/payments/new?orderId=${order.id}`}>
                  <Button className="mt-4 w-full" variant="outline">
                    Record Payment
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Raw Material Profit Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order revenue</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Raw material spend</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(rawMaterialSpend)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3 text-sm">
                <span className="font-medium text-foreground">
                  Estimated net profit
                </span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(estimatedNetProfit)}
                </span>
              </div>

              {order.purchases.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No raw material purchases have been linked to this order yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {order.purchases.map((purchase) => (
                    <Link
                      key={purchase.id}
                      href={`/purchases/${purchase.id}`}
                      className="block rounded-lg border border-border/70 p-3 transition-colors hover:bg-[hsl(var(--surface-soft))]/60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {purchase.purchaseNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(purchase.purchaseDate)}
                            {purchase.supplier?.name
                              ? ` · ${purchase.supplier.name}`
                              : ''}
                          </p>
                        </div>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(purchase.totalAmount)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <OrderInvoice
        order={{
          ...order,
          dueDate: effectiveDueDate,
        }}
        rootId="invoice-print-root"
        ariaHidden
      />
    </div>
  )
}
