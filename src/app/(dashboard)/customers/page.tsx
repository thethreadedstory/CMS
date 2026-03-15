import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { CustomerList } from '@/components/customers/customer-list'

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const search = searchParams.search || ''

  const customers = await prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { orders: true },
      },
      orders: {
        select: {
          totalAmount: true,
          pendingAmount: true,
        },
      },
    },
  })

  const customersWithStats = customers.map((customer) => ({
    ...customer,
    totalSpent: customer.orders.reduce((sum, order) => sum + order.totalAmount, 0),
    pendingAmount: customer.orders.reduce((sum, order) => sum + order.pendingAmount, 0),
    orderCount: customer._count.orders,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer database</p>
        </div>
        <Link href="/customers/new">
          <Button data-testid="add-customer-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </Link>
      </div>

      <CustomerList customers={customersWithStats} initialSearch={search} />
    </div>
  )
}
