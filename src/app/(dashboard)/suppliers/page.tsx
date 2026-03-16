import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { SupplierList } from '@/components/suppliers/supplier-list'

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const search = searchParams.search || ''

  const suppliers = await prisma.supplier.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { contactPerson: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: {
      _count: {
        select: {
          materials: true,
          purchases: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-copy">Manage your supplier database</p>
        </div>
        <Link href="/suppliers/new">
          <Button data-testid="add-supplier-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </Link>
      </div>

      <SupplierList suppliers={suppliers} initialSearch={search} />
    </div>
  )
}
