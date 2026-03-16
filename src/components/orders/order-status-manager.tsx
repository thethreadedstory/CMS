'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { updateOrderStatus } from '@/app/actions/orders'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'

interface OrderStatusManagerProps {
  orderId: string
  currentStatus: string
}

const statuses = [
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'blue' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'purple' },
  { value: 'READY', label: 'Ready', color: 'cyan' },
  { value: 'SHIPPED', label: 'Shipped', color: 'indigo' },
  { value: 'DELIVERED', label: 'Delivered', color: 'green' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
]

export function OrderStatusManager({ orderId, currentStatus }: OrderStatusManagerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<{ value: string; label: string } | null>(null)

  const handleStatusClick = (status: { value: string; label: string }) => {
    setPendingStatus(status)
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!pendingStatus) return
    setLoading(true)
    try {
      await updateOrderStatus(orderId, pendingStatus.value)
      toast.success(`Order status updated to ${pendingStatus.label}`)
      setConfirmOpen(false)
      router.refresh()
    } catch {
      toast.error('Failed to update order status')
    } finally {
      setLoading(false)
      setPendingStatus(null)
    }
  }

  const currentStatusLabel = statuses.find((s) => s.value === currentStatus)?.label ?? currentStatus

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Update Order Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : isCurrent ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : null}
                {status.label}
              </Button>
            )
          })}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open)
          if (!open) setPendingStatus(null)
        }}
        onConfirm={handleConfirm}
        title="Update Order Status"
        description={`Are you sure you want to change the status from "${currentStatusLabel}" to "${pendingStatus?.label}"?`}
        confirmText="Update Status"
        cancelText="Cancel"
        loadingText="Updating..."
        variant="default"
        loading={loading}
      />
    </>
  )
}
