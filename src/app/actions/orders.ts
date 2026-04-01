'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'

type UpdateOrderStatusInput = {
  status: string
  itemDeliveredQuantities?: { itemId: string; deliveredQuantity: number }[]
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
  const payload: UpdateOrderStatusInput =
    typeof input === 'string'
      ? { status: input }
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
            id: true,
            productId: true,
            variantId: true,
            quantity: true,
            deliveredQuantity: true,
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

    if (!keepsDeliveredProgress && currentDeliveredQuantity > 0) {
      nextDeliveredQuantity = 0
      await Promise.all(
        order.items.map((item) =>
          tx.orderItem.update({ where: { id: item.id }, data: { deliveredQuantity: 0 } })
        )
      )
    }

    if (payload.status === 'PARTIALLY_DELIVERED') {
      const itemDeliveredQuantities = payload.itemDeliveredQuantities

      if (!itemDeliveredQuantities || itemDeliveredQuantities.length === 0) {
        throw new Error('Please enter delivered quantities for each item')
      }

      const itemMap = new Map(order.items.map((item) => [item.id, item]))
      let totalDelivered = 0

      for (const { itemId, deliveredQuantity } of itemDeliveredQuantities) {
        const orderItem = itemMap.get(itemId)
        if (!orderItem) {
          throw new Error('Invalid item reference')
        }

        if (!Number.isInteger(deliveredQuantity) || deliveredQuantity < 0) {
          throw new Error('Please enter a valid delivered quantity for each item')
        }

        if (deliveredQuantity > orderItem.quantity) {
          throw new Error('Delivered quantity cannot exceed ordered quantity for an item')
        }

        if (deliveredQuantity < orderItem.deliveredQuantity) {
          throw new Error('Delivered quantity cannot be less than already recorded quantity')
        }

        totalDelivered += deliveredQuantity
      }

      if (totalDelivered === 0) {
        throw new Error('At least one item must have a delivered quantity greater than zero')
      }

      if (totalDelivered >= totalOrderedQuantity) {
        throw new Error('Use delivered status when the full order quantity is delivered')
      }

      nextDeliveredQuantity = totalDelivered

      await Promise.all(
        itemDeliveredQuantities.map(({ itemId, deliveredQuantity }) =>
          tx.orderItem.update({ where: { id: itemId }, data: { deliveredQuantity } })
        )
      )
    }

    if (payload.status === 'DELIVERED') {
      nextDeliveredQuantity = totalOrderedQuantity
      nextDeliveryDate = new Date()
      nextDueDate = order.dueDate ?? nextDeliveryDate

      await Promise.all(
        order.items.map((item) =>
          tx.orderItem.update({
            where: { id: item.id },
            data: { deliveredQuantity: item.quantity },
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
