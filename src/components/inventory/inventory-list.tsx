'use client'

import { startTransition, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Eye, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteRawMaterial } from '@/app/actions/raw-materials'
import { ActionIconButton, ActionIconLink } from '@/components/ui/action-icon-button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Material {
  id: string
  name: string
  unit: string
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
                placeholder="Search by material name or unit..."
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
              <Table>
                <TableHeader className="bg-[hsl(var(--surface-soft))]">
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => {
                    return (
                      <TableRow key={material.id} data-testid={`material-row-${material.id}`}>
                        <TableCell className="font-medium text-foreground">{material.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{material.unit}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <ActionIconLink
                              href={`/inventory/${material.id}`}
                              label="View material"
                              dataTestId={`view-material-${material.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </ActionIconLink>
                            <ActionIconLink
                              href={`/inventory/${material.id}/edit`}
                              label="Edit material"
                              tone="primary"
                              dataTestId={`edit-material-${material.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </ActionIconLink>
                            <ActionIconButton
                              label="Delete material"
                              tone="destructive"
                              onClick={() => handleDeleteClick(material.id, material.name)}
                              disabled={deletingId === material.id}
                              dataTestId={`delete-material-${material.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </ActionIconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
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
        title="Delete Material"
        description={`Are you sure you want to delete "${selectedMaterial?.name}"? This action cannot be undone.`}
        loading={!!deletingId}
        confirmText="Delete Material"
        loadingText="Deleting..."
      />
    </>
  )
}
