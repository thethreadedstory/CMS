import { formatCurrency, formatDate } from '@/lib/utils'

type InvoiceOrderItem = {
  id: string
  quantity: number
  unitPrice: number
  total: number
  product: {
    name: string
  }
  variant: {
    variantType: string
    variantValue: string
  } | null
}

export type InvoiceOrder = {
  id: string
  orderNumber: string
  orderDate: Date | string
  dueDate: Date | string | null
  orderStatus: string
  paymentStatus: string
  subtotal: number
  discount: number
  shippingCharge: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  notes: string | null
  customer: {
    name: string
    phone: string | null
    email: string | null
    address: string | null
    city: string | null
  }
  items: InvoiceOrderItem[]
}

type OrderInvoiceProps = {
  order: InvoiceOrder
  rootId?: string
  storyTitle?: string
  ariaHidden?: boolean
}

export function OrderInvoice({
  order,
  rootId,
  storyTitle = 'The Threaded Story',
  ariaHidden = false,
}: OrderInvoiceProps) {
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

  return (
    <section
      id={rootId}
      className="invoice-print-area"
      aria-hidden={ariaHidden || undefined}
    >
      <div className="invoice-shell">
        <div className="invoice-banner">
          <p className="invoice-story-title">{storyTitle}</p>
        </div>

        <div className="invoice-header">
          <div>
            <p className="invoice-eyebrow">Invoice</p>
            <h1 className="invoice-title">{order.orderNumber}</h1>
            <p className="invoice-meta">Order Date: {formatDate(order.orderDate)}</p>
            {order.dueDate && (
              <p className="invoice-meta">Due Date: {formatDate(order.dueDate)}</p>
            )}
          </div>
          <div className="invoice-status-box">
            <div>
              <span className="invoice-status-label">Order Status</span>
              <p>{order.orderStatus.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="invoice-status-label">Payment Status</span>
              <p>{order.paymentStatus.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <div className="invoice-grid">
          <div className="invoice-card">
            <p className="invoice-section-title">Billed To</p>
            <p className="invoice-strong">{order.customer.name}</p>
            {order.customer.phone && <p>{order.customer.phone}</p>}
            {order.customer.email && <p>{order.customer.email}</p>}
            {order.customer.address && <p>{order.customer.address}</p>}
            {order.customer.city && <p>{order.customer.city}</p>}
          </div>
          <div className="invoice-card">
            <p className="invoice-section-title">Invoice Summary</p>
            <div className="invoice-summary-row">
              <span>Invoice No.</span>
              <span>{order.orderNumber}</span>
            </div>
            <div className="invoice-summary-row">
              <span>Items</span>
              <span>{order.items.length}</span>
            </div>
            <div className="invoice-summary-row">
              <span>Total Amount</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="invoice-summary-row">
              <span>Amount Due</span>
              <span>{formatCurrency(order.pendingAmount)}</span>
            </div>
          </div>
        </div>

        <div className="invoice-table-wrap">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="invoice-item-name">{item.product.name}</div>
                    {item.variant && (
                      <div className="invoice-item-meta">
                        {item.variant.variantType}: {item.variant.variantValue}
                      </div>
                    )}
                  </td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unitPrice)}</td>
                  <td>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-totals-box">
          {invoiceRows.map((row) => (
            <div key={row.label} className="invoice-summary-row">
              <span>{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
          <div className="invoice-total-row">
            <span>Grand Total</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {order.notes && (
          <div className="invoice-notes">
            <p className="invoice-section-title">Notes</p>
            <p>{order.notes}</p>
          </div>
        )}
      </div>
    </section>
  )
}
