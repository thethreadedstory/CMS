'use client'

import { startTransition, useEffect, useState } from 'react'
import { ActionIconButton, ActionIconLink } from '@/components/ui/action-icon-button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Search, Eye, Edit, Trash2 } from 'lucide-react'
import { deleteCustomer } from '@/app/actions/customers'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  city: string | null
  orderCount: number
  totalSpent: number
  pendingAmount: number
}

interface CustomerListProps {
  customers: Customer[]
  initialSearch: string
}

export function CustomerList({ customers, initialSearch }: CustomerListProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)

    const timeoutId = window.setTimeout(() => {
      if (search === initialSearch) {
        return
      }

      startTransition(() => {
        router.replace(`/customers${search ? `?${params.toString()}` : ''}`, {
          scroll: false,
        })
      })
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [search, initialSearch, router])

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedCustomer({ id, name })
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return
    
    setDeletingId(selectedCustomer.id)
    
    try {
      await deleteCustomer(selectedCustomer.id)
      toast.success(`Customer "${selectedCustomer.name}" deleted successfully`)
      setConfirmOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete customer. They may have existing orders.')
    } finally {
      setDeletingId(null)
      setSelectedCustomer(null)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-[1.6rem] border border-border/80 bg-white/78 p-4 shadow-[0_18px_45px_rgba(34,48,51,0.06)]">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="customer-search-input"
            />
          </div>
        </div>
        </div>

        {customers.length === 0 ? (
          <Card className="empty-state">
            <div>
              <p className="text-base font-medium text-muted-foreground">No customers found.</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or add a new customer.</p>
            </div>
          </Card>
        ) : (
          <div className="data-table">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[hsl(var(--surface-soft))]">
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} data-testid={`customer-row-${customer.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{customer.name}</p>
                          {customer.city && <p className="text-sm text-muted-foreground">{customer.city}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {customer.phone && <p className="text-foreground">{customer.phone}</p>}
                          {customer.email && <p className="text-muted-foreground">{customer.email}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {customer.orderCount}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className={customer.pendingAmount > 0 ? 'font-medium text-destructive' : 'text-muted-foreground'}>
                          {formatCurrency(customer.pendingAmount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <ActionIconLink
                            href={`/customers/${customer.id}`}
                            label="View customer"
                            dataTestId={`view-customer-${customer.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </ActionIconLink>
                          <ActionIconLink
                            href={`/customers/${customer.id}/edit`}
                            label="Edit customer"
                            tone="primary"
                            dataTestId={`edit-customer-${customer.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </ActionIconLink>
                          <ActionIconButton
                            label="Delete customer"
                            tone="destructive"
                            onClick={() => handleDeleteClick(customer.id, customer.name)}
                            disabled={deletingId === customer.id}
                            dataTestId={`delete-customer-${customer.id}`}
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
        title="Delete Customer"
        description={`Are you sure you want to delete "${selectedCustomer?.name}"? This action cannot be undone.`}
        loading={!!deletingId}
        confirmText="Delete Customer"
        loadingText="Deleting..."
      />
    </>
  )
}
