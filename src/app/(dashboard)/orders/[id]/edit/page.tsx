import { prisma } from '@/lib/prisma'
import { EditOrderForm } from '@/components/orders/edit-order-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getOrderFormData } from '@/lib/data'

export default async function EditOrderPage({
  params,
}: {
  params: { id: string }
}) {
  const [order, { customers, products }] = await Promise.all([
    prisma.order.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        orderNumber: true,
        customerId: true,
        orderDate: true,
        subtotal: true,
        discount: true,
        shippingCharge: true,
        totalAmount: true,
        paidAmount: true,
        pendingAmount: true,
        paymentStatus: true,
        notes: true,
        items: {
          select: {
            id: true,
            productId: true,
            variantId: true,
            quantity: true,
            unitPrice: true,
            total: true,
          },
        },
      },
    }),
    getOrderFormData(),
  ])

  if (!order) {
    notFound()
  }

  const initialData = {
    customerId: order.customerId,
    orderDate: order.orderDate.toISOString().split('T')[0],
    subtotal: order.subtotal,
    discount: order.discount,
    shippingCharge: order.shippingCharge,
    totalAmount: order.totalAmount,
    paidAmount: order.paidAmount,
    pendingAmount: order.pendingAmount,
    paymentStatus: order.paymentStatus,
    notes: order.notes ?? '',
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    })),
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/orders" replace>
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="page-title">Edit Order</h1>
        <p className="page-copy">Update details for {order.orderNumber}</p>
      </div>

      <EditOrderForm
        orderId={params.id}
        customers={customers}
        products={products}
        initialData={initialData}
      />
    </div>
  )
}
