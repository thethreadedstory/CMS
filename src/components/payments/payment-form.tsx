'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectField } from '@/components/ui/select-field'
import { Textarea } from '@/components/ui/textarea'
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
  const [paymentMethod, setPaymentMethod] = useState('CASH')
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

    if (!customerId && !orderId) {
      setError('Please select a customer')
      setLoading(false)
      return
    }

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
              <SelectField
                id="customerId"
                name="customerId"
                value={customerId}
                onValueChange={handleCustomerChange}
                placeholder="Select a customer"
                emptyLabel="Select a customer"
                options={customers.map((customer) => ({
                  value: customer.id,
                  label: customer.name,
                }))}
                required
                dataTestId="payment-customer-select"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderId">Order</Label>
              <SelectField
                id="orderId"
                name="orderId"
                value={orderId}
                onValueChange={handleOrderChange}
                placeholder="General customer payment"
                emptyLabel="General customer payment"
                options={availableOrders.map((order) => ({
                  value: order.id,
                  label: `${order.orderNumber} - Pending ${formatCurrency(order.pendingAmount)}`,
                }))}
                dataTestId="payment-order-select"
              />
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
              <SelectField
                id="paymentMethod"
                name="paymentMethod"
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                placeholder="Select payment method"
                options={[
                  { value: 'CASH', label: 'Cash' },
                  { value: 'UPI', label: 'UPI' },
                  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                  { value: 'CARD', label: 'Card' },
                ]}
                required
                dataTestId="payment-method-select"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Add optional payment notes..."
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
