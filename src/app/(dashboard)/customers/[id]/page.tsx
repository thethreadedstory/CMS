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
    include: {
      orders: {
        orderBy: { orderDate: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
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
    READY: 'bg-cyan-100 text-cyan-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
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
        <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
        <p className="text-gray-600 mt-1">Customer Details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{customer.orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Pending Amount</p>
            <p className={`text-2xl font-bold mt-2 ${pendingAmount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
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
          <CardContent className="space-y-4">
            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-gray-900">{customer.phone}</p>
                </div>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900">{customer.email}</p>
                </div>
              </div>
            )}
            {(customer.address || customer.city) && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="text-gray-900">{customer.address}</p>
                  {customer.city && <p className="text-gray-600">{customer.city}</p>}
                </div>
              </div>
            )}
            {customer.notes && (
              <div>
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-gray-900 mt-1">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.payments.length === 0 ? (
              <p className="text-sm text-gray-500">No payments recorded</p>
            ) : (
              <div className="space-y-3">
                {customer.payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-gray-600">{formatDate(payment.paymentDate)}</p>
                      <p className="text-xs text-gray-500">{payment.paymentMethod}</p>
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
        <CardContent>
          {customer.orders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {customer.orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      <Badge className={statusColors[order.orderStatus]}>
                        {order.orderStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <p className="text-sm text-gray-600">{formatDate(order.orderDate)}</p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      {order.items.length} item(s) • Paid: {formatCurrency(order.paidAmount)} • Pending: {formatCurrency(order.pendingAmount)}
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
