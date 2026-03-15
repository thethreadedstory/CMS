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
        <Card className="p-12">
          <div className="text-center">
            <p className="text-gray-500">No suppliers added yet.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} className="overflow-hidden">
              <div className="p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{supplier.name}</h3>
                
                {supplier.contactPerson && (
                  <p className="text-sm text-gray-600">Contact: {supplier.contactPerson}</p>
                )}
                
                {supplier.phone && (
                  <p className="text-sm text-gray-600 mt-1">{supplier.phone}</p>
                )}
                
                {supplier.email && (
                  <p className="text-sm text-gray-600 mt-1">{supplier.email}</p>
                )}
                
                {supplier.address && (
                  <p className="text-sm text-gray-500 mt-2">{supplier.address}</p>
                )}

                <div className="flex gap-4 mt-4 pt-4 border-t text-sm text-gray-600">
                  <div>
                    <span className="font-medium">{supplier._count.materials}</span> Materials
                  </div>
                  <div>
                    <span className="font-medium">{supplier._count.purchases}</span> Purchases
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
