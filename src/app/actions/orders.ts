'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createOrder(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const orderDate = new Date(formData.get('orderDate') as string)
  const subtotal = parseFloat(formData.get('subtotal') as string)
  const discount = parseFloat(formData.get('discount') as string)
  const shippingCharge = parseFloat(formData.get('shippingCharge') as string)
  const totalAmount = parseFloat(formData.get('totalAmount') as string)
  const paidAmount = parseFloat(formData.get('paidAmount') as string)
  const pendingAmount = parseFloat(formData.get('pendingAmount') as string)
  const paymentStatus = formData.get('paymentStatus') as string
  const notes = formData.get('notes') as string | null
  const itemsJson = formData.get('items') as string
  const items = JSON.parse(itemsJson)

  // Generate order number
  const lastOrder = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
  })
  
  const orderCount = await prisma.order.count()
  const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`

  await prisma.order.create({
    data: {
      orderNumber,
      customerId,
      orderDate,
      subtotal,
      discount,
      shippingCharge,
      totalAmount,
      paidAmount,
      pendingAmount,
      paymentStatus: paymentStatus as any,
      orderStatus: 'PENDING',
      notes: notes || null,
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      },
    },
  })

  revalidatePath('/orders')
  revalidatePath('/dashboard')
}

export async function updateOrderStatus(orderId: string, status: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      orderStatus: status as any,
    },
  })

  // If order is delivered, deduct stock
  if (status === 'DELIVERED') {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (order) {
      for (const item of order.items) {
        if (item.variantId) {
          // Deduct from variant stock
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          })
        } else {
          // Deduct from product stock
          await prisma.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          })
        }
      }
    }
  }

  revalidatePath('/orders')
  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/dashboard')
}

export async function deleteOrder(orderId: string) {
  await prisma.order.delete({
    where: { id: orderId },
  })

  revalidatePath('/orders')
  revalidatePath('/dashboard')
}
