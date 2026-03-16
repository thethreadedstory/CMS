'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createRawMaterial, updateRawMaterial } from '@/app/actions/raw-materials'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Material {
  id: string
  name: string
  categoryId: string | null
  supplierId: string | null
  unit: string
  currentStock: number
  minimumStock: number
  costPerUnit: number
  notes: string | null
}

interface MaterialFormProps {
  categories: Array<{ id: string; name: string }>
  suppliers: Array<{ id: string; name: string }>
  material?: Material
}

export function MaterialForm({ categories, suppliers, material }: MaterialFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(event.currentTarget)

      if (material) {
        await updateRawMaterial(material.id, formData)
      } else {
        await createRawMaterial(formData)
      }

      router.replace('/inventory')
    } catch {
      setError('Failed to save material. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-[1.4rem] border border-rose-200 bg-rose-100/70 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Material Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={material?.name || ''}
                placeholder="Enter material name"
                data-testid="material-name-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">
                Unit <span className="text-red-500">*</span>
              </Label>
              <Input
                id="unit"
                name="unit"
                required
                defaultValue={material?.unit || ''}
                placeholder="kg, meter, piece, cone"
                data-testid="material-unit-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={material?.categoryId || ''}
                className="field-select"
                data-testid="material-category-select"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierId">Preferred Supplier</Label>
              <select
                id="supplierId"
                name="supplierId"
                defaultValue={material?.supplierId || ''}
                className="field-select"
                data-testid="material-supplier-select"
              >
                <option value="">Select a supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentStock">
                Opening Stock <span className="text-red-500">*</span>
              </Label>
              <Input
                id="currentStock"
                name="currentStock"
                type="number"
                min="0"
                step="0.01"
                defaultValue={material?.currentStock ?? 0}
                required
                data-testid="material-current-stock-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumStock">
                Minimum Stock <span className="text-red-500">*</span>
              </Label>
              <Input
                id="minimumStock"
                name="minimumStock"
                type="number"
                min="0"
                step="0.01"
                defaultValue={material?.minimumStock ?? 0}
                required
                data-testid="material-minimum-stock-input"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="costPerUnit">
                Cost Per Unit <span className="text-red-500">*</span>
              </Label>
              <Input
                id="costPerUnit"
                name="costPerUnit"
                type="number"
                min="0"
                step="0.01"
                defaultValue={material?.costPerUnit ?? 0}
                required
                data-testid="material-cost-per-unit-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              defaultValue={material?.notes || ''}
              placeholder="Add storage, sourcing, or usage notes..."
              className="field-textarea"
              data-testid="material-notes-input"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading} data-testid="save-material-button">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                material ? 'Update Material' : 'Add Material'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.replace('/inventory')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
