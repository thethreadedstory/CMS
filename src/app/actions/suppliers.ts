'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createSupplier(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const contactPerson = (formData.get('contactPerson') as string | null)?.trim()
  const phone = (formData.get('phone') as string | null)?.trim()
  const email = (formData.get('email') as string | null)?.trim()
  const address = (formData.get('address') as string | null)?.trim()
  const notes = (formData.get('notes') as string | null)?.trim()

  if (!name) {
    throw new Error('Supplier name is required')
  }

  await prisma.supplier.create({
    data: {
      name,
      contactPerson: contactPerson || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      notes: notes || null,
    },
  })

  revalidatePath('/suppliers')
  revalidatePath('/inventory')
  revalidatePath('/purchases')
  revalidateTag('dashboard')
}

export async function updateSupplier(id: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const contactPerson = (formData.get('contactPerson') as string | null)?.trim()
  const phone = (formData.get('phone') as string | null)?.trim()
  const email = (formData.get('email') as string | null)?.trim()
  const address = (formData.get('address') as string | null)?.trim()
  const notes = (formData.get('notes') as string | null)?.trim()

  if (!name) {
    throw new Error('Supplier name is required')
  }

  await prisma.supplier.update({
    where: { id },
    data: {
      name,
      contactPerson: contactPerson || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      notes: notes || null,
    },
  })

  revalidatePath('/suppliers')
  revalidatePath(`/suppliers/${id}`)
  revalidatePath('/inventory')
  revalidatePath('/purchases')
  revalidateTag('dashboard')
}

export async function deleteSupplier(id: string) {
  await prisma.supplier.delete({
    where: { id },
  })

  revalidatePath('/suppliers')
  revalidatePath('/inventory')
  revalidatePath('/purchases')
  revalidateTag('dashboard')
}
