'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectField } from '@/components/ui/select-field'
import { Textarea } from '@/components/ui/textarea'
import { createOrder } from '@/app/actions/orders'
import { Plus, Trash2, Calculator, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ProductVariant {
  id: string
  variantType: string
  variantValue: string
  sku: string
  price: number
  stock: number
}

interface Product {
  id: string
  name: string
  sku: string
  sellingPrice: number
  currentStock: number
  category: { name: string } | null
  variants: ProductVariant[]
}

interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
}

interface OrderItem {
  productId: string
  variantId: string
  quantity: number
  unitPrice: number
}

interface OrderFormProps {
  customers: Customer[]
  products: Product[]
}

export function OrderForm({ customers, products }: OrderFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [customerId, setCustomerId] = useState('')
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [items, setItems] = useState<OrderItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [shippingCharge, setShippingCharge] = useState(0)
  const [paidAmount, setPaidAmount] = useState(0)
  const [notes, setNotes] = useState('')

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }, [items])

  const total = useMemo(() => {
    return subtotal - discount + shippingCharge
  }, [subtotal, discount, shippingCharge])

  const pending = useMemo(() => {
    return Math.max(0, total - paidAmount)
  }, [total, paidAmount])

  const paymentStatus = useMemo(() => {
    if (paidAmount === 0) return 'UNPAID'
    if (paidAmount >= total) return 'PAID'
    return 'PARTIALLY_PAID'
  }, [paidAmount, total])

  const addItem = () => {
    setItems([...items, { productId: '', variantId: '', quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    if (field === 'productId') {
      const product = products.find(p => p.id === value)
      // Reset variant selection
      newItems[index].variantId = ''
      if (product) {
        // If product has variants, don't pre-fill price — wait for variant selection
        // If no variants, use the product's selling price directly
        newItems[index].unitPrice = product.variants.length > 0 ? 0 : product.sellingPrice
      }
    }

    if (field === 'variantId') {
      const product = products.find(p => p.id === newItems[index].productId)
      if (product) {
        if (value) {
          // Use the variant's own standalone price
          const variant = product.variants.find(v => v.id === value)
          if (variant) {
            newItems[index].unitPrice = variant.price
          }
        } else {
          // Variant deselected — fall back to product base price
          newItems[index].unitPrice = product.sellingPrice
        }
      }
    }

    setItems(newItems)
  }

  const getAvailableStock = (item: OrderItem): number => {
    const product = products.find(p => p.id === item.productId)
    if (!product) return 0
    if (item.variantId) {
      const variant = product.variants.find(v => v.id === item.variantId)
      return variant?.stock ?? 0
    }
    return product.currentStock
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customerId) {
      setError('Please select a customer')
      return
    }
    
    if (items.length === 0) {
      setError('Please add at least one item')
      return
    }
    
    if (items.some(item => !item.productId || item.quantity <= 0)) {
      setError('Please complete all item details')
      return
    }

    // Validate: if product has variants, a variant must be selected
    const missingVariant = items.some(item => {
      const product = products.find(p => p.id === item.productId)
      return product && product.variants.length > 0 && !item.variantId
    })
    if (missingVariant) {
      setError('Please select a variant for all products that have variants')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('customerId', customerId)
      formData.append('orderDate', orderDate)
      formData.append('dueDate', dueDate)
      formData.append('subtotal', subtotal.toString())
      formData.append('discount', discount.toString())
      formData.append('shippingCharge', shippingCharge.toString())
      formData.append('totalAmount', total.toString())
      formData.append('paidAmount', paidAmount.toString())
      formData.append('pendingAmount', pending.toString())
      formData.append('paymentStatus', paymentStatus)
      formData.append('notes', notes)
      formData.append('items', JSON.stringify(items))

      await createOrder(formData)
      router.replace('/orders')
    } catch {
      setError('Failed to create order. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-[1.4rem] border border-rose-200 bg-rose-100/70 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Customer & Date</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="customerId">
                Customer <span className="text-red-500">*</span>
              </Label>
              <SelectField
                id="customerId"
                value={customerId}
                onValueChange={setCustomerId}
                placeholder="Select a customer"
                emptyLabel="Select a customer"
                options={customers.map((customer) => ({
                  value: customer.id,
                  label: `${customer.name}${customer.phone ? ` - ${customer.phone}` : ''}`,
                }))}
                required
                dataTestId="order-customer-select"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderDate">Order Date</Label>
              <Input
                id="orderDate"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                data-testid="order-date-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                data-testid="order-due-date-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Items</CardTitle>
            <Button type="button" onClick={addItem} variant="outline" size="sm" data-testid="add-order-item-button">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items added. Click "Add Item" to add products to this order.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const product = products.find(p => p.id === item.productId)
                const hasVariants = (product?.variants.length ?? 0) > 0
                const isSimpleProduct = Boolean(product) && !hasVariants
                const availableStock = getAvailableStock(item)
                const itemTotal = item.quantity * item.unitPrice

                return (
                  <div key={index} className="space-y-4 rounded-[1.4rem] border border-border/75 bg-[hsl(var(--surface-soft))]/55 p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">Item {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className={`grid grid-cols-1 gap-4 ${isSimpleProduct ? 'md:grid-cols-5 md:items-start' : 'md:grid-cols-4'}`}>
                      <div className={isSimpleProduct ? 'md:col-span-2' : 'md:col-span-2'}>
                        <Label>Product</Label>
                        <SelectField
                          value={item.productId}
                          onValueChange={(value) => updateItem(index, 'productId', value)}
                          placeholder="Select product"
                          options={products.map((p) => ({
                            value: p.id,
                            label:
                              p.variants.length > 0
                                ? `${p.name} - ${p.variants.length} variant${p.variants.length > 1 ? 's' : ''}`
                                : `${p.name} - ${formatCurrency(p.sellingPrice)} (Stock: ${p.currentStock})`,
                          }))}
                          required
                        />
                        {isSimpleProduct && (
                          <p className={`mt-2 text-xs ${availableStock < item.quantity ? 'text-destructive' : 'text-muted-foreground'}`}>
                            Stock: {availableStock}
                            {availableStock < item.quantity ? ' • Insufficient stock!' : ''}
                          </p>
                        )}
                      </div>

                      {hasVariants && (
                        <div className="md:col-span-2">
                          <Label>
                            Variant <span className="text-red-500">*</span>
                          </Label>
                          <SelectField
                            value={item.variantId}
                            onValueChange={(value) => updateItem(index, 'variantId', value)}
                            placeholder="Select variant"
                            options={
                              product?.variants.map((v) => ({
                                value: v.id,
                                label: `${v.variantType}: ${v.variantValue} - ${formatCurrency(v.price)} (Stock: ${v.stock})`,
                              })) ?? []
                            }
                            required
                          />
                          {item.variantId && availableStock < item.quantity && (
                            <p className="mt-1 text-xs text-destructive">Insufficient variant stock!</p>
                          )}
                        </div>
                      )}

                      {isSimpleProduct && (
                        <>
                          <div>
                            <Label>Variant</Label>
                            <div className="flex h-12 items-center rounded-[1rem] border border-border/75 bg-background/80 px-4 text-sm text-muted-foreground">
                              No variant
                            </div>
                          </div>

                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              required
                            />
                          </div>

                          <div>
                            <Label>Unit Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              required
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {!isSimpleProduct && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {product && (
                          <div className="col-span-2 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {hasVariants && item.variantId
                                ? `Variant stock: ${availableStock}`
                                : !hasVariants
                                ? `Stock: ${availableStock}`
                                : null}
                            </span>
                          </div>
                        )}

                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            required
                          />
                        </div>

                        <div>
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-border/70 pt-2">
                      <span className="text-sm text-muted-foreground">Item Total:</span>
                      <span className="font-semibold text-foreground">{formatCurrency(itemTotal)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            <CardTitle>Pricing & Payment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                data-testid="order-discount-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingCharge">Shipping Charge</Label>
              <Input
                id="shippingCharge"
                type="number"
                step="0.01"
                min="0"
                value={shippingCharge}
                onChange={(e) => setShippingCharge(parseFloat(e.target.value) || 0)}
                data-testid="order-shipping-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paidAmount">Paid Amount</Label>
              <Input
                id="paidAmount"
                type="number"
                step="0.01"
                min="0"
                max={total}
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                data-testid="order-paid-amount-input"
              />
            </div>
          </div>

          <div className="panel-muted space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount:</span>
              <span className="font-medium text-destructive">-{formatCurrency(discount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping:</span>
              <span className="font-medium">+{formatCurrency(shippingCharge)}</span>
            </div>
            <div className="flex justify-between border-t border-border/70 pt-2 text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Paid:</span>
              <span className="font-medium text-emerald-700">{formatCurrency(paidAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pending:</span>
              <span className={`font-medium ${pending > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {formatCurrency(pending)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border/70 pt-2 text-sm">
              <span className="text-muted-foreground">Payment Status:</span>
              <span className={`font-semibold ${
                paymentStatus === 'PAID' ? 'text-emerald-700' :
                paymentStatus === 'PARTIALLY_PAID' ? 'text-amber-700' :
                'text-destructive'
              }`}>
                {paymentStatus.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this order..."
              data-testid="order-notes-input"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading} data-testid="save-order-button">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Order'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.replace('/orders')}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
