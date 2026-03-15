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
          <AlertCircle className="h-5 w-5 text-red-600" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAlerts ? (
          <p className="text-sm text-gray-500">All items are well stocked!</p>
        ) : (
          <div className="space-y-4">
            {products.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Products</h4>
                <div className="space-y-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg" data-testid={`low-stock-product-${product.id}`}>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-600">
                          Stock: {product.currentStock} (Alert at: {product.lowStockAlert})
                        </p>
                      </div>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {materials.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Raw Materials</h4>
                <div className="space-y-2">
                  {materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg" data-testid={`low-stock-material-${material.id}`}>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{material.name}</p>
                        <p className="text-xs text-gray-600">
                          Stock: {material.currentStock} (Min: {material.minimumStock})
                        </p>
                      </div>
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
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
