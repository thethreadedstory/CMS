'use client'

import { Card } from '@/components/ui/card'

interface Supplier {
  id: string
  name: string
  contactPerson: string | null
  phone: string | null
  email: string | null
  address: string | null
  _count: {
    materials: number
    purchases: number
  }
}

interface SupplierListProps {
  suppliers: Supplier[]
}

export function SupplierList({ suppliers }: SupplierListProps) {
  return (
    <div className="space-y-4">
      {suppliers.length === 0 ? (
        <Card className="empty-state">
          <div>
            <p className="text-base font-medium text-muted-foreground">No suppliers added yet.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} className="overflow-hidden">
              <div className="p-6">
                <h3 className="mb-2 text-lg font-semibold text-foreground">{supplier.name}</h3>
                
                {supplier.contactPerson && (
                  <p className="text-sm text-muted-foreground">Contact: {supplier.contactPerson}</p>
                )}
                
                {supplier.phone && (
                  <p className="mt-1 text-sm text-muted-foreground">{supplier.phone}</p>
                )}
                
                {supplier.email && (
                  <p className="mt-1 text-sm text-muted-foreground">{supplier.email}</p>
                )}
                
                {supplier.address && (
                  <p className="mt-2 text-sm text-muted-foreground">{supplier.address}</p>
                )}

                <div className="mt-4 flex gap-4 border-t border-border/70 pt-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">{supplier._count.materials}</span> Materials
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{supplier._count.purchases}</span> Purchases
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
