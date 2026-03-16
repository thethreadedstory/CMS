'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createPayment(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const orderId = (formData.get('orderId') as string) || null
  const amount = parseFloat(formData.get('amount') as string)
  const paymentDate = new Date(formData.get('paymentDate') as string)
  const paymentMethod = formData.get('paymentMethod') as string
  const notes = formData.get('notes') as string | null

  if (!customerId && !orderId) {
    throw new Error('Customer is required')
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Payment amount must be greater than zero')
  }

  let resolvedCustomerId = customerId

  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        customerId: true,
        paidAmount: true,
        totalAmount: true,
      },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    resolvedCustomerId = order.customerId

    if (amount > order.totalAmount - order.paidAmount) {
      throw new Error('Payment amount exceeds pending balance')
    }

    const nextPaidAmount = order.paidAmount + amount
    const nextPendingAmount = Math.max(0, order.totalAmount - nextPaidAmount)
    const nextPaymentStatus =
      nextPendingAmount === 0
        ? 'PAID'
        : nextPaidAmount > 0
          ? 'PARTIALLY_PAID'
          : 'UNPAID'

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paidAmount: nextPaidAmount,
        pendingAmount: nextPendingAmount,
        paymentStatus: nextPaymentStatus as any,
        payments: {
          create: {
            customerId: resolvedCustomerId,
            amount,
            paymentDate,
            paymentMethod: paymentMethod as any,
            notes: notes || null,
          },
        },
      },
    })
  } else {
    await prisma.payment.create({
      data: {
        customerId: resolvedCustomerId,
        orderId: null,
        amount,
        paymentDate,
        paymentMethod: paymentMethod as any,
        notes: notes || null,
      },
    })
  }

  revalidatePath('/payments')
  revalidatePath('/orders')
  revalidatePath('/customers')

  if (orderId) {
    revalidatePath(`/orders/${orderId}`)
  }

  revalidatePath(`/customers/${resolvedCustomerId}`)
  revalidatePath('/dashboard')
  revalidateTag('dashboard')
}
