'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectField } from '@/components/ui/select-field'
import { Textarea } from '@/components/ui/textarea'
import { createProduct, updateProduct } from '@/app/actions/products'
import { generateSkuFromName } from '@/lib/utils'
import { Plus, Trash2, Loader2 } from 'lucide-react'

interface ProductVariant {
  id?: string
  variantType: string
  variantValue: string
  sku: string
  price: number
}

interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  categoryId: string | null
  sellingPrice: number
  costPrice: number
  isActive: boolean
  notes: string | null
  variants: ProductVariant[]
}

interface ProductFormProps {
  product?: Product
  categories: Array<{ id: string; name: string }>
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState(product?.name ?? '')
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '')
  const [isActive, setIsActive] = useState(product?.isActive !== false ? 'true' : 'false')
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || [])
  const sku = generateSkuFromName(name)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    formData.append('variants', JSON.stringify(variants))

    try {
      if (product) {
        await updateProduct(product.id, formData)
      } else {
        await createProduct(formData)
      }
      router.replace('/products')
    } catch (err) {
      setError('Failed to save product. Please try again.')
      setLoading(false)
    }
  }

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        variantType: '',
        variantValue: '',
        sku: '',
        price: 0,
      },
    ])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-[1.4rem] border border-rose-200 bg-rose-100/70 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                data-testid="product-name-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">
                SKU <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sku"
                name="sku"
                required
                value={sku}
                disabled
                placeholder="SKU will be generated automatically"
                data-testid="product-sku-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <SelectField
                id="categoryId"
                name="categoryId"
                value={categoryId}
                onValueChange={setCategoryId}
                placeholder="Select a category"
                emptyLabel="Select a category"
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
                dataTestId="product-category-select"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <SelectField
                id="isActive"
                name="isActive"
                value={isActive}
                onValueChange={setIsActive}
                placeholder="Select status"
                options={[
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' },
                ]}
                dataTestId="product-status-select"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={product?.description || ''}
              placeholder="Enter product description..."
              data-testid="product-description-input"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">
                Selling Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sellingPrice"
                name="sellingPrice"
                type="number"
                step="0.01"
                required
                defaultValue={product?.sellingPrice || ''}
                placeholder="0.00"
                data-testid="product-selling-price-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">
                Cost Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="costPrice"
                name="costPrice"
                type="number"
                step="0.01"
                required
                defaultValue={product?.costPrice || ''}
                placeholder="0.00"
                data-testid="product-cost-price-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={product?.notes || ''}
              placeholder="Add any additional notes..."
              data-testid="product-notes-input"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Product Variants</CardTitle>
            <Button type="button" onClick={addVariant} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {variants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No variants added. Click "Add Variant" to create size, color, or style options.</p>
          ) : (
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="space-y-4 rounded-[1.4rem] border border-border/75 bg-[hsl(var(--surface-soft))]/55 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">Variant {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeVariant(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Input
                        placeholder="e.g., Size, Color"
                        value={variant.variantType}
                        onChange={(e) => updateVariant(index, 'variantType', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input
                        placeholder="e.g., Small, Red"
                        value={variant.variantValue}
                        onChange={(e) => updateVariant(index, 'variantValue', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>SKU</Label>
                      <Input
                        placeholder="Variant SKU"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Variant Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading} data-testid="save-product-button">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            product ? 'Update Product' : 'Add Product'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.replace('/products')}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
