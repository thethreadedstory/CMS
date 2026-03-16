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
    <div className="space-y-5">
      <div>
        <Link href="/customers">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="page-title">Edit Customer</h1>
        <p className="page-copy">Update customer details</p>
      </div>

      <CustomerForm customer={customer} />
    </div>
  )
}
