'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createRawMaterial(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const unit = (formData.get('unit') as string)?.trim()

  if (!name) {
    throw new Error('Material name is required')
  }

  if (!unit) {
    throw new Error('Unit is required')
  }

  await prisma.rawMaterial.create({
    data: {
      name,
      unit,
      costPerUnit: 0,
    },
  })

  revalidatePath('/inventory')
  revalidatePath('/purchases')
  revalidatePath('/purchases/new')
  revalidateTag('purchase-form-data')
  revalidateTag('dashboard')
}

export async function updateRawMaterial(id: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const unit = (formData.get('unit') as string)?.trim()

  if (!name) {
    throw new Error('Material name is required')
  }

  if (!unit) {
    throw new Error('Unit is required')
  }

  await prisma.rawMaterial.update({
    where: { id },
    data: {
      name,
      unit,
    },
  })

  revalidatePath('/inventory')
  revalidatePath(`/inventory/${id}`)
  revalidatePath('/purchases')
  revalidatePath('/purchases/new')
  revalidateTag('purchase-form-data')
  revalidateTag('dashboard')
}

export async function deleteRawMaterial(id: string) {
  await prisma.rawMaterial.delete({
    where: { id },
  })

  revalidatePath('/inventory')
  revalidatePath('/purchases')
  revalidatePath('/purchases/new')
  revalidateTag('purchase-form-data')
  revalidateTag('dashboard')
}
