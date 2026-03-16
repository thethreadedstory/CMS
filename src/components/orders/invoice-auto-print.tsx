'use client'

import { useEffect } from 'react'

type InvoiceAutoPrintProps = {
  enabled: boolean
  documentTitle: string
}

export function InvoiceAutoPrint({
  enabled,
  documentTitle,
}: InvoiceAutoPrintProps) {
  useEffect(() => {
    const originalTitle = document.title
    document.body.classList.add('invoice-print-mode')
    document.title = documentTitle

    if (!enabled) {
      return () => {
        document.body.classList.remove('invoice-print-mode')
        document.title = originalTitle
      }
    }

    const timeoutId = window.setTimeout(() => {
      window.print()
    }, 250)

    return () => {
      window.clearTimeout(timeoutId)
      document.body.classList.remove('invoice-print-mode')
      document.title = originalTitle
    }
  }, [documentTitle, enabled])

  return null
}
