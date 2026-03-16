import { notFound } from 'next/navigation'
import { InvoiceAutoPrint } from '@/components/orders/invoice-auto-print'
import { OrderInvoice } from '@/components/orders/order-invoice'
import { prisma } from '@/lib/prisma'

export default async function OrderInvoicePage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { autoprint?: string }
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
    },
  })

  if (!order) {
    notFound()
  }

  const documentTitle = `Invoice-${order.orderNumber || order.id}`

  return (
    <div className="invoice-print-mode">
      <InvoiceAutoPrint
        enabled={searchParams.autoprint === '1'}
        documentTitle={documentTitle}
      />
      <OrderInvoice order={order} />
    </div>
  )
}
