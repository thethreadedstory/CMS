'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deletePurchase } from '@/app/actions/purchases'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'

interface Purchase {
  id: string
  purchaseNumber: string
  purchaseDate: Date
  totalAmount: number
  paymentStatus: string
  order: {
    id: string
    orderNumber: string
  } | null
  supplier: {
    id: string
    name: string
  } | null
  _count: {
    items: number
  }
}

interface PurchaseListProps {
  purchases: Purchase[]
}

const statusColors: Record<string, string> = {
  UNPAID: 'border-rose-200 bg-rose-100/80 text-rose-900',
  PARTIALLY_PAID: 'border-amber-200 bg-amber-100/80 text-amber-900',
  PAID: 'border-emerald-200 bg-emerald-100/80 text-emerald-900',
}

export function PurchaseList({ purchases }: PurchaseListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<{
    id: string
    purchaseNumber: string
  } | null>(null)

  const handleDeleteClick = (id: string, purchaseNumber: string) => {
    setSelectedPurchase({ id, purchaseNumber })
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPurchase) return

    setDeletingId(selectedPurchase.id)

    try {
      await deletePurchase(selectedPurchase.id)
      toast.success(`Purchase "${selectedPurchase.purchaseNumber}" deleted successfully`)
      setConfirmOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete purchase'
      )
    } finally {
      setDeletingId(null)
      setSelectedPurchase(null)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {purchases.length === 0 ? (
          <Card className="empty-state">
            <div>
              <p className="text-base font-medium text-muted-foreground">No purchases recorded yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a purchase to track raw material stock and supplier spending.
              </p>
            </div>
          </Card>
        ) : (
          <div className="data-table">
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Purchase</th>
                    <th>Order</th>
                    <th>Supplier</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} data-testid={`purchase-row-${purchase.id}`}>
                      <td>
                        <p className="font-medium text-foreground">{purchase.purchaseNumber}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {purchase._count.items} item(s)
                        </p>
                      </td>
                      <td className="text-sm text-foreground">
                        {purchase.order ? (
                          <Link
                            href={`/orders/${purchase.order.id}`}
                            className="font-medium text-sky-700 hover:underline"
                          >
                            {purchase.order.orderNumber}
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="text-sm text-foreground">
                        {purchase.supplier?.name || 'N/A'}
                      </td>
                      <td className="text-sm text-muted-foreground">
                        {formatDate(purchase.purchaseDate)}
                      </td>
                      <td className="text-sm font-semibold text-foreground">
                        {formatCurrency(purchase.totalAmount)}
                      </td>
                      <td>
                        <Badge className={statusColors[purchase.paymentStatus]}>
                          {purchase.paymentStatus.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/purchases/${purchase.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground"
                              data-testid={`view-purchase-${purchase.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/purchases/${purchase.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-primary"
                              data-testid={`edit-purchase-${purchase.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              handleDeleteClick(purchase.id, purchase.purchaseNumber)
                            }
                            disabled={deletingId === purchase.id}
                            data-testid={`delete-purchase-${purchase.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Purchase"
        description={`Are you sure you want to delete "${selectedPurchase?.purchaseNumber}"? This action cannot be undone.`}
        loading={!!deletingId}
        confirmText="Delete Purchase"
        loadingText="Deleting..."
      />
    </>
  )
}
