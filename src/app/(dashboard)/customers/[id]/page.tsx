import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Edit, Mail, Phone, MapPin } from 'lucide-react'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      address: true,
      city: true,
      notes: true,
      orders: {
        orderBy: { orderDate: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          orderStatus: true,
          totalAmount: true,
          paidAmount: true,
          pendingAmount: true,
          orderDate: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
        select: {
          id: true,
          amount: true,
          paymentDate: true,
          paymentMethod: true,
        },
      },
    },
  })

  if (!customer) {
    notFound()
  }

  const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const pendingAmount = customer.orders.reduce((sum, order) => sum + order.pendingAmount, 0)

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    READY: 'bg-cyan-100 text-cyan-900',
    SHIPPED: 'bg-indigo-100 text-indigo-900',
    PARTIALLY_DELIVERED: 'bg-amber-100 text-amber-900',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </Link>
        <Link href={`/customers/${customer.id}/edit`}>
          <Button data-testid="edit-customer-button">
            <Edit className="h-4 w-4 mr-2" />
            Edit Customer
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="page-title">{customer.name}</h1>
        <p className="page-copy">Customer Details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold text-foreground mt-2">{customer.orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold text-foreground mt-2">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Pending Amount</p>
            <p className={`text-2xl font-bold mt-2 ${pendingAmount > 0 ? 'text-destructive' : 'text-foreground'}`}>
              {formatCurrency(pendingAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-foreground">{customer.phone}</p>
                </div>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground">{customer.email}</p>
                </div>
              </div>
            )}
            {(customer.address || customer.city) && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="text-foreground">{customer.address}</p>
                  {customer.city && <p className="text-muted-foreground">{customer.city}</p>}
                </div>
              </div>
            )}
            {customer.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="text-foreground mt-1">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {customer.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments recorded</p>
            ) : (
              <div className="space-y-3">
                {customer.payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-[hsl(var(--surface-soft))]/60 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(payment.paymentDate)}</p>
                      <p className="text-xs text-muted-foreground">{payment.paymentMethod}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {customer.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {customer.orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block p-4 border rounded-lg hover:bg-[hsl(var(--surface-soft))]/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-foreground">{order.orderNumber}</p>
                      <Badge className={statusColors[order.orderStatus]}>
                        {order.orderStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="font-semibold text-foreground">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(order.orderDate)}</p>
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      {order._count.items} item(s) • Paid: {formatCurrency(order.paidAmount)} • Pending: {formatCurrency(order.pendingAmount)}
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
