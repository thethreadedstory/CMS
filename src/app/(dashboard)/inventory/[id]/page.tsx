import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AlertCircle, ArrowLeft, Edit } from 'lucide-react'
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

export default async function MaterialDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const material = await prisma.rawMaterial.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      unit: true,
      currentStock: true,
      minimumStock: true,
      costPerUnit: true,
      notes: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
        },
      },
      purchaseItems: {
        select: {
          id: true,
          quantity: true,
          costPerUnit: true,
          total: true,
          purchase: {
            select: {
              id: true,
              purchaseNumber: true,
              purchaseDate: true,
              paymentStatus: true,
            },
          },
        },
      },
    },
  })

  if (!material) {
    notFound()
  }

  const stockValue = material.currentStock * material.costPerUnit
  const isLowStock = material.currentStock <= material.minimumStock
  const purchaseItems = [...material.purchaseItems].sort(
    (left, right) =>
      right.purchase.purchaseDate.getTime() - left.purchase.purchaseDate.getTime()
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/inventory">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Raw Materials
          </Button>
        </Link>
        <Link href={`/inventory/${material.id}/edit`}>
          <Button data-testid="edit-material-button">
            <Edit className="mr-2 h-4 w-4" />
            Edit Material
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">{material.name}</h1>
          <p className="page-copy">
            {material.category?.name || 'Uncategorized'} • {material.unit}
          </p>
        </div>
        {isLowStock && (
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-100/80 px-4 py-2 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4" />
            Low stock
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Current Stock</p>
            <p className={`mt-2 text-2xl font-bold ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
              {material.currentStock} {material.unit}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Minimum Stock</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {material.minimumStock} {material.unit}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Stock Value</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {formatCurrency(stockValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Material Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium text-foreground">
                {material.category?.name || 'Uncategorized'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Supplier</span>
              {material.supplier ? (
                <Link
                  href={`/suppliers/${material.supplier.id}`}
                  className="font-medium text-sky-700 hover:underline"
                >
                  {material.supplier.name}
                </Link>
              ) : (
                <span className="font-medium text-foreground">N/A</span>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cost Per Unit</span>
              <span className="font-medium text-foreground">
                {formatCurrency(material.costPerUnit)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              {material.notes || 'No notes added for this material.'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {purchaseItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No purchases recorded for this material.</p>
          ) : (
            <div className="space-y-4">
              {purchaseItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/purchases/${item.purchase.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/70 p-4 transition-colors hover:bg-[hsl(var(--surface-soft))]/60"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.purchase.purchaseNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(item.purchase.purchaseDate)} • {item.quantity} {material.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${paymentColors[item.purchase.paymentStatus]}`}
                    >
                      {item.purchase.paymentStatus.replace('_', ' ')}
                    </span>
                    <p className="mt-2 font-semibold text-foreground">{formatCurrency(item.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.costPerUnit)} per {material.unit}
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
