import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { NextResponse } from 'next/server'
import { OrderInvoice } from '@/components/orders/order-invoice'
import { invoiceDocumentStyles } from '@/components/orders/invoice-document-styles'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
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
    return new NextResponse('Invoice not found', { status: 404 })
  }

  const documentTitle = `Invoice-${order.orderNumber || order.id}`
  const invoiceMarkup = renderToStaticMarkup(
    React.createElement(OrderInvoice, { order })
  )
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${documentTitle}</title>
    <style>${invoiceDocumentStyles}</style>
  </head>
  <body>
    ${invoiceMarkup}
  </body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
