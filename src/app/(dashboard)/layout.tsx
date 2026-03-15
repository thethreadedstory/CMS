import { UserButton } from '@clerk/nextjs'
import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-white">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-medium text-foreground">Business CMS</p>
              <p className="text-xs text-muted-foreground">
                Manage orders, customers, inventory, and payments.
              </p>
            </div>
            <div className="rounded-md border border-border bg-white p-1">
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
