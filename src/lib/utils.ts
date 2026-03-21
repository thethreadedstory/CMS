import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
  }).format(amount)
  return `Rs ${formatted}`
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

type OrderDateSource = {
  dueDate?: Date | string | null
  deliveryDate?: Date | string | null
  updatedAt?: Date | string | null
  orderStatus?: string | null
}

export function getEffectiveOrderDueDate(order: OrderDateSource): Date | string | null {
  if (order.dueDate) {
    return order.dueDate
  }

  if (order.orderStatus === 'DELIVERED') {
    return order.deliveryDate ?? order.updatedAt ?? null
  }

  return null
}

export function getEffectiveDeliveryDate(order: OrderDateSource): Date | string | null {
  if (order.orderStatus !== 'DELIVERED') {
    return null
  }

  return order.deliveryDate ?? order.updatedAt ?? null
}

export function generateSkuFromName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-')
}
