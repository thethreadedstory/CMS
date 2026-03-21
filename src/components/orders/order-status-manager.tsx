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

interface OrderStatusManagerProps {
  orderId: string
  currentStatus: string
  deliveredQuantity: number
  totalOrderedQuantity: number
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
}: OrderStatusManagerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<{ value: string; label: string } | null>(null)
  const [deliveredQuantityInput, setDeliveredQuantityInput] = useState(
    deliveredQuantity > 0 ? String(deliveredQuantity) : ''
  )
  const [validationError, setValidationError] = useState('')

  const handleStatusClick = (status: { value: string; label: string }) => {
    setPendingStatus(status)
    setDeliveredQuantityInput(deliveredQuantity > 0 ? String(deliveredQuantity) : '')
    setValidationError('')
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!pendingStatus) {
      return
    }

    let nextDeliveredQuantity: number | undefined

    if (pendingStatus.value === 'PARTIALLY_DELIVERED') {
      const parsedQuantity = Number(deliveredQuantityInput)

      if (!Number.isInteger(parsedQuantity)) {
        setValidationError('Enter a whole delivered quantity.')
        return
      }

      if (parsedQuantity <= 0) {
        setValidationError('Delivered quantity must be greater than zero.')
        return
      }

      if (parsedQuantity >= totalOrderedQuantity) {
        setValidationError('Use delivered when the full order quantity has been completed.')
        return
      }

      nextDeliveredQuantity = parsedQuantity
    }

    setLoading(true)
    setValidationError('')

    try {
      await updateOrderStatus(orderId, {
        status: pendingStatus.value,
        deliveredQuantity: nextDeliveredQuantity,
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
            <div className="space-y-2">
              <Label htmlFor="deliveredQuantity">Delivered Quantity So Far</Label>
              <Input
                id="deliveredQuantity"
                type="number"
                min={Math.max(1, deliveredQuantity)}
                max={Math.max(1, totalOrderedQuantity - 1)}
                step="1"
                value={deliveredQuantityInput}
                onChange={(event) => setDeliveredQuantityInput(event.target.value)}
                disabled={loading}
                data-testid="partial-delivered-quantity-input"
              />
              <p className="text-xs text-muted-foreground">
                Enter the total quantity delivered so far out of {totalOrderedQuantity}.
              </p>
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
