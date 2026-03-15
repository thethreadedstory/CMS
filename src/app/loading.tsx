export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-9 w-9 animate-spin rounded-full border-4 border-solid border-[hsl(var(--primary))] border-r-transparent"></div>
        <p className="mt-4 text-sm uppercase tracking-[0.22em] text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
