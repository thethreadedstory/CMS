'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteCustomer } from '@/app/actions/customers'

interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  city: string | null
  orderCount: number
  totalSpent: number
  pendingAmount: number
}

interface CustomerListProps {
  customers: Customer[]
  initialSearch: string
}

export function CustomerList({ customers, initialSearch }: CustomerListProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleSearch = (value: string) => {
    setSearch(value)
    const params = new URLSearchParams()
    if (value) params.set('search', value)
    router.push(`/customers${value ? `?${params.toString()}` : ''}`)
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete customer "${name}"? This action cannot be undone.`)) {
      setDeletingId(id)
      try {
        await deleteCustomer(id)
        router.refresh()
      } catch (error) {
        alert('Failed to delete customer. They may have existing orders.')
      } finally {
        setDeletingId(null)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
            data-testid="customer-search-input"
          />
        </div>
      </div>

      {customers.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-gray-500">No customers found.</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or add a new customer.</p>
          </div>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50" data-testid={`customer-row-${customer.id}`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        {customer.city && <p className="text-sm text-gray-500">{customer.city}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {customer.phone && <p className="text-gray-900">{customer.phone}</p>}
                        {customer.email && <p className="text-gray-500">{customer.email}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {customer.orderCount}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={customer.pendingAmount > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        {formatCurrency(customer.pendingAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/customers/${customer.id}`}>
                          <Button variant="ghost" size="sm" data-testid={`view-customer-${customer.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/customers/${customer.id}/edit`}>
                          <Button variant="ghost" size="sm" data-testid={`edit-customer-${customer.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(customer.id, customer.name)}
                          disabled={deletingId === customer.id}
                          data-testid={`delete-customer-${customer.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
