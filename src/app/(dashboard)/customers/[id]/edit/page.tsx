import { prisma } from '@/lib/prisma'
import { CustomerForm } from '@/components/customers/customer-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function EditCustomerPage({
  params,
}: {
  params: { id: string }
}) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
  })

  if (!customer) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
        <p className="text-gray-600 mt-1">Update customer details</p>
      </div>

      <CustomerForm customer={customer} />
    </div>
  )
}
