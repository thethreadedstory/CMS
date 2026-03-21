'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'

type UpdateOrderStatusInput = {
  status: string
  deliveredQuantity?: number
}

function parseOptionalDate(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || !value) {
    return null
  }

  return new Date(value)
}

export async function createOrder(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const orderDate = new Date(formData.get('orderDate') as string)
  const dueDate = parseOptionalDate(formData.get('dueDate'))
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

  const orderCount = await prisma.order.count()
  const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`

  await prisma.order.create({
    data: {
      orderNumber,
      customerId,
      orderDate,
      dueDate,
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
  revalidatePath('/customers')
  revalidatePath(`/customers/${customerId}`)
  revalidatePath('/purchases')
  revalidatePath('/purchases/new')
  revalidatePath('/dashboard')
  revalidateTag('purchase-form-data')
  revalidateTag('dashboard')
}

export async function updateOrderStatus(
  orderId: string,
  input: string | UpdateOrderStatusInput
) {
  const payload =
    typeof input === 'string'
      ? { status: input, deliveredQuantity: undefined }
      : input

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        customerId: true,
        orderStatus: true,
        dueDate: true,
        deliveredQuantity: true,
        items: {
          select: {
            productId: true,
            variantId: true,
            quantity: true,
          },
        },
      },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    const totalOrderedQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)
    const currentDeliveredQuantity = order.deliveredQuantity
    let nextDeliveredQuantity = currentDeliveredQuantity
    let nextDeliveryDate: Date | null = null
    let nextDueDate: Date | null | undefined
    const keepsDeliveredProgress =
      payload.status === 'PARTIALLY_DELIVERED' || payload.status === 'DELIVERED'

    if (!keepsDeliveredProgress && currentDeliveredQuantity < totalOrderedQuantity) {
      nextDeliveredQuantity = 0
    }

    if (payload.status === 'PARTIALLY_DELIVERED') {
      const deliveredQuantity = payload.deliveredQuantity

      if (!Number.isInteger(deliveredQuantity) || deliveredQuantity === undefined) {
        throw new Error('Please enter a valid delivered quantity')
      }

      if (deliveredQuantity <= 0) {
        throw new Error('Delivered quantity must be greater than zero')
      }

      if (deliveredQuantity >= totalOrderedQuantity) {
        throw new Error('Use delivered status when the full order quantity is delivered')
      }

      if (deliveredQuantity < currentDeliveredQuantity) {
        throw new Error('Delivered quantity cannot be less than the quantity already recorded')
      }

      nextDeliveredQuantity = deliveredQuantity
    }

    if (payload.status === 'DELIVERED') {
      nextDeliveredQuantity = totalOrderedQuantity
      nextDeliveryDate = new Date()
      nextDueDate = order.dueDate ?? nextDeliveryDate
    }

    const shouldDecrementInventory =
      payload.status === 'DELIVERED' && currentDeliveredQuantity < totalOrderedQuantity

    if (shouldDecrementInventory) {
      await Promise.all(
        order.items.map((item) =>
          item.variantId
            ? tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: item.quantity } },
              })
            : tx.product.update({
                where: { id: item.productId },
                data: { currentStock: { decrement: item.quantity } },
              })
        )
      )
    }

    return tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: payload.status as any,
        deliveredQuantity: nextDeliveredQuantity,
        deliveryDate: nextDeliveryDate,
        ...(nextDueDate !== undefined ? { dueDate: nextDueDate } : {}),
      },
      select: {
        customerId: true,
      },
    })
  })

  revalidatePath('/orders')
  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/customers')
  revalidatePath(`/customers/${result.customerId}`)
  revalidatePath('/products')
  revalidatePath('/purchases')
  revalidatePath('/purchases/new')
  revalidatePath('/dashboard')
  revalidateTag('purchase-form-data')
  revalidateTag('dashboard')
}

export async function updateOrder(orderId: string, formData: FormData) {
  const customerId = formData.get('customerId') as string
  const orderDate = new Date(formData.get('orderDate') as string)
  const dueDate = parseOptionalDate(formData.get('dueDate'))
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

  await prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany({ where: { orderId } })

    await tx.order.update({
      where: { id: orderId },
      data: {
        customerId,
        orderDate,
        dueDate,
        subtotal,
        discount,
        shippingCharge,
        totalAmount,
        paidAmount,
        pendingAmount,
        paymentStatus: paymentStatus as any,
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
  })

  revalidatePath('/orders')
  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/customers')
  revalidatePath(`/customers/${customerId}`)
  revalidatePath('/purchases')
  revalidatePath('/purchases/new')
  revalidatePath('/dashboard')
  revalidateTag('purchase-form-data')
  revalidateTag('dashboard')
}

export async function deleteOrder(orderId: string) {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      customerId: true,
    },
  })

  await prisma.order.delete({
    where: { id: orderId },
  })

  revalidatePath('/orders')
  revalidatePath('/customers')
  if (existingOrder) {
    revalidatePath(`/customers/${existingOrder.customerId}`)
    revalidatePath(`/orders/${orderId}`)
  }
  revalidatePath('/purchases')
  revalidatePath('/purchases/new')
  revalidatePath('/dashboard')
  revalidateTag('purchase-form-data')
  revalidateTag('dashboard')
}
