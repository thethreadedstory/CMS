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
}

export function InventoryList({ materials }: InventoryListProps) {
  return (
    <div className="space-y-4">
      {materials.length === 0 ? (
        <Card className="empty-state">
          <div>
            <p className="text-base font-medium text-muted-foreground">No materials in inventory.</p>
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
                      <h3 className="font-semibold text-foreground">{material.name}</h3>
                      {material.category && (
                        <p className="text-sm text-muted-foreground">{material.category.name}</p>
                      )}
                    </div>
                    {isLowStock && <AlertCircle className="h-5 w-5 text-destructive" />}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Stock:</span>
                      <span className={`font-semibold ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                        {material.currentStock} {material.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Minimum Stock:</span>
                      <span className="text-muted-foreground">{material.minimumStock} {material.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost/Unit:</span>
                      <span className="font-medium text-foreground">{formatCurrency(material.costPerUnit)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border/70 pt-2 text-sm">
                      <span className="text-muted-foreground">Stock Value:</span>
                      <span className="font-semibold text-foreground">{formatCurrency(stockValue)}</span>
                    </div>
                  </div>

                  {material.supplier && (
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Supplier: {material.supplier.name}</p>
                  )}

                  {isLowStock && (
                    <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-100/70 p-2 text-xs font-medium text-destructive">
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
