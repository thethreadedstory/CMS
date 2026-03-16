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
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      city: true,
    },
  })

  const orderStats = customers.length
    ? await prisma.order.groupBy({
        by: ['customerId'],
        where: {
          customerId: {
            in: customers.map((customer) => customer.id),
          },
        },
        _sum: {
          totalAmount: true,
          pendingAmount: true,
        },
        _count: {
          _all: true,
        },
      })
    : []

  const statsByCustomer = new Map(
    orderStats.map((stat) => [stat.customerId, stat])
  )

  const customersWithStats = customers.map((customer) => ({
    ...customer,
    totalSpent: statsByCustomer.get(customer.id)?._sum.totalAmount || 0,
    pendingAmount: statsByCustomer.get(customer.id)?._sum.pendingAmount || 0,
    orderCount: statsByCustomer.get(customer.id)?._count._all || 0,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-copy">Manage your customer database</p>
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
