'use client'

import { useEffect } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrintInvoiceButton() {
  useEffect(() => {
    return () => {
      document.body.classList.remove('invoice-print-mode')
    }
  }, [])

  const handlePrint = () => {
    document.body.classList.add('invoice-print-mode')

    const cleanup = () => {
      document.body.classList.remove('invoice-print-mode')
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
