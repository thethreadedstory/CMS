import { prisma } from '@/lib/prisma'
import { EditOrderForm } from '@/components/orders/edit-order-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function EditOrderPage({
  params,
}: {
  params: { id: string }
}) {
  const [order, customers, products] = await Promise.all([
    prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
      },
    }),
    prisma.customer.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        variants: {
          orderBy: [{ variantType: 'asc' }, { variantValue: 'asc' }],
        },
      },
      orderBy: { name: 'asc' },
    }),
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
        <Link href={`/orders/${params.id}`}>
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Order
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
