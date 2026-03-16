'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ActionIconButton } from '@/components/ui/action-icon-button'

type OrderInvoiceActionButtonProps = {
  orderId: string
}

export function OrderInvoiceActionButton({
  orderId,
}: OrderInvoiceActionButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (isDownloading) return

    setIsDownloading(true)

    try {
      const response = await fetch(`/orders/${orderId}/invoice/pdf`)

      if (!response.ok) {
        throw new Error('Failed to generate invoice')
      }

      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="([^"]+)"/)
      const filename = filenameMatch?.[1] ?? `invoice-${orderId}.pdf`

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to download invoice')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <ActionIconButton
      label={isDownloading ? 'Generating invoice…' : 'Download invoice'}
      onClick={handleDownload}
      disabled={isDownloading}
      dataTestId={`download-order-${orderId}`}
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </ActionIconButton>
  )
}
