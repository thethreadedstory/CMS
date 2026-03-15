import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-border bg-white p-8">
          <span className="section-label">Business CMS</span>
          <h1 className="mt-5 text-3xl font-semibold text-foreground">
            Sign in to manage the store.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Keep orders, products, inventory, supplier purchases, and customer payments in one organized admin workspace.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-[hsl(var(--surface-soft))] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Orders</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Track</p>
            </div>
            <div className="rounded-md border border-border bg-[hsl(var(--surface-soft))] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Inventory</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Monitor</p>
            </div>
            <div className="rounded-md border border-border bg-[hsl(var(--surface-soft))] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Payments</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Review</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full rounded-lg border border-border bg-white p-4 shadow-sm">
            <SignIn
              appearance={{
                elements: {
                  rootBox: 'mx-auto w-full',
                  card: 'shadow-none border-0 bg-transparent',
                  headerTitle: 'text-slate-900',
                  headerSubtitle: 'text-slate-500',
                  socialButtonsBlockButton: 'rounded-md border-border shadow-none',
                  formButtonPrimary: 'rounded-md bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/95',
                  formFieldInput: 'rounded-md border-border bg-white shadow-none',
                  footerActionLink: 'text-[hsl(var(--primary))]',
                },
              }}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              afterSignInUrl="/dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
