import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface Product {
  id: string
  name: string
  currentStock: number
  lowStockAlert: number
}

interface RawMaterial {
  id: string
  name: string
  currentStock: number
  minimumStock: number
}

interface LowStockAlertsProps {
  products: Product[]
  materials: RawMaterial[]
}

export function LowStockAlerts({ products, materials }: LowStockAlertsProps) {
  const hasAlerts = products.length > 0 || materials.length > 0

  return (
    <Card data-testid="low-stock-alerts">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAlerts ? (
          <p className="text-sm text-muted-foreground">All items are well stocked.</p>
        ) : (
          <div className="space-y-4">
            {products.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Products</h4>
                <div className="space-y-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between rounded-[1.2rem] border border-rose-200 bg-rose-100/70 p-3" data-testid={`low-stock-product-${product.id}`}>
                      <div>
                        <p className="text-sm font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {product.currentStock} (Alert at: {product.lowStockAlert})
                        </p>
                      </div>
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {materials.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Raw Materials</h4>
                <div className="space-y-2">
                  {materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between rounded-[1.2rem] border border-amber-200 bg-amber-100/70 p-3" data-testid={`low-stock-material-${material.id}`}>
                      <div>
                        <p className="text-sm font-medium text-foreground">{material.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {material.currentStock} (Min: {material.minimumStock})
                        </p>
                      </div>
                      <AlertCircle className="h-4 w-4 text-amber-700" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
