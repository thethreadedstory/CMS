export default function ReportsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-gray-200 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
      <div className="h-40 bg-gray-200 rounded-lg"></div>
    </div>
  )
}
