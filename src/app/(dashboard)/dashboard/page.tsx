import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardStats } from '@/components/dashboard/stats'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { RecentOrders } from '@/components/dashboard/recent-orders'
import { LowStockAlerts } from '@/components/dashboard/low-stock-alerts'
import { OrdersByStatus } from '@/components/dashboard/orders-by-status'

export default async function DashboardPage() {
  // Get current month data
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  // Calculate statistics
  const [
    totalSales,
    totalPurchases,
    pendingPayments,
    totalOrders,
    totalCustomers,
    totalProducts,
    lowStockProducts,
    lowStockMaterials,
    recentOrders,
    ordersByStatus,
  ] = await Promise.all([
    // Total Sales (completed/delivered orders)
    prisma.order.aggregate({
      where: {
        orderStatus: { in: ['DELIVERED'] },
        orderDate: { gte: firstDayOfMonth, lte: lastDayOfMonth },
      },
      _sum: { totalAmount: true },
    }),
    // Total Purchases
    prisma.rawMaterialPurchase.aggregate({
      where: {
        purchaseDate: { gte: firstDayOfMonth, lte: lastDayOfMonth },
      },
      _sum: { totalAmount: true },
    }),
    // Pending Payments
    prisma.order.aggregate({
      where: {
        paymentStatus: { in: ['UNPAID', 'PARTIALLY_PAID'] },
      },
      _sum: { pendingAmount: true },
    }),
    // Total Orders
    prisma.order.count(),
    // Total Customers
    prisma.customer.count(),
    // Total Products
    prisma.product.count({ where: { isActive: true } }),
    // Low Stock Products
    prisma.product.findMany({
      where: {
        currentStock: { lte: prisma.product.fields.lowStockAlert },
        isActive: true,
      },
      take: 5,
      orderBy: { currentStock: 'asc' },
    }),
    // Low Stock Materials
    prisma.rawMaterial.findMany({
      where: {
        currentStock: { lte: prisma.rawMaterial.fields.minimumStock },
      },
      take: 5,
      orderBy: { currentStock: 'asc' },
    }),
    // Recent Orders
    prisma.order.findMany({
      take: 5,
      orderBy: { orderDate: 'desc' },
      include: {
        customer: true,
      },
    }),
    // Orders by Status
    prisma.order.groupBy({
      by: ['orderStatus'],
      _count: true,
    }),
  ])

  const salesAmount = totalSales._sum.totalAmount || 0
  const purchasesAmount = totalPurchases._sum.totalAmount || 0
  const profit = salesAmount - purchasesAmount
  const pendingAmount = pendingPayments._sum.pendingAmount || 0

  const stats = {
    totalSales: salesAmount,
    totalPurchases: purchasesAmount,
    totalProfit: profit,
    pendingPayments: pendingAmount,
    totalOrders,
    totalCustomers,
    totalProducts,
    lowStockProductsCount: lowStockProducts.length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your crochet business admin panel</p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <OrdersByStatus data={ordersByStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders orders={recentOrders} />
        <LowStockAlerts products={lowStockProducts} materials={lowStockMaterials} />
      </div>
    </div>
  )
}
