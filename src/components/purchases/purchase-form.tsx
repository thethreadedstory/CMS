'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calculator, Loader2, Plus, Trash2 } from 'lucide-react'
import { createPurchase, updatePurchase } from '@/app/actions/purchases'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectField } from '@/components/ui/select-field'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'

interface PurchaseFormSupplier {
  id: string
  name: string
}

interface PurchaseFormMaterial {
  id: string
  name: string
  unit: string
  costPerUnit: number
}

interface PurchaseFormOrder {
  id: string
  orderNumber: string
  totalAmount: number
  customerName: string
  linkedPurchaseTotal: number
}

interface PurchaseItem {
  materialId: string
  quantity: number
  costPerUnit: number
}

interface PurchaseFormProps {
  suppliers: PurchaseFormSupplier[]
  materials: PurchaseFormMaterial[]
  orders: PurchaseFormOrder[]
  purchaseId?: string
  initialData?: {
    orderId: string
    supplierId: string
    purchaseDate: string
    paymentStatus: string
    notes: string
    items: PurchaseItem[]
  }
}

export function PurchaseForm({
  suppliers,
  materials,
  orders,
  purchaseId,
  initialData,
}: PurchaseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState(initialData?.orderId ?? '')
  const [supplierId, setSupplierId] = useState(initialData?.supplierId ?? '')
  const [purchaseDate, setPurchaseDate] = useState(
    initialData?.purchaseDate ?? new Date().toISOString().split('T')[0]
  )
  const [paymentStatus, setPaymentStatus] = useState(initialData?.paymentStatus ?? 'UNPAID')
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [items, setItems] = useState<PurchaseItem[]>(initialData?.items ?? [])
  const isEditMode = Boolean(purchaseId)

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.costPerUnit, 0),
    [items]
  )
  const initialTotalAmount = useMemo(
    () =>
      (initialData?.items ?? []).reduce(
        (sum, item) => sum + item.quantity * item.costPerUnit,
        0
      ),
    [initialData?.items]
  )
  const selectedOrder = useMemo(
    () => orders.find((entry) => entry.id === orderId) ?? null,
    [orderId, orders]
  )
  const linkedRawMaterialSpend = useMemo(() => {
    if (!selectedOrder) {
      return null
    }

    const previousSpendForThisPurchase =
      purchaseId && initialData?.orderId === selectedOrder.id ? initialTotalAmount : 0

    return selectedOrder.linkedPurchaseTotal - previousSpendForThisPurchase + totalAmount
  }, [initialData?.orderId, initialTotalAmount, purchaseId, selectedOrder, totalAmount])
  const estimatedNetProfit = useMemo(() => {
    if (!selectedOrder || linkedRawMaterialSpend === null) {
      return null
    }

    return selectedOrder.totalAmount - linkedRawMaterialSpend
  }, [linkedRawMaterialSpend, selectedOrder])

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        materialId: '',
        quantity: 1,
        costPerUnit: 0,
      },
    ])
  }

  const removeItem = (index: number) => {
    setItems((currentItems) => currentItems.filter((_, itemIndex) => itemIndex !== index))
  }

  const updateItem = (
    index: number,
    field: keyof PurchaseItem,
    value: string | number
  ) => {
    setItems((currentItems) => {
      const nextItems = [...currentItems]
      const nextItem = { ...nextItems[index], [field]: value }

      if (field === 'materialId') {
        const material = materials.find((entry) => entry.id === value)
        nextItem.costPerUnit = material?.costPerUnit ?? 0
      }

      nextItems[index] = nextItem
      return nextItems
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    if (items.length === 0) {
      setError('Please add at least one material to this purchase.')
      setLoading(false)
      return
    }

    if (items.some((item) => !item.materialId || item.quantity <= 0 || item.costPerUnit < 0)) {
      setError('Please complete all purchase item details.')
      setLoading(false)
      return
    }

    if (new Set(items.map((item) => item.materialId)).size !== items.length) {
      setError('Each material can only be added once per purchase.')
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.set('orderId', orderId)
      formData.set('supplierId', supplierId)
      formData.set('purchaseDate', purchaseDate)
      formData.set('paymentStatus', paymentStatus)
      formData.set('notes', notes)
      formData.set('items', JSON.stringify(items))
      if (purchaseId) {
        await updatePurchase(purchaseId, formData)
      } else {
        await createPurchase(formData)
      }
      router.replace('/purchases')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save purchase. Please try again.')
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
          <CardTitle>Purchase Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="orderId">Purchase for Which Order</Label>
              <SelectField
                id="orderId"
                value={orderId}
                onValueChange={setOrderId}
                placeholder="Not linked to any order"
                emptyLabel="Not linked to any order"
                options={orders.map((order) => ({
                  value: order.id,
                  label: `${order.orderNumber} - ${order.customerName} - ${formatCurrency(order.totalAmount)}`,
                }))}
                dataTestId="purchase-order-select"
              />
              <p className="text-xs text-muted-foreground">
                Link this purchase to an order to track raw material spend and estimated profit.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierId">Supplier</Label>
              <SelectField
                id="supplierId"
                value={supplierId}
                onValueChange={setSupplierId}
                placeholder="Select a supplier"
                emptyLabel="Select a supplier"
                options={suppliers.map((supplier) => ({
                  value: supplier.id,
                  label: supplier.name,
                }))}
                dataTestId="purchase-supplier-select"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseDate">
                Purchase Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(event) => setPurchaseDate(event.target.value)}
                required
                data-testid="purchase-date-input"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="paymentStatus">
                Payment Status <span className="text-red-500">*</span>
              </Label>
              <SelectField
                id="paymentStatus"
                value={paymentStatus}
                onValueChange={setPaymentStatus}
                placeholder="Select payment status"
                options={[
                  { value: 'UNPAID', label: 'Unpaid' },
                  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
                  { value: 'PAID', label: 'Paid' },
                ]}
                required
                dataTestId="purchase-payment-status-select"
              />
            </div>
          </div>

          {selectedOrder && linkedRawMaterialSpend !== null && estimatedNetProfit !== null && (
            <div className="mt-6 rounded-[1.6rem] border border-border/80 bg-[hsl(var(--surface-soft))]/65 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {selectedOrder.orderNumber} · {selectedOrder.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Estimated after saving this purchase
                  </p>
                </div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Order total {formatCurrency(selectedOrder.totalAmount)}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-[1.2rem] border border-border/70 bg-background/70 p-4">
                  <p className="text-sm text-muted-foreground">Raw material spend</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {formatCurrency(linkedRawMaterialSpend)}
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-border/70 bg-background/70 p-4">
                  <p className="text-sm text-muted-foreground">Estimated net profit</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {formatCurrency(estimatedNetProfit)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Purchase Items</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              disabled={materials.length === 0}
              data-testid="add-purchase-item-button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add at least one raw material before recording a purchase.
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No items added. Click &quot;Add Item&quot; to include raw materials in this purchase.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const itemTotal = item.quantity * item.costPerUnit

                return (
                  <div
                    key={index}
                    className="space-y-4 rounded-[1.4rem] border border-border/75 bg-[hsl(var(--surface-soft))]/55 p-4"
                  >
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

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="md:col-span-3 space-y-2">
                        <Label>Material</Label>
                        <SelectField
                          value={item.materialId}
                          onValueChange={(value) => updateItem(index, 'materialId', value)}
                          placeholder="Select material"
                          options={materials.map((entry) => ({
                            value: entry.id,
                            label: `${entry.name} (${entry.unit})`,
                          }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(index, 'quantity', parseFloat(event.target.value) || 0)
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Cost Per Unit</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.costPerUnit}
                          onChange={(event) =>
                            updateItem(index, 'costPerUnit', parseFloat(event.target.value) || 0)
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Item Total</Label>
                        <div className="flex h-10 items-center rounded-md border border-border bg-muted/20 px-3 text-sm font-medium text-foreground">
                          {formatCurrency(itemTotal)}
                        </div>
                      </div>
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
          <CardTitle>Notes & Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Add invoice, transport, or payment notes..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              data-testid="purchase-notes-input"
            />
          </div>

          <div className="rounded-[1.6rem] border border-border/80 bg-[hsl(var(--surface-soft))]/65 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calculator className="h-4 w-4" />
              Purchase total
            </div>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading} data-testid="save-purchase-button">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            isEditMode ? 'Update Purchase' : 'Create Purchase'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/purchases')}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
