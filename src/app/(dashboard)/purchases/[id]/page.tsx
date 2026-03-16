import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Edit } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'

const paymentColors: Record<string, string> = {
  UNPAID: 'border-rose-200 bg-rose-100/80 text-rose-900',
  PARTIALLY_PAID: 'border-amber-200 bg-amber-100/80 text-amber-900',
  PAID: 'border-emerald-200 bg-emerald-100/80 text-emerald-900',
}

export default async function PurchaseDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const purchase = await prisma.rawMaterialPurchase.findUnique({
    where: { id: params.id },
    include: {
      supplier: true,
      items: {
        include: {
          material: true,
        },
      },
    },
  })

  if (!purchase) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/purchases">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Purchases
          </Button>
        </Link>
        <Link href={`/purchases/${purchase.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Purchase
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">{purchase.purchaseNumber}</h1>
          <p className="page-copy">{formatDate(purchase.purchaseDate)}</p>
        </div>
        <Badge className={paymentColors[purchase.paymentStatus]}>
          {purchase.paymentStatus.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Purchase Items</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {purchase.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border/70 p-4"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.material.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.costPerUnit)} x {item.quantity} {item.material.unit}
                    </p>
                  </div>
                  <p className="font-semibold text-foreground">{formatCurrency(item.total)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Supplier</span>
                <span className="font-medium text-foreground">
                  {purchase.supplier?.name ?? 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span className="font-medium text-foreground">{purchase.items.length}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border/70 pt-3 text-base">
                <span className="font-medium text-foreground">Total</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(purchase.totalAmount)}
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
                {purchase.notes || 'No notes added for this purchase.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
