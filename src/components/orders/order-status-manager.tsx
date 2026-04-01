'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateOrderStatus } from '@/app/actions/orders'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface OrderItem {
  id: string
  productName: string
  variantLabel?: string | null
  quantity: number
  deliveredQuantity: number
}

interface OrderStatusManagerProps {
  orderId: string
  currentStatus: string
  deliveredQuantity: number
  totalOrderedQuantity: number
  items: OrderItem[]
}

const statuses = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'READY', label: 'Ready' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'PARTIALLY_DELIVERED', label: 'Partially Delivered' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export function OrderStatusManager({
  orderId,
  currentStatus,
  deliveredQuantity,
  totalOrderedQuantity,
  items,
}: OrderStatusManagerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<{ value: string; label: string } | null>(null)
  const [itemQuantityInputs, setItemQuantityInputs] = useState<Record<string, string>>({})
  const [validationError, setValidationError] = useState('')

  const handleStatusClick = (status: { value: string; label: string }) => {
    setPendingStatus(status)
    if (status.value === 'PARTIALLY_DELIVERED') {
      const initial: Record<string, string> = {}
      items.forEach((item) => {
        initial[item.id] = item.deliveredQuantity > 0 ? String(item.deliveredQuantity) : ''
      })
      setItemQuantityInputs(initial)
    }
    setValidationError('')
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!pendingStatus) {
      return
    }

    let itemDeliveredQuantities: { itemId: string; deliveredQuantity: number }[] | undefined

    if (pendingStatus.value === 'PARTIALLY_DELIVERED') {
      const validated: { itemId: string; deliveredQuantity: number }[] = []

      for (const item of items) {
        const inputVal = itemQuantityInputs[item.id] ?? ''
        const parsed = inputVal === '' ? 0 : Number(inputVal)

        if (!Number.isInteger(parsed) || parsed < 0) {
          setValidationError(`Enter a valid delivered quantity for "${item.productName}".`)
          return
        }

        if (parsed > item.quantity) {
          setValidationError(
            `Delivered quantity for "${item.productName}" cannot exceed ordered quantity (${item.quantity}).`
          )
          return
        }

        if (parsed < item.deliveredQuantity) {
          setValidationError(
            `Delivered quantity for "${item.productName}" cannot be less than already recorded (${item.deliveredQuantity}).`
          )
          return
        }

        validated.push({ itemId: item.id, deliveredQuantity: parsed })
      }

      const totalDelivered = validated.reduce((sum, i) => sum + i.deliveredQuantity, 0)

      if (totalDelivered === 0) {
        setValidationError('At least one item must have a delivered quantity greater than zero.')
        return
      }

      if (totalDelivered >= totalOrderedQuantity) {
        setValidationError('Use "Delivered" status when the full order quantity has been completed.')
        return
      }

      itemDeliveredQuantities = validated
    }

    setLoading(true)
    setValidationError('')

    try {
      await updateOrderStatus(orderId, {
        status: pendingStatus.value,
        itemDeliveredQuantities,
      })
      toast.success(`Order status updated to ${pendingStatus.label}`)
      setConfirmOpen(false)
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Failed to update order status'

      setValidationError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const currentStatusLabel = statuses.find((status) => status.value === currentStatus)?.label ?? currentStatus
  const showDeliveredProgress = deliveredQuantity > 0 || currentStatus === 'PARTIALLY_DELIVERED' || currentStatus === 'DELIVERED'

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Update Order Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {showDeliveredProgress ? (
            <div className="rounded-xl border border-border/70 bg-[hsl(var(--surface-soft))]/60 px-4 py-3 text-sm">
              Delivered so far: <span className="font-semibold text-foreground">{deliveredQuantity}</span> / {totalOrderedQuantity}
            </div>
          ) : null}

          <div className="space-y-2">
            {statuses.map((status) => {
              const isCurrent = status.value === currentStatus

              return (
                <Button
                  key={status.value}
                  variant={isCurrent ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => !isCurrent && handleStatusClick(status)}
                  disabled={loading || isCurrent}
                  data-testid={`status-${status.value.toLowerCase()}-button`}
                >
                  {loading && pendingStatus?.value === status.value ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isCurrent ? (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  ) : null}
                  {status.label}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (loading) {
            return
          }

          setConfirmOpen(open)

          if (!open) {
            setPendingStatus(null)
            setValidationError('')
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Order Status</AlertDialogTitle>
            <AlertDialogDescription>
              Change the status from &quot;{currentStatusLabel}&quot; to &quot;{pendingStatus?.label}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {pendingStatus?.value === 'PARTIALLY_DELIVERED' ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Enter the quantity delivered so far for each item.
              </p>
              {items.map((item) => (
                <div key={item.id} className="space-y-1">
                  <Label htmlFor={`deliveredQuantity-${item.id}`}>
                    {item.productName}
                    {item.variantLabel ? (
                      <span className="ml-1 text-muted-foreground">({item.variantLabel})</span>
                    ) : null}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      ordered: {item.quantity}
                    </span>
                  </Label>
                  <Input
                    id={`deliveredQuantity-${item.id}`}
                    type="number"
                    min={item.deliveredQuantity}
                    max={item.quantity}
                    step="1"
                    value={itemQuantityInputs[item.id] ?? ''}
                    onChange={(e) =>
                      setItemQuantityInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    disabled={loading}
                    placeholder={`0–${item.quantity}`}
                  />
                </div>
              ))}
            </div>
          ) : null}

          {validationError ? (
            <p className="text-sm text-destructive">{validationError}</p>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void handleConfirm()
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
