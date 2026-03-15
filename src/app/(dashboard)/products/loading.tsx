export default function ProductsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-48 bg-gray-200 rounded"></div>
        <div className="flex gap-3">
          <div className="h-10 w-40 bg-gray-200 rounded"></div>
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="h-10 flex-1 bg-gray-200 rounded"></div>
        <div className="h-10 w-48 bg-gray-200 rounded"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  )
}
