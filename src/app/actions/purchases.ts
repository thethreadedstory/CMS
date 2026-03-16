'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'

interface PurchaseItemInput {
  materialId: string
  quantity: number
  costPerUnit: number
}

type ParsedPurchaseInput = {
  supplierId: string | null
  purchaseDate: Date
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID'
  notes: string | null
  items: PurchaseItemInput[]
  totalAmount: number
}

function parsePurchaseInput(formData: FormData): ParsedPurchaseInput {
  const supplierId = (formData.get('supplierId') as string | null)?.trim()
  const purchaseDateValue = formData.get('purchaseDate') as string
  const paymentStatus = (formData.get('paymentStatus') as string)?.trim()
  const notes = (formData.get('notes') as string | null)?.trim()
  const itemsJson = formData.get('items') as string
  const purchaseDate = new Date(purchaseDateValue)
  const items = (itemsJson ? JSON.parse(itemsJson) : []) as PurchaseItemInput[]

  if (Number.isNaN(purchaseDate.getTime())) {
    throw new Error('Purchase date is required')
  }

  if (!['UNPAID', 'PARTIALLY_PAID', 'PAID'].includes(paymentStatus)) {
    throw new Error('Invalid payment status')
  }

  if (items.length === 0) {
    throw new Error('At least one purchase item is required')
  }

  if (
    items.some(
      (item) =>
        !item.materialId ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(item.costPerUnit) ||
        item.costPerUnit < 0
    )
  ) {
    throw new Error('Please complete all purchase item details')
  }

  const uniqueMaterialIds = new Set(items.map((item) => item.materialId))
  if (uniqueMaterialIds.size !== items.length) {
    throw new Error('Each material can only be added once per purchase')
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.costPerUnit,
    0
  )

  return {
    supplierId: supplierId || null,
    purchaseDate,
    paymentStatus: paymentStatus as ParsedPurchaseInput['paymentStatus'],
    notes: notes || null,
    items,
    totalAmount,
  }
}

async function revalidatePurchasePaths(purchaseId?: string) {
  revalidatePath('/purchases')
  revalidatePath('/inventory')
  revalidatePath('/suppliers')
  revalidatePath('/reports')
  revalidatePath('/purchases/new')
  if (purchaseId) {
    revalidatePath(`/purchases/${purchaseId}`)
    revalidatePath(`/purchases/${purchaseId}/edit`)
  }
  revalidateTag('purchase-form-data')
  revalidateTag('dashboard')
}

export async function createPurchase(formData: FormData) {
  const { supplierId, purchaseDate, paymentStatus, notes, items, totalAmount } =
    parsePurchaseInput(formData)

  const purchaseCount = await prisma.rawMaterialPurchase.count()
  const purchaseNumber = `PUR-${new Date().getFullYear()}-${String(
    purchaseCount + 1
  ).padStart(4, '0')}`

  await prisma.$transaction(async (tx) => {
    await tx.rawMaterialPurchase.create({
      data: {
        purchaseNumber,
        supplierId,
        purchaseDate,
        totalAmount,
        paymentStatus,
        notes,
        items: {
          create: items.map((item) => ({
            materialId: item.materialId,
            quantity: item.quantity,
            costPerUnit: item.costPerUnit,
            total: item.quantity * item.costPerUnit,
          })),
        },
      },
    })

    await Promise.all(
      items.map((item) =>
        tx.rawMaterial.update({
          where: { id: item.materialId },
          data: {
            currentStock: { increment: item.quantity },
            costPerUnit: item.costPerUnit,
            supplierId: supplierId || undefined,
          },
        })
      )
    )
  })

  await revalidatePurchasePaths()
}

export async function updatePurchase(purchaseId: string, formData: FormData) {
  const { supplierId, purchaseDate, paymentStatus, notes, items, totalAmount } =
    parsePurchaseInput(formData)

  await prisma.$transaction(async (tx) => {
    const existingPurchase = await tx.rawMaterialPurchase.findUnique({
      where: { id: purchaseId },
      include: {
        items: {
          select: {
            materialId: true,
            quantity: true,
          },
        },
      },
    })

    if (!existingPurchase) {
      throw new Error('Purchase not found')
    }

    const previousQuantities = new Map(
      existingPurchase.items.map((item) => [item.materialId, item.quantity])
    )
    const nextItemsByMaterial = new Map(items.map((item) => [item.materialId, item]))
    const materialIds = Array.from(
      new Set([...previousQuantities.keys(), ...nextItemsByMaterial.keys()])
    )

    const materials = await tx.rawMaterial.findMany({
      where: { id: { in: materialIds } },
      select: {
        id: true,
        currentStock: true,
      },
    })

    const stockByMaterial = new Map(materials.map((material) => [material.id, material.currentStock]))

    for (const materialId of materialIds) {
      const previousQuantity = previousQuantities.get(materialId) ?? 0
      const nextQuantity = nextItemsByMaterial.get(materialId)?.quantity ?? 0
      const delta = nextQuantity - previousQuantity

      if (delta < 0 && (stockByMaterial.get(materialId) ?? 0) < Math.abs(delta)) {
        throw new Error('Cannot reduce this purchase because some stock has already been used')
      }
    }

    await tx.rawMaterialPurchaseItem.deleteMany({
      where: { purchaseId },
    })

    await tx.rawMaterialPurchase.update({
      where: { id: purchaseId },
      data: {
        supplierId,
        purchaseDate,
        totalAmount,
        paymentStatus,
        notes,
        items: {
          create: items.map((item) => ({
            materialId: item.materialId,
            quantity: item.quantity,
            costPerUnit: item.costPerUnit,
            total: item.quantity * item.costPerUnit,
          })),
        },
      },
    })

    await Promise.all(
      materialIds.map((materialId) => {
        const previousQuantity = previousQuantities.get(materialId) ?? 0
        const nextItem = nextItemsByMaterial.get(materialId)
        const nextQuantity = nextItem?.quantity ?? 0
        const delta = nextQuantity - previousQuantity

        return tx.rawMaterial.update({
          where: { id: materialId },
          data: {
            currentStock: { increment: delta },
            ...(nextItem
              ? {
                  costPerUnit: nextItem.costPerUnit,
                  supplierId: supplierId || undefined,
                }
              : {}),
          },
        })
      })
    )
  })

  await revalidatePurchasePaths(purchaseId)
}

export async function deletePurchase(purchaseId: string) {
  await prisma.$transaction(async (tx) => {
    const existingPurchase = await tx.rawMaterialPurchase.findUnique({
      where: { id: purchaseId },
      include: {
        items: {
          select: {
            materialId: true,
            quantity: true,
          },
        },
      },
    })

    if (!existingPurchase) {
      throw new Error('Purchase not found')
    }

    const materials = await tx.rawMaterial.findMany({
      where: {
        id: {
          in: existingPurchase.items.map((item) => item.materialId),
        },
      },
      select: {
        id: true,
        currentStock: true,
      },
    })

    const stockByMaterial = new Map(materials.map((material) => [material.id, material.currentStock]))

    for (const item of existingPurchase.items) {
      if ((stockByMaterial.get(item.materialId) ?? 0) < item.quantity) {
        throw new Error('Cannot delete this purchase because some stock has already been used')
      }
    }

    await Promise.all(
      existingPurchase.items.map((item) =>
        tx.rawMaterial.update({
          where: { id: item.materialId },
          data: {
            currentStock: { decrement: item.quantity },
          },
        })
      )
    )

    await tx.rawMaterialPurchase.delete({
      where: { id: purchaseId },
    })
  })

  await revalidatePurchasePaths(purchaseId)
}
