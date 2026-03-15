import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export function DashboardStats({ stats }: StatsProps) {
  const statCards = [
    {
      title: 'Total Sales',
      value: formatCurrency(stats.totalSales),
      icon: TrendingUp,
      color: 'text-emerald-800',
      bgColor: 'bg-emerald-100/90',
    },
    {
      title: 'Total Purchases',
      value: formatCurrency(stats.totalPurchases),
      icon: TrendingDown,
      color: 'text-amber-800',
      bgColor: 'bg-amber-100/90',
    },
    {
      title: 'Total Profit',
      value: formatCurrency(stats.totalProfit),
      icon: DollarSign,
      color: 'text-teal-800',
      bgColor: 'bg-teal-100/90',
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(stats.pendingPayments),
      icon: AlertCircle,
      color: 'text-rose-800',
      bgColor: 'bg-rose-100/90',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-cyan-800',
      bgColor: 'bg-cyan-100/90',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: 'text-sky-800',
      bgColor: 'bg-sky-100/90',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'text-violet-800',
      bgColor: 'bg-violet-100/90',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockProductsCount.toString(),
      icon: AlertCircle,
      color: 'text-orange-800',
      bgColor: 'bg-orange-100/90',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card
          key={index}
          className="metric-card"
          data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {stat.title}
                </p>
                <p className="mt-3 text-3xl font-semibold text-foreground">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} rounded-2xl p-3 shadow-inner`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
