'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Eye, Edit, AlertCircle } from 'lucide-react'

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

  const handleFilter = (searchValue: string, categoryValue: string) => {
    const params = new URLSearchParams()
    if (searchValue) params.set('search', searchValue)
    if (categoryValue) params.set('category', categoryValue)
    router.push(`/products${params.toString() ? `?${params.toString()}` : ''}`)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const isLowStock = product.currentStock <= product.lowStockAlert
            const profit = product.sellingPrice - product.costPrice
            const profitMargin = ((profit / product.sellingPrice) * 100).toFixed(1)

            return (
              <Card key={product.id} className="overflow-hidden" data-testid={`product-card-${product.id}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
                    </div>
                    {!product.isActive && (
                      <Badge variant="secondary" className="ml-2">
                        Inactive
                      </Badge>
                    )}
                  </div>

                  {product.category && (
                    <Badge variant="outline" className="mb-3">
                      {product.category.name}
                    </Badge>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Selling Price:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(product.sellingPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cost Price:</span>
                      <span className="text-gray-600">{formatCurrency(product.costPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Profit Margin:</span>
                      <span className="text-green-600 font-medium">{profitMargin}%</span>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-lg ${isLowStock ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <div>
                      <p className="text-xs text-gray-600">Stock</p>
                      <p className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.currentStock} units
                      </p>
                    </div>
                    {isLowStock && <AlertCircle className="h-5 w-5 text-red-600" />}
                  </div>

                  {product.variants.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">{product.variants.length} variant(s)</p>
                  )}

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <Link href={`/products/${product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full" data-testid={`view-product-${product.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/products/${product.id}/edit`} className="flex-1">
                      <Button size="sm" className="w-full" data-testid={`edit-product-${product.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
