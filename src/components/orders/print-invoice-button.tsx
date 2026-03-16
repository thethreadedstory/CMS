'use client'

import { useEffect } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PrintInvoiceButtonProps = {
  documentTitle?: string
}

export function PrintInvoiceButton({
  documentTitle = 'invoice',
}: PrintInvoiceButtonProps) {
  useEffect(() => {
    return () => {
      document.body.classList.remove('invoice-print-mode')
    }
  }, [])

  const handlePrint = () => {
    const originalTitle = document.title
    document.body.classList.add('invoice-print-mode')
    document.title = documentTitle

    const cleanup = () => {
      document.body.classList.remove('invoice-print-mode')
      document.title = originalTitle
    }

    window.addEventListener('afterprint', cleanup, { once: true })

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print()
      })
    })
  }

  return (
    <Button
      variant="outline"
      onClick={handlePrint}
      data-testid="print-invoice-button"
    >
      <Printer className="mr-2 h-4 w-4" />
      Print Invoice
    </Button>
  )
}
