'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import NProgress from 'nprogress'
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  Box,
  ShoppingBag,
  FileText,
  Store,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Raw Materials', href: '/inventory', icon: Box },
  { name: 'Purchases', href: '/purchases', icon: ShoppingBag },
  { name: 'Suppliers', href: '/suppliers', icon: Store },
  { name: 'Reports', href: '/reports', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  const handleLinkClick = () => {
    NProgress.start()
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">Crochet Admin</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
