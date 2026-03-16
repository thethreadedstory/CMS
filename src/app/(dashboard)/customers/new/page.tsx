import { CustomerForm } from '@/components/customers/customer-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewCustomerPage() {
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
        <h1 className="page-title">Add New Customer</h1>
        <p className="page-copy">Enter customer details below</p>
      </div>

      <CustomerForm />
    </div>
  )
}
