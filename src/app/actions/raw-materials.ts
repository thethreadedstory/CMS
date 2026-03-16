'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createRawMaterial(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const categoryId = (formData.get('categoryId') as string | null)?.trim()
  const unit = (formData.get('unit') as string)?.trim()
  const currentStock = parseFloat(formData.get('currentStock') as string)
  const minimumStock = parseFloat(formData.get('minimumStock') as string)
  const costPerUnit = parseFloat(formData.get('costPerUnit') as string)
  const supplierId = (formData.get('supplierId') as string | null)?.trim()
  const notes = (formData.get('notes') as string | null)?.trim()

  if (!name) {
    throw new Error('Material name is required')
  }

  if (!unit) {
    throw new Error('Unit is required')
  }

  if (!Number.isFinite(currentStock) || currentStock < 0) {
    throw new Error('Current stock must be zero or greater')
  }

  if (!Number.isFinite(minimumStock) || minimumStock < 0) {
    throw new Error('Minimum stock must be zero or greater')
  }

  if (!Number.isFinite(costPerUnit) || costPerUnit < 0) {
    throw new Error('Cost per unit must be zero or greater')
  }

  await prisma.rawMaterial.create({
    data: {
      name,
      categoryId: categoryId || null,
      unit,
      currentStock,
      minimumStock,
      costPerUnit,
      supplierId: supplierId || null,
      notes: notes || null,
    },
  })

  revalidatePath('/inventory')
  revalidatePath('/purchases')
  revalidateTag('dashboard')
}

export async function updateRawMaterial(id: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const categoryId = (formData.get('categoryId') as string | null)?.trim()
  const unit = (formData.get('unit') as string)?.trim()
  const currentStock = parseFloat(formData.get('currentStock') as string)
  const minimumStock = parseFloat(formData.get('minimumStock') as string)
  const costPerUnit = parseFloat(formData.get('costPerUnit') as string)
  const supplierId = (formData.get('supplierId') as string | null)?.trim()
  const notes = (formData.get('notes') as string | null)?.trim()

  if (!name) {
    throw new Error('Material name is required')
  }

  if (!unit) {
    throw new Error('Unit is required')
  }

  if (!Number.isFinite(currentStock) || currentStock < 0) {
    throw new Error('Current stock must be zero or greater')
  }

  if (!Number.isFinite(minimumStock) || minimumStock < 0) {
    throw new Error('Minimum stock must be zero or greater')
  }

  if (!Number.isFinite(costPerUnit) || costPerUnit < 0) {
    throw new Error('Cost per unit must be zero or greater')
  }

  await prisma.rawMaterial.update({
    where: { id },
    data: {
      name,
      categoryId: categoryId || null,
      unit,
      currentStock,
      minimumStock,
      costPerUnit,
      supplierId: supplierId || null,
      notes: notes || null,
    },
  })

  revalidatePath('/inventory')
  revalidatePath(`/inventory/${id}`)
  revalidatePath('/purchases')
  revalidateTag('dashboard')
}

export async function deleteRawMaterial(id: string) {
  await prisma.rawMaterial.delete({
    where: { id },
  })

  revalidatePath('/inventory')
  revalidatePath('/purchases')
  revalidateTag('dashboard')
}
