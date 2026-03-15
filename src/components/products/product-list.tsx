'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Eye, Edit, Trash2, AlertCircle } from 'lucide-react'
import { deleteProduct } from '@/app/actions/products'

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
  variants: any[]
  _count: { orderItems: number }
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

  const handleFilter = (searchValue: string, categoryValue: string) => {
    const params = new URLSearchParams()
    if (searchValue) params.set('search', searchValue)
    if (categoryValue) params.set('category', categoryValue)
    router.push(`/products${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete product "${name}"?`)) {
      setDeletingId(id)
      try {
        await deleteProduct(id)
        router.refresh()
      } catch (error) {
        alert('Failed to delete product. It may be used in orders.')
      } finally {
        setDeletingId(null)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              handleFilter(e.target.value, category)
            }}
            className="pl-10"
            data-testid="product-search-input"
          />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            handleFilter(search, e.target.value)
          }}
          className="h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
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

      {products.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-gray-500">No products found.</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or add a new product.</p>
          </div>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => {
                  const isLowStock = product.currentStock <= product.lowStockAlert
                  const profit = product.sellingPrice - product.costPrice
                  const profitMargin = ((profit / product.sellingPrice) * 100).toFixed(1)

                  return (
                    <tr key={product.id} className="hover:bg-gray-50" data-testid={`product-row-${product.id}`}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                          {product.variants.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">{product.variants.length} variant(s)</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.category?.name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">{formatCurrency(product.sellingPrice)}</p>
                          <p className="text-gray-500">Cost: {formatCurrency(product.costPrice)}</p>
                          <p className="text-xs text-green-600">Margin: {profitMargin}%</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                            {product.currentStock}
                          </span>
                          {isLowStock && <AlertCircle className="h-4 w-4 text-red-600" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={product.isActive ? 'default' : 'secondary'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/products/${product.id}`}>
                            <Button variant="ghost" size="sm" data-testid={`view-product-${product.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/products/${product.id}/edit`}>
                            <Button variant="ghost" size="sm" data-testid={`edit-product-${product.id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deletingId === product.id}
                            data-testid={`delete-product-${product.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
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
  )
}
