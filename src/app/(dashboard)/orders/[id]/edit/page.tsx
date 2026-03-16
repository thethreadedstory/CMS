import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditOrderPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="space-y-5">
      <div>
        <Link href="/orders">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="page-title">Edit Order</h1>
        <p className="page-copy">Update order details</p>
      </div>

      <Card>
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Order editing functionality coming soon.</p>
            <p className="text-sm text-muted-foreground">
              For now, you can view the order details and update the status from the detail page.
            </p>
            <Link href={`/orders/${params.id}`}>
              <Button>Go to Order Details</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
