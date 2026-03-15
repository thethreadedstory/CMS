'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

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
  categories: Array<{ id: string; name: string }>
}

export function InventoryList({ materials, categories }: InventoryListProps) {
  return (
    <div className="space-y-4">
      {materials.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-gray-500">No materials in inventory.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => {
            const isLowStock = material.currentStock <= material.minimumStock
            const stockValue = material.currentStock * material.costPerUnit

            return (
              <Card key={material.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{material.name}</h3>
                      {material.category && (
                        <p className="text-sm text-gray-500">{material.category.name}</p>
                      )}
                    </div>
                    {isLowStock && <AlertCircle className="h-5 w-5 text-red-600" />}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Stock:</span>
                      <span className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {material.currentStock} {material.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Minimum Stock:</span>
                      <span className="text-gray-600">{material.minimumStock} {material.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cost/Unit:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(material.costPerUnit)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-gray-600">Stock Value:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(stockValue)}</span>
                    </div>
                  </div>

                  {material.supplier && (
                    <p className="text-xs text-gray-500">Supplier: {material.supplier.name}</p>
                  )}

                  {isLowStock && (
                    <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-600">
                      Low stock alert!
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
