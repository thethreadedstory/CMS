import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'

Font.register({
  family: 'Helvetica',
  fonts: [],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111827',
    padding: '12mm',
    backgroundColor: '#ffffff',
  },
  shell: {
    border: '1pt solid #1f2937',
    padding: 20,
  },
  banner: {
    borderBottom: '1pt solid #1f2937',
    paddingBottom: 12,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingBottom: 12,
    borderBottom: '1pt solid #1f2937',
  },
  eyebrow: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  invoiceTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  metaText: {
    fontSize: 9,
    marginTop: 3,
  },
  statusBox: {
    minWidth: 160,
    border: '1pt solid #1f2937',
  },
  statusRow: {
    padding: '8pt 10pt',
  },
  statusRowBorder: {
    padding: '8pt 10pt',
    borderTop: '1pt solid #1f2937',
  },
  statusLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 10,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  card: {
    flex: 1,
    border: '1pt solid #1f2937',
    padding: 10,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  strongText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginBottom: 2,
  },
  normalText: {
    fontSize: 9,
    marginBottom: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTop: '0.5pt solid #d1d5db',
  },
  summaryRowFirst: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  tableWrap: {
    marginTop: 14,
    border: '1pt solid #1f2937',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottom: '1pt solid #1f2937',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #1f2937',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  thDesc: {
    flex: 3,
    padding: '7pt 10pt',
    borderRight: '1pt solid #1f2937',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  thNum: {
    flex: 1,
    padding: '7pt 10pt',
    borderRight: '1pt solid #1f2937',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  thNumLast: {
    flex: 1,
    padding: '7pt 10pt',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tdDesc: {
    flex: 3,
    padding: '7pt 10pt',
    borderRight: '1pt solid #1f2937',
  },
  tdNum: {
    flex: 1,
    padding: '7pt 10pt',
    borderRight: '1pt solid #1f2937',
  },
  tdNumLast: {
    flex: 1,
    padding: '7pt 10pt',
  },
  itemName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 8,
    color: '#4b5563',
  },
  totalsBox: {
    width: 240,
    marginTop: 14,
    marginLeft: 'auto',
    border: '1pt solid #1f2937',
    padding: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 6,
    borderTop: '1pt solid #1f2937',
    fontFamily: 'Helvetica-Bold',
  },
  notes: {
    marginTop: 14,
    border: '1pt solid #1f2937',
    padding: 10,
  },
})

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

  const documentTitle = `invoice-${order.orderNumber || order.id}`

  const invoiceRows = [
    { label: 'Subtotal', value: formatCurrency(order.subtotal) },
    ...(order.discount > 0
      ? [{ label: 'Discount', value: `- ${formatCurrency(order.discount)}` }]
      : []),
    ...(order.shippingCharge > 0
      ? [{ label: 'Shipping', value: formatCurrency(order.shippingCharge) }]
      : []),
    { label: 'Paid', value: formatCurrency(order.paidAmount) },
    { label: 'Pending', value: formatCurrency(order.pendingAmount) },
  ]

  const doc = React.createElement(
    Document,
    { title: documentTitle },
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(
        View,
        { style: styles.shell },

        // Banner
        React.createElement(
          View,
          { style: styles.banner },
          React.createElement(Text, { style: styles.bannerTitle }, 'The Threaded Story')
        ),

        // Header
        React.createElement(
          View,
          { style: styles.header },
          React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.eyebrow }, 'Invoice'),
            React.createElement(Text, { style: styles.invoiceTitle }, order.orderNumber),
            React.createElement(
              Text,
              { style: styles.metaText },
              `Order Date: ${formatDate(order.orderDate)}`
            ),
            order.dueDate
              ? React.createElement(
                  Text,
                  { style: styles.metaText },
                  `Due Date: ${formatDate(order.dueDate)}`
                )
              : null
          ),
          React.createElement(
            View,
            { style: styles.statusBox },
            React.createElement(
              View,
              { style: styles.statusRow },
              React.createElement(Text, { style: styles.statusLabel }, 'Order Status'),
              React.createElement(
                Text,
                { style: styles.statusValue },
                order.orderStatus.replace('_', ' ')
              )
            ),
            React.createElement(
              View,
              { style: styles.statusRowBorder },
              React.createElement(Text, { style: styles.statusLabel }, 'Payment Status'),
              React.createElement(
                Text,
                { style: styles.statusValue },
                order.paymentStatus.replace('_', ' ')
              )
            )
          )
        ),

        // Billed To + Summary grid
        React.createElement(
          View,
          { style: styles.grid },
          React.createElement(
            View,
            { style: styles.card },
            React.createElement(Text, { style: styles.sectionTitle }, 'Billed To'),
            React.createElement(Text, { style: styles.strongText }, order.customer.name),
            order.customer.phone
              ? React.createElement(Text, { style: styles.normalText }, order.customer.phone)
              : null,
            order.customer.email
              ? React.createElement(Text, { style: styles.normalText }, order.customer.email)
              : null,
            order.customer.address
              ? React.createElement(Text, { style: styles.normalText }, order.customer.address)
              : null,
            order.customer.city
              ? React.createElement(Text, { style: styles.normalText }, order.customer.city)
              : null
          ),
          React.createElement(
            View,
            { style: styles.card },
            React.createElement(Text, { style: styles.sectionTitle }, 'Invoice Summary'),
            React.createElement(
              View,
              { style: styles.summaryRowFirst },
              React.createElement(Text, null, 'Invoice No.'),
              React.createElement(Text, null, order.orderNumber)
            ),
            React.createElement(
              View,
              { style: styles.summaryRow },
              React.createElement(Text, null, 'Items'),
              React.createElement(Text, null, String(order.items.length))
            ),
            React.createElement(
              View,
              { style: styles.summaryRow },
              React.createElement(Text, null, 'Total Amount'),
              React.createElement(Text, null, formatCurrency(order.totalAmount))
            ),
            React.createElement(
              View,
              { style: styles.summaryRow },
              React.createElement(Text, null, 'Amount Due'),
              React.createElement(Text, null, formatCurrency(order.pendingAmount))
            )
          )
        ),

        // Items table
        React.createElement(
          View,
          { style: styles.tableWrap },
          React.createElement(
            View,
            { style: styles.tableHeader },
            React.createElement(Text, { style: styles.thDesc }, 'Description'),
            React.createElement(Text, { style: styles.thNum }, 'Qty'),
            React.createElement(Text, { style: styles.thNum }, 'Rate'),
            React.createElement(Text, { style: styles.thNumLast }, 'Amount')
          ),
          ...order.items.map((item, idx) =>
            React.createElement(
              View,
              {
                key: item.id,
                style: idx === order.items.length - 1 ? styles.tableRowLast : styles.tableRow,
              },
              React.createElement(
                View,
                { style: styles.tdDesc },
                React.createElement(Text, { style: styles.itemName }, item.product.name),
                item.variant
                  ? React.createElement(
                      Text,
                      { style: styles.itemMeta },
                      `${item.variant.variantType}: ${item.variant.variantValue}`
                    )
                  : null
              ),
              React.createElement(Text, { style: styles.tdNum }, String(item.quantity)),
              React.createElement(Text, { style: styles.tdNum }, formatCurrency(item.unitPrice)),
              React.createElement(Text, { style: styles.tdNumLast }, formatCurrency(item.total))
            )
          )
        ),

        // Totals
        React.createElement(
          View,
          { style: styles.totalsBox },
          ...invoiceRows.map((row, idx) =>
            React.createElement(
              View,
              { key: row.label, style: idx === 0 ? styles.summaryRowFirst : styles.summaryRow },
              React.createElement(Text, null, row.label),
              React.createElement(Text, null, row.value)
            )
          ),
          React.createElement(
            View,
            { style: styles.totalRow },
            React.createElement(Text, null, 'Grand Total'),
            React.createElement(Text, null, formatCurrency(order.totalAmount))
          )
        ),

        // Notes
        order.notes
          ? React.createElement(
              View,
              { style: styles.notes },
              React.createElement(Text, { style: styles.sectionTitle }, 'Notes'),
              React.createElement(Text, { style: styles.normalText }, order.notes)
            )
          : null
      )
    )
  )

  const pdfBuffer = await renderToBuffer(doc)

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${documentTitle}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
