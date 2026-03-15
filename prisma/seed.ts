import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.activityLog.deleteMany()
  await prisma.rawMaterialPurchaseItem.deleteMany()
  await prisma.rawMaterialPurchase.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.productCategory.deleteMany()
  await prisma.rawMaterial.deleteMany()
  await prisma.rawMaterialCategory.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.customer.deleteMany()

  // Create Product Categories
  const categories = await Promise.all([
    prisma.productCategory.create({
      data: { name: 'Amigurumi', description: 'Stuffed toys and dolls' },
    }),
    prisma.productCategory.create({
      data: { name: 'Clothing', description: 'Wearable items' },
    }),
    prisma.productCategory.create({
      data: { name: 'Home Decor', description: 'Decorative items' },
    }),
    prisma.productCategory.create({
      data: { name: 'Accessories', description: 'Bags, purses, etc.' },
    }),
  ])

  // Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Cute Bear Amigurumi',
        sku: 'AMI-001',
        description: 'Adorable handmade crochet bear',
        categoryId: categories[0].id,
        sellingPrice: 599,
        costPrice: 250,
        currentStock: 15,
        lowStockAlert: 5,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Baby Blanket',
        sku: 'CLO-001',
        description: 'Soft and cozy baby blanket',
        categoryId: categories[1].id,
        sellingPrice: 899,
        costPrice: 400,
        currentStock: 8,
        lowStockAlert: 3,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wall Hanging',
        sku: 'DEC-001',
        description: 'Decorative wall hanging',
        categoryId: categories[2].id,
        sellingPrice: 1299,
        costPrice: 600,
        currentStock: 5,
        lowStockAlert: 2,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Tote Bag',
        sku: 'ACC-001',
        description: 'Handmade crochet tote bag',
        categoryId: categories[3].id,
        sellingPrice: 799,
        costPrice: 350,
        currentStock: 12,
        lowStockAlert: 5,
      },
    }),
  ])

  // Create Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Priya Sharma',
        phone: '9876543210',
        email: 'priya@example.com',
        address: '123 MG Road',
        city: 'Mumbai',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Rahul Verma',
        phone: '9876543211',
        email: 'rahul@example.com',
        address: '456 Park Street',
        city: 'Delhi',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Anjali Patel',
        phone: '9876543212',
        email: 'anjali@example.com',
        address: '789 Brigade Road',
        city: 'Bangalore',
      },
    }),
  ])

  // Create Raw Material Categories
  const materialCategories = await Promise.all([
    prisma.rawMaterialCategory.create({
      data: { name: 'Yarn', description: 'Various types of yarn' },
    }),
    prisma.rawMaterialCategory.create({
      data: { name: 'Stuffing', description: 'Filling materials' },
    }),
    prisma.rawMaterialCategory.create({
      data: { name: 'Accessories', description: 'Buttons, eyes, etc.' },
    }),
  ])

  // Create Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Yarn World',
        contactPerson: 'Rajesh Kumar',
        phone: '9988776655',
        email: 'contact@yarnworld.com',
        address: 'Sector 15, Delhi',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Craft Supplies Co',
        contactPerson: 'Meera Singh',
        phone: '9988776656',
        email: 'info@craftsupplies.com',
        address: 'Anna Nagar, Chennai',
      },
    }),
  ])

  // Create Raw Materials
  const materials = await Promise.all([
    prisma.rawMaterial.create({
      data: {
        name: 'Cotton Yarn - White',
        categoryId: materialCategories[0].id,
        unit: 'kg',
        currentStock: 25,
        minimumStock: 10,
        costPerUnit: 350,
        supplierId: suppliers[0].id,
      },
    }),
    prisma.rawMaterial.create({
      data: {
        name: 'Acrylic Yarn - Blue',
        categoryId: materialCategories[0].id,
        unit: 'kg',
        currentStock: 30,
        minimumStock: 10,
        costPerUnit: 280,
        supplierId: suppliers[0].id,
      },
    }),
    prisma.rawMaterial.create({
      data: {
        name: 'Polyester Stuffing',
        categoryId: materialCategories[1].id,
        unit: 'kg',
        currentStock: 15,
        minimumStock: 5,
        costPerUnit: 200,
        supplierId: suppliers[1].id,
      },
    }),
    prisma.rawMaterial.create({
      data: {
        name: 'Safety Eyes 12mm',
        categoryId: materialCategories[2].id,
        unit: 'piece',
        currentStock: 200,
        minimumStock: 50,
        costPerUnit: 2,
        supplierId: suppliers[1].id,
      },
    }),
  ])

  // Create Orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-001',
        customerId: customers[0].id,
        orderDate: new Date('2024-03-01'),
        subtotal: 1198,
        discount: 0,
        shippingCharge: 50,
        totalAmount: 1248,
        paidAmount: 1248,
        pendingAmount: 0,
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 2,
              unitPrice: 599,
              total: 1198,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-002',
        customerId: customers[1].id,
        orderDate: new Date('2024-03-10'),
        subtotal: 2098,
        discount: 100,
        shippingCharge: 50,
        totalAmount: 2048,
        paidAmount: 1000,
        pendingAmount: 1048,
        paymentStatus: 'PARTIALLY_PAID',
        orderStatus: 'IN_PROGRESS',
        items: {
          create: [
            {
              productId: products[1].id,
              quantity: 1,
              unitPrice: 899,
              total: 899,
            },
            {
              productId: products[2].id,
              quantity: 1,
              unitPrice: 1299,
              total: 1299,
            },
          ],
        },
      },
    }),
  ])

  // Create Payments
  await Promise.all([
    prisma.payment.create({
      data: {
        customerId: customers[0].id,
        orderId: orders[0].id,
        amount: 1248,
        paymentDate: new Date('2024-03-01'),
        paymentMethod: 'UPI',
      },
    }),
    prisma.payment.create({
      data: {
        customerId: customers[1].id,
        orderId: orders[1].id,
        amount: 1000,
        paymentDate: new Date('2024-03-10'),
        paymentMethod: 'CASH',
      },
    }),
  ])

  // Create Raw Material Purchases
  await prisma.rawMaterialPurchase.create({
    data: {
      purchaseNumber: 'PUR-2024-001',
      supplierId: suppliers[0].id,
      purchaseDate: new Date('2024-02-15'),
      totalAmount: 14000,
      paymentStatus: 'PAID',
      items: {
        create: [
          {
            materialId: materials[0].id,
            quantity: 20,
            costPerUnit: 350,
            total: 7000,
          },
          {
            materialId: materials[1].id,
            quantity: 25,
            costPerUnit: 280,
            total: 7000,
          },
        ],
      },
    },
  })

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
