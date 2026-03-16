import dynamic from 'next/dynamic'
import { DashboardStats } from '@/components/dashboard/stats'
import { RecentOrders } from '@/components/dashboard/recent-orders'
import { getDashboardData } from '@/lib/data'

const SalesChart = dynamic(
  () => import('@/components/dashboard/sales-chart').then((mod) => mod.SalesChart),
  {
    loading: () => <ChartCardSkeleton />,
    ssr: false,
  }
)

const OrdersByStatus = dynamic(
  () =>
    import('@/components/dashboard/orders-by-status').then(
      (mod) => mod.OrdersByStatus
    ),
  {
    loading: () => <ChartCardSkeleton />,
    ssr: false,
  }
)

function ChartCardSkeleton() {
  return (
    <div className="h-[380px] animate-pulse rounded-[1.6rem] border border-border/80 bg-white/70" />
  )
}

export default async function DashboardPage() {
  const { stats, recentOrders, ordersByStatus, salesTrend } = await getDashboardData()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="section-label">Overview</span>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-copy">A quick read on sales, customers, orders, and purchase activity across the business.</p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={salesTrend} />
        <OrdersByStatus data={ordersByStatus} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  )
}
