import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Edit, Mail, MapPin, Phone } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

const paymentColors: Record<string, string> = {
  UNPAID: 'border-rose-200 bg-rose-100/80 text-rose-900',
  PARTIALLY_PAID: 'border-amber-200 bg-amber-100/80 text-amber-900',
  PAID: 'border-emerald-200 bg-emerald-100/80 text-emerald-900',
  REFUNDED: 'border-stone-200 bg-stone-100/80 text-stone-800',
}

export default async function SupplierDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      contactPerson: true,
      phone: true,
      email: true,
      address: true,
      notes: true,
      materials: {
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          unit: true,
          currentStock: true,
          minimumStock: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      },
      purchases: {
        orderBy: { purchaseDate: 'desc' },
        select: {
          id: true,
          purchaseNumber: true,
          purchaseDate: true,
          totalAmount: true,
          paymentStatus: true,
        },
      },
    },
  })

  if (!supplier) {
    notFound()
  }

  const totalPurchaseValue = supplier.purchases.reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/suppliers">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Suppliers
          </Button>
        </Link>
        <Link href={`/suppliers/${supplier.id}/edit`}>
          <Button data-testid="edit-supplier-button">
            <Edit className="mr-2 h-4 w-4" />
            Edit Supplier
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="page-title">{supplier.name}</h1>
        <p className="page-copy">Supplier details and sourcing activity</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Materials</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{supplier.materials.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Purchases</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{supplier.purchases.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Purchase Value</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {formatCurrency(totalPurchaseValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {supplier.contactPerson && (
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p className="text-foreground">{supplier.contactPerson}</p>
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-foreground">{supplier.phone}</p>
                </div>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground">{supplier.email}</p>
                </div>
              </div>
            )}
            {supplier.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="text-foreground">{supplier.address}</p>
                </div>
              </div>
            )}
            {!supplier.contactPerson && !supplier.phone && !supplier.email && !supplier.address && (
              <p className="text-sm text-muted-foreground">No contact details added.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              {supplier.notes || 'No notes added for this supplier.'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Materials Supplied</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {supplier.materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No materials assigned to this supplier.</p>
          ) : (
            <div className="space-y-4">
              {supplier.materials.map((material) => {
                const isLowStock = material.currentStock <= material.minimumStock

                return (
                  <Link
                    key={material.id}
                    href={`/inventory/${material.id}`}
                    className="block rounded-lg border border-border/70 p-4 transition-colors hover:bg-[hsl(var(--surface-soft))]/60"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground">{material.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {material.category?.name || 'Uncategorized'} • {material.unit}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className={isLowStock ? 'font-medium text-destructive' : 'font-medium text-foreground'}>
                          {material.currentStock} {material.unit}
                        </p>
                        <p className="text-muted-foreground">
                          Min {material.minimumStock} {material.unit}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {supplier.purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No purchases recorded for this supplier.</p>
          ) : (
            <div className="space-y-4">
              {supplier.purchases.map((purchase) => (
                <Link
                  key={purchase.id}
                  href={`/purchases/${purchase.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/70 p-4 transition-colors hover:bg-[hsl(var(--surface-soft))]/60"
                >
                  <div>
                    <p className="font-medium text-foreground">{purchase.purchaseNumber}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(purchase.purchaseDate)}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${paymentColors[purchase.paymentStatus]}`}
                    >
                      {purchase.paymentStatus.replace('_', ' ')}
                    </span>
                    <p className="mt-2 font-semibold text-foreground">
                      {formatCurrency(purchase.totalAmount)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
