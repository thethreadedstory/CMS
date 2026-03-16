'use client'

import { startTransition, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Eye, Edit, Trash2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { deleteRawMaterial } from '@/app/actions/raw-materials'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

interface Material {
  id: string
  name: string
  unit: string
  currentStock: number
  minimumStock: number
  costPerUnit: number
  category: {
    id: string
    name: string
  } | null
  supplier: {
    id: string
    name: string
  } | null
}

interface InventoryListProps {
  materials: Material[]
  initialSearch: string
}

export function InventoryList({ materials, initialSearch }: InventoryListProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)

    const timeoutId = window.setTimeout(() => {
      if (search === initialSearch) {
        return
      }

      startTransition(() => {
        router.replace(`/inventory${search ? `?${params.toString()}` : ''}`, {
          scroll: false,
        })
      })
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [search, initialSearch, router])

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedMaterial({ id, name })
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedMaterial) return

    setDeletingId(selectedMaterial.id)

    try {
      await deleteRawMaterial(selectedMaterial.id)
      toast.success(`Material "${selectedMaterial.name}" deleted successfully`)
      setConfirmOpen(false)
      router.refresh()
    } catch {
      toast.error('Failed to delete material. It may be used in purchases.')
    } finally {
      setDeletingId(null)
      setSelectedMaterial(null)
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
                placeholder="Search by material, unit, category, or supplier..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                data-testid="material-search-input"
              />
            </div>
          </div>
        </div>

        {materials.length === 0 ? (
          <Card className="empty-state">
            <div>
              <p className="text-base font-medium text-muted-foreground">No materials found.</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or add a new material.</p>
            </div>
          </Card>
        ) : (
          <div className="data-table">
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Category</th>
                    <th>Supplier</th>
                    <th>Stock</th>
                    <th>Value</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => {
                    const isLowStock = material.currentStock <= material.minimumStock
                    const stockValue = material.currentStock * material.costPerUnit

                    return (
                      <tr key={material.id} data-testid={`material-row-${material.id}`}>
                        <td>
                          <div>
                            <p className="font-medium text-foreground">{material.name}</p>
                            <p className="text-sm text-muted-foreground">Unit: {material.unit}</p>
                          </div>
                        </td>
                        <td className="text-sm text-muted-foreground">
                          {material.category?.name || '-'}
                        </td>
                        <td className="text-sm text-muted-foreground">
                          {material.supplier?.name || '-'}
                        </td>
                        <td>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={isLowStock ? 'font-medium text-destructive' : 'font-medium text-foreground'}>
                              {material.currentStock} {material.unit}
                            </span>
                            {isLowStock && <AlertCircle className="h-4 w-4 text-destructive" />}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Min: {material.minimumStock} {material.unit}
                          </p>
                        </td>
                        <td>
                          <div className="text-sm">
                            <p className="font-semibold text-foreground">{formatCurrency(stockValue)}</p>
                            <p className="text-muted-foreground">
                              Cost: {formatCurrency(material.costPerUnit)}
                            </p>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/inventory/${material.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground"
                                data-testid={`view-material-${material.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/inventory/${material.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-primary"
                                data-testid={`edit-material-${material.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteClick(material.id, material.name)}
                              disabled={deletingId === material.id}
                              data-testid={`delete-material-${material.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
        title="Delete Material"
        description={`Are you sure you want to delete "${selectedMaterial?.name}"? This action cannot be undone.`}
        loading={!!deletingId}
        confirmText="Delete Material"
        loadingText="Deleting..."
      />
    </>
  )
}
