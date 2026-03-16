import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SupplierForm } from '@/components/suppliers/supplier-form'
import { Button } from '@/components/ui/button'

export default function NewSupplierPage() {
  return (
    <div className="space-y-5">
      <div>
        <Link href="/suppliers">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Suppliers
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="page-title">Add New Supplier</h1>
        <p className="page-copy">Enter supplier details below</p>
      </div>

      <SupplierForm />
    </div>
  )
}
