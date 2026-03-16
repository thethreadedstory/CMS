'use client'

import { startTransition, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Eye, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteSupplier } from '@/app/actions/suppliers'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Supplier {
  id: string
  name: string
  contactPerson: string | null
  phone: string | null
  email: string | null
  address: string | null
  _count: {
    materials: number
    purchases: number
  }
}

interface SupplierListProps {
  suppliers: Supplier[]
  initialSearch: string
}

export function SupplierList({ suppliers, initialSearch }: SupplierListProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)

    const timeoutId = window.setTimeout(() => {
      if (search === initialSearch) {
        return
      }

      startTransition(() => {
        router.replace(`/suppliers${search ? `?${params.toString()}` : ''}`, {
          scroll: false,
        })
      })
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [search, initialSearch, router])

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedSupplier({ id, name })
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedSupplier) return

    setDeletingId(selectedSupplier.id)

    try {
      await deleteSupplier(selectedSupplier.id)
      toast.success(`Supplier "${selectedSupplier.name}" deleted successfully`)
      setConfirmOpen(false)
      router.refresh()
    } catch {
      toast.error('Failed to delete supplier')
    } finally {
      setDeletingId(null)
      setSelectedSupplier(null)
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
                placeholder="Search by supplier, contact, phone, or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                data-testid="supplier-search-input"
              />
            </div>
          </div>
        </div>

        {suppliers.length === 0 ? (
          <Card className="empty-state">
            <div>
              <p className="text-base font-medium text-muted-foreground">No suppliers found.</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or add a new supplier.</p>
            </div>
          </Card>
        ) : (
          <div className="data-table">
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Contact</th>
                    <th>Address</th>
                    <th>Materials</th>
                    <th>Purchases</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id} data-testid={`supplier-row-${supplier.id}`}>
                      <td>
                        <div>
                          <p className="font-medium text-foreground">{supplier.name}</p>
                          {supplier.contactPerson && (
                            <p className="text-sm text-muted-foreground">{supplier.contactPerson}</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {supplier.phone && <p className="text-foreground">{supplier.phone}</p>}
                          {supplier.email && <p className="text-muted-foreground">{supplier.email}</p>}
                          {!supplier.phone && !supplier.email && (
                            <p className="text-muted-foreground">-</p>
                          )}
                        </div>
                      </td>
                      <td className="text-sm text-muted-foreground">
                        {supplier.address || '-'}
                      </td>
                      <td className="text-sm font-medium text-foreground">
                        {supplier._count.materials}
                      </td>
                      <td className="text-sm font-medium text-foreground">
                        {supplier._count.purchases}
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/suppliers/${supplier.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground"
                              data-testid={`view-supplier-${supplier.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/suppliers/${supplier.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-primary"
                              data-testid={`edit-supplier-${supplier.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteClick(supplier.id, supplier.name)}
                            disabled={deletingId === supplier.id}
                            data-testid={`delete-supplier-${supplier.id}`}
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
        title="Delete Supplier"
        description={`Are you sure you want to delete "${selectedSupplier?.name}"? This action cannot be undone.`}
        loading={!!deletingId}
        confirmText="Delete Supplier"
        loadingText="Deleting..."
      />
    </>
  )
}
