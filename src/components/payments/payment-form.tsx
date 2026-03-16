'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createPayment } from '@/app/actions/payments'
import { formatCurrency } from '@/lib/utils'

interface PaymentFormCustomer {
  id: string
  name: string
}

interface PaymentFormOrder {
  id: string
  orderNumber: string
  customerId: string
  pendingAmount: number
}

interface PaymentFormProps {
  customers: PaymentFormCustomer[]
  orders: PaymentFormOrder[]
  initialCustomerId?: string
  initialOrderId?: string
}

export function PaymentForm({
  customers,
  orders,
  initialCustomerId = '',
  initialOrderId = '',
}: PaymentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customerId, setCustomerId] = useState(initialCustomerId)
  const [orderId, setOrderId] = useState(initialOrderId)
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const availableOrders = useMemo(() => {
    return customerId
      ? orders.filter((order) => order.customerId === customerId)
      : orders
  }, [customerId, orders])

  const selectedOrder = availableOrders.find((order) => order.id === orderId)

  const handleCustomerChange = (value: string) => {
    setCustomerId(value)
    setOrderId((currentOrderId) => {
      const stillValid = orders.some(
        (order) => order.id === currentOrderId && order.customerId === value
      )
      return stillValid ? currentOrderId : ''
    })
  }

  const handleOrderChange = (value: string) => {
    setOrderId(value)

    if (!value) {
      return
    }

    const order = orders.find((item) => item.id === value)
    if (order) {
      setCustomerId(order.customerId)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(event.currentTarget)
      await createPayment(formData)
      router.replace('/payments')
    } catch {
      setError('Failed to record payment. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-[1.4rem] border border-rose-200 bg-rose-100/70 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerId">
                Customer <span className="text-red-500">*</span>
              </Label>
              <select
                id="customerId"
                name="customerId"
                value={customerId}
                onChange={(event) => handleCustomerChange(event.target.value)}
                className="field-select"
                required
                data-testid="payment-customer-select"
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderId">Order</Label>
              <select
                id="orderId"
                name="orderId"
                value={orderId}
                onChange={(event) => handleOrderChange(event.target.value)}
                className="field-select"
                data-testid="payment-order-select"
              >
                <option value="">General customer payment</option>
                {availableOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.orderNumber} - Pending {formatCurrency(order.pendingAmount)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={selectedOrder ? selectedOrder.pendingAmount : undefined}
                placeholder="0.00"
                required
                data-testid="payment-amount-input"
              />
              {selectedOrder && (
                <p className="text-sm text-muted-foreground">
                  Pending on {selectedOrder.orderNumber}: {formatCurrency(selectedOrder.pendingAmount)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">
                Payment Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="paymentDate"
                name="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
                required
                data-testid="payment-date-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                className="field-select"
                defaultValue="CASH"
                required
                data-testid="payment-method-select"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CARD">Card</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Add optional payment notes..."
              className="field-textarea"
              data-testid="payment-notes-input"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading} data-testid="save-payment-button">
              {loading ? 'Saving...' : 'Record Payment'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.replace('/payments')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
