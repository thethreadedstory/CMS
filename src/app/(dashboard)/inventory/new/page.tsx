import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MaterialForm } from '@/components/inventory/material-form'
import { Button } from '@/components/ui/button'

export default async function NewMaterialPage() {
  return (
    <div className="space-y-5">
      <div>
        <Link href="/inventory">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Raw Materials
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="page-title">Add New Raw Material</h1>
        <p className="page-copy">Enter the material name and unit below</p>
      </div>

      <MaterialForm />
    </div>
  )
}
