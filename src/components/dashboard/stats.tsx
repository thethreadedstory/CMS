import { formatCurrency } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertCircle,
} from 'lucide-react'
import { type LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface StatsProps {
  stats: {
    totalSales: number
    totalPurchases: number
    totalProfit: number
    pendingPayments: number
    totalOrders: number
    totalCustomers: number
    totalProducts: number
    lowStockProductsCount: number
  }
}

interface StatCard {
  title: string
  value: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
  cardBg: string
  accentColor: string
  href: string
}

export function DashboardStats({ stats }: StatsProps) {
  const statCards: StatCard[] = [
    {
      title: 'Total Sales',
      value: formatCurrency(stats.totalSales),
      icon: TrendingUp,
      iconColor: '#059669',
      iconBg: 'rgba(5,150,105,0.1)',
      cardBg: 'rgba(5,150,105,0.03)',
      accentColor: '#059669',
      href: '/reports',
    },
    {
      title: 'Total Purchases',
      value: formatCurrency(stats.totalPurchases),
      icon: TrendingDown,
      iconColor: '#d97706',
      iconBg: 'rgba(217,119,6,0.1)',
      cardBg: 'rgba(217,119,6,0.03)',
      accentColor: '#d97706',
      href: '/purchases',
    },
    {
      title: 'Total Profit',
      value: formatCurrency(stats.totalProfit),
      icon: DollarSign,
      iconColor: '#0d9488',
      iconBg: 'rgba(13,148,136,0.1)',
      cardBg: 'rgba(13,148,136,0.03)',
      accentColor: '#0d9488',
      href: '/reports',
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(stats.pendingPayments),
      icon: AlertCircle,
      iconColor: '#e11d48',
      iconBg: 'rgba(225,29,72,0.1)',
      cardBg: 'rgba(225,29,72,0.03)',
      accentColor: '#e11d48',
      href: '/payments',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      iconColor: '#2563eb',
      iconBg: 'rgba(37,99,235,0.1)',
      cardBg: 'rgba(37,99,235,0.03)',
      accentColor: '#2563eb',
      href: '/orders',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      icon: Users,
      iconColor: '#0284c7',
      iconBg: 'rgba(2,132,199,0.1)',
      cardBg: 'rgba(2,132,199,0.03)',
      accentColor: '#0284c7',
      href: '/customers',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      iconColor: '#7c3aed',
      iconBg: 'rgba(124,58,237,0.1)',
      cardBg: 'rgba(124,58,237,0.03)',
      accentColor: '#7c3aed',
      href: '/products',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockProductsCount.toString(),
      icon: AlertCircle,
      iconColor: '#ea580c',
      iconBg: 'rgba(234,88,12,0.1)',
      cardBg: 'rgba(234,88,12,0.03)',
      accentColor: '#ea580c',
      href: '/inventory',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Link
          key={index}
          href={stat.href}
          data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
          style={{
            background: `white`,
            borderRadius: '14px',
            border: '1px solid rgba(30,39,64,0.09)',
            boxShadow: '0 1px 3px rgba(30,39,64,0.06), 0 1px 2px rgba(30,39,64,0.04)',
            overflow: 'hidden',
            position: 'relative',
            display: 'block',
            textDecoration: 'none',
            transition: 'box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease',
          }}
          className="group hover:shadow-md hover:-translate-y-0.5 hover:border-[rgba(30,39,64,0.18)]"
        >
          {/* Colored top bar accent */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: stat.accentColor,
              borderRadius: '14px 14px 0 0',
            }}
          />

          <div
            style={{
              padding: '20px 20px 20px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginTop: '3px',
            }}
          >
            {/* Text content */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {stat.title}
              </p>
              <p
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: '#1e2740',
                  margin: '8px 0 0 0',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                }}
              >
                {stat.value}
              </p>
            </div>

            {/* Icon */}
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: stat.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <stat.icon
                style={{ width: '20px', height: '20px', color: stat.iconColor }}
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
