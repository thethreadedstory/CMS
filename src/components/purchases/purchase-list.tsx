'use client'

import { useState } from 'react'
import { ActionIconButton, ActionIconLink } from '@/components/ui/action-icon-button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { deletePurchase } from '@/app/actions/purchases'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
              <Table>
                <TableHeader className="bg-[hsl(var(--surface-soft))]">
                  <TableRow>
                    <TableHead>Purchase</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id} data-testid={`purchase-row-${purchase.id}`}>
                      <TableCell>
                        <p className="font-medium text-foreground">{purchase.purchaseNumber}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {purchase._count.items} item(s)
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
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
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {purchase.supplier?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(purchase.purchaseDate)}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-foreground">
                        {formatCurrency(purchase.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[purchase.paymentStatus]}>
                          {purchase.paymentStatus.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <ActionIconLink
                            href={`/purchases/${purchase.id}`}
                            label="View purchase"
                            dataTestId={`view-purchase-${purchase.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </ActionIconLink>
                          <ActionIconLink
                            href={`/purchases/${purchase.id}/edit`}
                            label="Edit purchase"
                            tone="primary"
                            dataTestId={`edit-purchase-${purchase.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </ActionIconLink>
                          <ActionIconButton
                            label="Delete purchase"
                            tone="destructive"
                            onClick={() =>
                              handleDeleteClick(purchase.id, purchase.purchaseNumber)
                            }
                            disabled={deletingId === purchase.id}
                            dataTestId={`delete-purchase-${purchase.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </ActionIconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
