'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { updateOrderStatus } from '@/app/actions/orders'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

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

  const handleStatusChange = async (newStatus: string) => {
    if (confirm(`Are you sure you want to change the status to ${newStatus.replace('_', ' ')}?`)) {
      setLoading(true)
      try {
        await updateOrderStatus(orderId, newStatus)
        router.refresh()
      } catch (error) {
        alert('Failed to update status')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Order Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {statuses.map((status) => {
          const isCurrent = status.value === currentStatus
          return (
            <Button
              key={status.value}
              variant={isCurrent ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => !isCurrent && handleStatusChange(status.value)}
              disabled={loading || isCurrent}
              data-testid={`status-${status.value.toLowerCase()}-button`}
            >
              {isCurrent && <CheckCircle className="h-4 w-4 mr-2" />}
              {status.label}
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
