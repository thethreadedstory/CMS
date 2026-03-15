export default function PurchasesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-48 bg-gray-200 rounded"></div>
        <div className="h-10 w-36 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  )
}
