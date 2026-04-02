import './globals.css'
import type { Metadata } from 'next'
import { Bricolage_Grotesque, Manrope } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { NavigationProgress } from '@/components/navigation-progress'
import { Toaster } from 'sonner'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { Suspense } from 'react'

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'The Threaded Story Admin Panel',
  description: 'Manage your Threaded Story business operations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${bricolageGrotesque.variable} ${manrope.variable} antialiased`}
          suppressHydrationWarning
        >
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
          <Toaster position="top-right" richColors />
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
