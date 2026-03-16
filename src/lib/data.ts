import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const getDashboardData = unstable_cache(
  async () => {
    const now = new Date()
    const trendStartDate = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const [
      totalSales,
      totalPurchases,
      pendingPayments,
      totalOrders,
      totalCustomers,
      totalProducts,
      deliveredOrders,
      recentOrders,
      ordersByStatus,
      salesTrendOrders,
      purchaseTrendEntries,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: {
          orderStatus: { in: ['DELIVERED'] },
        },
        _sum: { totalAmount: true },
      }),
      prisma.rawMaterialPurchase.aggregate({
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: { in: ['UNPAID', 'PARTIALLY_PAID'] },
        },
        _sum: { pendingAmount: true },
      }),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.findMany({
        where: {
          orderStatus: 'DELIVERED',
        },
        select: {
          totalAmount: true,
          purchases: {
            select: {
              totalAmount: true,
            },
          },
        },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { orderDate: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          orderStatus: true,
          paymentStatus: true,
          orderDate: true,
          customer: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.order.groupBy({
        by: ['orderStatus'],
        _count: {
          orderStatus: true,
        },
      }),
      prisma.order.findMany({
        where: {
          orderStatus: 'DELIVERED',
          orderDate: {
            gte: trendStartDate,
          },
        },
        select: {
          orderDate: true,
          totalAmount: true,
        },
        orderBy: { orderDate: 'asc' },
      }),
      prisma.rawMaterialPurchase.findMany({
        where: {
          purchaseDate: {
            gte: trendStartDate,
          },
        },
        select: {
          purchaseDate: true,
          totalAmount: true,
        },
        orderBy: { purchaseDate: 'asc' },
      }),
    ])

    const salesAmount = totalSales._sum.totalAmount || 0
    const purchasesAmount = totalPurchases._sum.totalAmount || 0
    const pendingAmount = pendingPayments._sum.pendingAmount || 0
    const estimatedProfit = deliveredOrders.reduce((sum, order) => {
      const linkedPurchaseTotal = order.purchases.reduce(
        (purchaseSum, purchase) => purchaseSum + purchase.totalAmount,
        0
      )

      return sum + (order.totalAmount - linkedPurchaseTotal)
    }, 0)
    const salesByMonth = new Map<string, number>()
    const purchasesByMonth = new Map<string, number>()
    const trendData = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)
      const key = `${date.getFullYear()}-${date.getMonth()}`

      return {
        key,
        month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date),
      }
    })

    for (const order of salesTrendOrders) {
      const key = `${order.orderDate.getFullYear()}-${order.orderDate.getMonth()}`
      salesByMonth.set(key, (salesByMonth.get(key) ?? 0) + order.totalAmount)
    }

    for (const purchase of purchaseTrendEntries) {
      const key = `${purchase.purchaseDate.getFullYear()}-${purchase.purchaseDate.getMonth()}`
      purchasesByMonth.set(key, (purchasesByMonth.get(key) ?? 0) + purchase.totalAmount)
    }

    return {
      stats: {
        totalSales: salesAmount,
        totalPurchases: purchasesAmount,
        totalProfit: estimatedProfit,
        pendingPayments: pendingAmount,
        totalOrders,
        totalCustomers,
        totalProducts,
      },
      recentOrders,
      salesTrend: trendData.map((entry) => ({
        month: entry.month,
        sales: salesByMonth.get(entry.key) ?? 0,
        purchases: purchasesByMonth.get(entry.key) ?? 0,
      })),
      ordersByStatus: ordersByStatus.map((item) => ({
        orderStatus: item.orderStatus,
        _count: item._count.orderStatus,
      })),
    }
  },
  ['dashboard-data'],
  {
    revalidate: 300,
    tags: ['dashboard'],
  }
)

export const getOrderFormData = unstable_cache(
  async () => {
    const [customers, products] = await Promise.all([
      prisma.customer.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          sku: true,
          sellingPrice: true,
          currentStock: true,
          category: {
            select: {
              name: true,
            },
          },
          variants: {
            select: {
              id: true,
              variantType: true,
              variantValue: true,
              sku: true,
              price: true,
              stock: true,
            },
            orderBy: [{ variantType: 'asc' }, { variantValue: 'asc' }],
          },
        },
        orderBy: { name: 'asc' },
      }),
    ])

    return { customers, products }
  },
  ['order-form-data'],
  {
    revalidate: 300,
    tags: ['order-form-data'],
  }
)

export const getPurchaseFormData = unstable_cache(
  async () => {
    const [suppliers, materials, orders] = await Promise.all([
      prisma.supplier.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.rawMaterial.findMany({
        select: {
          id: true,
          name: true,
          unit: true,
          currentStock: true,
          costPerUnit: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.order.findMany({
        where: {
          orderStatus: {
            not: 'CANCELLED',
          },
        },
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          customer: {
            select: {
              name: true,
            },
          },
          purchases: {
            select: {
              totalAmount: true,
            },
          },
        },
        orderBy: { orderDate: 'desc' },
      }),
    ])

    return {
      suppliers,
      materials,
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        customerName: order.customer.name,
        linkedPurchaseTotal: order.purchases.reduce(
          (sum, purchase) => sum + purchase.totalAmount,
          0
        ),
      })),
    }
  },
  ['purchase-form-data'],
  {
    revalidate: 300,
    tags: ['purchase-form-data'],
  }
)

export const getProductCategoryOptions = unstable_cache(
  async () =>
    prisma.productCategory.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    }),
  ['product-category-options'],
  {
    revalidate: 3600,
    tags: ['product-categories'],
  }
)
