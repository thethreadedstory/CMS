'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import NProgress from 'nprogress'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  Box,
  ShoppingBag,
  Store,
  PanelLeftClose,
  PanelLeftOpen,
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
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const storedState = window.localStorage.getItem('cms-sidebar-collapsed')
    if (storedState === 'true') {
      setCollapsed(true)
    }
  }, [])

  const handleLinkClick = () => {
    NProgress.start()
    setMobileOpen(false)
  }

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current
      window.localStorage.setItem('cms-sidebar-collapsed', String(next))
      return next
    })
  }

  return (
    <aside
      className={cn(
        'border-b border-sidebar-border bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] transition-[width] duration-200 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r',
        collapsed ? 'lg:w-20' : 'lg:w-64'
      )}
    >
      <div className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className={cn('min-w-0', collapsed && 'lg:hidden')}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--sidebar-foreground))]/65">
              The Threaded Story
            </p>
            <h1 className="text-lg font-semibold text-[hsl(var(--sidebar-foreground))]">
              Admin Panel
            </h1>
          </div>
          <Button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            variant="ghost"
            size="icon"
            className="h-9 w-9 border border-white/10 bg-white/5 text-[hsl(var(--sidebar-foreground))] hover:bg-white/10 hover:text-[hsl(var(--sidebar-foreground))] lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            onClick={toggleCollapsed}
            variant="ghost"
            size="icon"
            className="hidden h-9 w-9 border border-white/10 bg-white/5 text-[hsl(var(--sidebar-foreground))] hover:bg-white/10 hover:text-[hsl(var(--sidebar-foreground))] lg:inline-flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
        {!collapsed && (
          <p className="mt-3 hidden text-xs leading-5 text-[hsl(var(--sidebar-foreground))]/65 lg:block">
            Simple CMS workspace for daily business operations.
          </p>
        )}
      </div>
      <nav
        className={cn(
          'px-3 py-3',
          mobileOpen ? 'block' : 'hidden',
          'lg:block lg:flex-1'
        )}
      >
        <div className="flex flex-col gap-1.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-white text-slate-900'
                  : 'text-[hsl(var(--sidebar-foreground))]/78 hover:bg-white/8 hover:text-[hsl(var(--sidebar-foreground))]',
                collapsed && 'justify-center px-0 lg:h-10 lg:w-10 lg:self-center'
              )}
              title={collapsed ? item.name : undefined}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-[hsl(var(--sidebar-foreground))]/74'
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
              </span>
              <span className={cn(collapsed && 'lg:hidden')}>{item.name}</span>
            </Link>
          )
        })}
        </div>
      </nav>
    </aside>
  )
}
