'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null

  await prisma.productCategory.create({
    data: {
      name,
      description: description || null,
    },
  })

  revalidatePath('/products/categories')
  revalidatePath('/products')
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null

  await prisma.productCategory.update({
    where: { id },
    data: {
      name,
      description: description || null,
    },
  })

  revalidatePath('/products/categories')
  revalidatePath('/products')
}

export async function deleteCategory(id: string) {
  await prisma.productCategory.delete({
    where: { id },
  })

  revalidatePath('/products/categories')
  revalidatePath('/products')
}
