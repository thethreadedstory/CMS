import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface RawMaterial {
  id: string
  name: string
  currentStock: number
  minimumStock: number
}

interface LowStockAlertsProps {
  materials: RawMaterial[]
}

export function LowStockAlerts({ materials }: LowStockAlertsProps) {
  return (
    <Card data-testid="low-stock-alerts">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {materials.length === 0 ? (
          <p className="text-sm text-muted-foreground">All raw materials are well stocked.</p>
        ) : (
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
        )}
      </CardContent>
    </Card>
  )
}
