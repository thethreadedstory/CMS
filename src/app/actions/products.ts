'use server'

import { prisma } from '@/lib/prisma'
import { generateSkuFromName } from '@/lib/utils'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const sku = generateSkuFromName(name)
  const description = formData.get('description') as string | null
  const categoryId = formData.get('categoryId') as string | null
  const sellingPrice = parseFloat(formData.get('sellingPrice') as string)
  const costPrice = parseFloat(formData.get('costPrice') as string)
  const isActive = formData.get('isActive') === 'true'
  const notes = formData.get('notes') as string | null
  const variantsJson = formData.get('variants') as string
  const variants = variantsJson ? JSON.parse(variantsJson) : []

  await prisma.product.create({
    data: {
      name,
      sku,
      description: description || null,
      categoryId: categoryId || null,
      sellingPrice,
      costPrice,
      isActive,
      notes: notes || null,
      variants: {
        create: variants.filter((v: any) => v.variantType && v.variantValue).map((v: any) => ({
          variantType: v.variantType,
          variantValue: v.variantValue,
          sku: v.sku,
          price: v.price || 0,
        })),
      },
    },
  })

  revalidatePath('/products')
  revalidateTag('dashboard')
  revalidateTag('order-form-data')
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const sku = generateSkuFromName(name)
  const description = formData.get('description') as string | null
  const categoryId = formData.get('categoryId') as string | null
  const sellingPrice = parseFloat(formData.get('sellingPrice') as string)
  const costPrice = parseFloat(formData.get('costPrice') as string)
  const isActive = formData.get('isActive') === 'true'
  const notes = formData.get('notes') as string | null
  const variantsJson = formData.get('variants') as string
  const variants = variantsJson ? JSON.parse(variantsJson) : []

  // Delete existing variants
  await prisma.productVariant.deleteMany({
    where: { productId: id },
  })

  // Update product with new variants
  await prisma.product.update({
    where: { id },
    data: {
      name,
      sku,
      description: description || null,
      categoryId: categoryId || null,
      sellingPrice,
      costPrice,
      isActive,
      notes: notes || null,
      variants: {
        create: variants.filter((v: any) => v.variantType && v.variantValue).map((v: any) => ({
          variantType: v.variantType,
          variantValue: v.variantValue,
          sku: v.sku,
          price: v.price || 0,
        })),
      },
    },
  })

  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
  revalidateTag('dashboard')
  revalidateTag('order-form-data')
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({
    where: { id },
  })

  revalidatePath('/products')
  revalidateTag('dashboard')
  revalidateTag('order-form-data')
}
