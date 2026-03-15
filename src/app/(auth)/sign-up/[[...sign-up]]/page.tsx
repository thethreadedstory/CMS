import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-border bg-white p-8">
          <span className="section-label">Team Access</span>
          <h1 className="mt-5 text-3xl font-semibold text-foreground">
            Create an account for the CMS.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Set up a professional admin workspace for orders, catalog management, stock control, and customer follow-up.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-[hsl(var(--surface-soft))] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Customers</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Managed</p>
            </div>
            <div className="rounded-md border border-border bg-[hsl(var(--surface-soft))] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Products</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Organized</p>
            </div>
            <div className="rounded-md border border-border bg-[hsl(var(--surface-soft))] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Reports</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Available</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full rounded-lg border border-border bg-white p-4 shadow-sm">
            <SignUp
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
              path="/sign-up"
              signInUrl="/sign-in"
              afterSignUpUrl="/dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
