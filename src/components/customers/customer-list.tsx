'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteCustomer } from '@/app/actions/customers'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
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

  const handleSearch = (value: string) => {
    setSearch(value)
    const params = new URLSearchParams()
    if (value) params.set('search', value)
    router.push(`/customers${value ? `?${params.toString()}` : ''}`)
  }

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedCustomer({ id, name })
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return
    
    setDeletingId(selectedCustomer.id)
    setConfirmOpen(false)
    
    try {
      await deleteCustomer(selectedCustomer.id)
      toast.success(`Customer "${selectedCustomer.name}" deleted successfully`)
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
              onChange={(e) => handleSearch(e.target.value)}
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
              <table>
                <thead>
                  <tr>
                    <th>
                      Customer
                    </th>
                    <th>
                      Contact
                    </th>
                    <th>
                      Orders
                    </th>
                    <th>
                      Total Spent
                    </th>
                    <th>
                      Pending
                    </th>
                    <th className="text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} data-testid={`customer-row-${customer.id}`}>
                      <td>
                        <div>
                          <p className="font-medium text-foreground">{customer.name}</p>
                          {customer.city && <p className="text-sm text-muted-foreground">{customer.city}</p>}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {customer.phone && <p className="text-foreground">{customer.phone}</p>}
                          {customer.email && <p className="text-muted-foreground">{customer.email}</p>}
                        </div>
                      </td>
                      <td className="text-sm text-foreground">
                        {customer.orderCount}
                      </td>
                      <td className="text-sm font-medium text-foreground">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td className="text-sm">
                        <span className={customer.pendingAmount > 0 ? 'font-medium text-destructive' : 'text-muted-foreground'}>
                          {formatCurrency(customer.pendingAmount)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/customers/${customer.id}`}>
                            <Button variant="ghost" size="sm" data-testid={`view-customer-${customer.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/customers/${customer.id}/edit`}>
                            <Button variant="ghost" size="sm" data-testid={`edit-customer-${customer.id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(customer.id, customer.name)}
                            disabled={deletingId === customer.id}
                            data-testid={`delete-customer-${customer.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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
        title="Delete Customer"
        description={`Are you sure you want to delete "${selectedCustomer?.name}"? This action cannot be undone.`}
      />
    </>
  )
}
