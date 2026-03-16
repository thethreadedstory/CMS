'use client'

import { startTransition, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Eye, Edit, Trash2, AlertCircle } from 'lucide-react'
import { deleteProduct } from '@/app/actions/products'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  sku: string
  sellingPrice: number
  costPrice: number
  currentStock: number
  lowStockAlert: number
  isActive: boolean
  category: { id: string; name: string } | null
  _count: { variants: number }
}

interface ProductListProps {
  products: Product[]
  categories: Array<{ id: string; name: string }>
  initialSearch: string
  initialCategory: string
}

export function ProductList({
  products,
  categories,
  initialSearch,
  initialCategory,
}: ProductListProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null)

  const navigateWithFilters = (searchValue: string, categoryValue: string) => {
    const params = new URLSearchParams()
    if (searchValue) params.set('search', searchValue)
    if (categoryValue) params.set('category', categoryValue)
    startTransition(() => {
      router.replace(`/products${params.toString() ? `?${params.toString()}` : ''}`, {
        scroll: false,
      })
    })
  }

  useEffect(() => {
    if (search === initialSearch) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      navigateWithFilters(search, category)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [search, category, initialSearch])

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedProduct({ id, name })
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return
    
    setDeletingId(selectedProduct.id)
    
    try {
      await deleteProduct(selectedProduct.id)
      toast.success(`Product "${selectedProduct.name}" deleted successfully`)
      setConfirmOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete product. It may be used in orders.')
    } finally {
      setDeletingId(null)
      setSelectedProduct(null)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-[1.6rem] border border-border/80 bg-white/78 p-4 shadow-[0_18px_45px_rgba(34,48,51,0.06)]">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="product-search-input"
            />
          </div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              navigateWithFilters(search, e.target.value)
            }}
            className="field-select sm:max-w-[220px]"
            data-testid="product-category-filter"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        </div>

        {products.length === 0 ? (
          <Card className="empty-state">
            <div>
              <p className="text-base font-medium text-muted-foreground">No products found.</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or add a new product.</p>
            </div>
          </Card>
        ) : (
          <div className="data-table">
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>
                      Product
                    </th>
                    <th>
                      Category
                    </th>
                    <th>
                      Price
                    </th>
                    <th>
                      Stock
                    </th>
                    <th>
                      Status
                    </th>
                    <th className="text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const isLowStock = product.currentStock <= product.lowStockAlert
                    const profit = product.sellingPrice - product.costPrice
                    const profitMargin = ((profit / product.sellingPrice) * 100).toFixed(1)

                    return (
                      <tr key={product.id} data-testid={`product-row-${product.id}`}>
                        <td>
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                            {product._count.variants > 0 && (
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{product._count.variants} variant(s)</p>
                            )}
                          </div>
                        </td>
                        <td className="text-sm text-muted-foreground">
                          {product.category?.name || '-'}
                        </td>
                        <td>
                          <div className="text-sm">
                            <p className="font-semibold text-foreground">{formatCurrency(product.sellingPrice)}</p>
                            <p className="text-muted-foreground">Cost: {formatCurrency(product.costPrice)}</p>
                            <p className="text-xs text-emerald-700">Margin: {profitMargin}%</p>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                              {product.currentStock}
                            </span>
                            {isLowStock && <AlertCircle className="h-4 w-4 text-destructive" />}
                          </div>
                        </td>
                        <td>
                          <Badge variant={product.isActive ? 'default' : 'secondary'}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/products/${product.id}`}>
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid={`view-product-${product.id}`}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/products/${product.id}/edit`}>
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" data-testid={`edit-product-${product.id}`}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteClick(product.id, product.name)}
                              disabled={deletingId === product.id}
                              data-testid={`delete-product-${product.id}`}
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
        title="Delete Product"
        description={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        loading={!!deletingId}
        confirmText="Delete Product"
        loadingText="Deleting..."
      />
    </>
  )
}
