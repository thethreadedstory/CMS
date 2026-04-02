import './globals.css'
import type { Metadata } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { NavigationProgress } from '@/components/navigation-progress'
import { Toaster } from 'sonner'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { Suspense } from 'react'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
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
          className={`${ibmPlexSans.variable} antialiased`}
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
