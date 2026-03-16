import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { SupplierForm } from '@/components/suppliers/supplier-form'
import { Button } from '@/components/ui/button'

export default async function EditSupplierPage({
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
    },
  })

  if (!supplier) {
    notFound()
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/suppliers" replace>
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Suppliers
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="page-title">Edit Supplier</h1>
        <p className="page-copy">Update supplier details</p>
      </div>

      <SupplierForm supplier={supplier} />
    </div>
  )
}
