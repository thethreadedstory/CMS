'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function createCustomer(formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string | null
  const email = formData.get('email') as string | null
  const address = formData.get('address') as string | null
  const city = formData.get('city') as string | null
  const notes = formData.get('notes') as string | null

  await prisma.customer.create({
    data: {
      name,
      phone: phone || null,
      email: email || null,
      address: address || null,
      city: city || null,
      notes: notes || null,
    },
  })

  revalidatePath('/customers')
  revalidateTag('dashboard')
  revalidateTag('order-form-data')
}

export async function updateCustomer(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string | null
  const email = formData.get('email') as string | null
  const address = formData.get('address') as string | null
  const city = formData.get('city') as string | null
  const notes = formData.get('notes') as string | null

  await prisma.customer.update({
    where: { id },
    data: {
      name,
      phone: phone || null,
      email: email || null,
      address: address || null,
      city: city || null,
      notes: notes || null,
    },
  })

  revalidatePath('/customers')
  revalidatePath(`/customers/${id}`)
  revalidateTag('dashboard')
  revalidateTag('order-form-data')
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({
    where: { id },
  })

  revalidatePath('/customers')
  revalidateTag('dashboard')
  revalidateTag('order-form-data')
}
