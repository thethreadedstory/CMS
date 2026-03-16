import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const getDashboardData = unstable_cache(
  async () => {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    )

    const [
      totalSales,
      totalPurchases,
      pendingPayments,
      totalOrders,
      totalCustomers,
      totalProducts,
      allProducts,
      allMaterials,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: {
          orderStatus: { in: ['DELIVERED'] },
          orderDate: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        },
        _sum: { totalAmount: true },
      }),
      prisma.rawMaterialPurchase.aggregate({
        where: {
          purchaseDate: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        },
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
      prisma.product.findMany({
        where: {
          isActive: true,
          currentStock: {
            lte: prisma.product.fields.lowStockAlert,
          },
        },
        select: {
          id: true,
          name: true,
          currentStock: true,
          lowStockAlert: true,
        },
        orderBy: { currentStock: 'asc' },
        take: 5,
      }),
      prisma.rawMaterial.findMany({
        where: {
          currentStock: {
            lte: prisma.rawMaterial.fields.minimumStock,
          },
        },
        select: {
          id: true,
          name: true,
          currentStock: true,
          minimumStock: true,
        },
        orderBy: { currentStock: 'asc' },
        take: 5,
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
    ])

    const salesAmount = totalSales._sum.totalAmount || 0
    const purchasesAmount = totalPurchases._sum.totalAmount || 0
    const pendingAmount = pendingPayments._sum.pendingAmount || 0

    return {
      stats: {
        totalSales: salesAmount,
        totalPurchases: purchasesAmount,
        totalProfit: salesAmount - purchasesAmount,
        pendingPayments: pendingAmount,
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockProductsCount: allProducts.length + allMaterials.length,
      },
      lowStockProducts: allProducts,
      lowStockMaterials: allMaterials,
      recentOrders,
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
    const [suppliers, materials] = await Promise.all([
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
    ])

    return { suppliers, materials }
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
