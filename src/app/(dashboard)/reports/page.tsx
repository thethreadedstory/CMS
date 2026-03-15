import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, TrendingUp, DollarSign, Package } from 'lucide-react'

export default function ReportsPage() {
  const reportCards = [
    {
      title: 'Sales Report',
      description: 'Revenue and sales analysis',
      icon: TrendingUp,
      iconClass: 'text-emerald-800',
      iconBg: 'bg-emerald-100/90',
    },
    {
      title: 'Purchase Report',
      description: 'Expenses and purchases',
      icon: DollarSign,
      iconClass: 'text-amber-800',
      iconBg: 'bg-amber-100/90',
    },
    {
      title: 'Profit Report',
      description: 'Profit margins and analysis',
      icon: FileText,
      iconClass: 'text-teal-800',
      iconBg: 'bg-teal-100/90',
    },
    {
      title: 'Inventory Report',
      description: 'Stock levels and valuation',
      icon: Package,
      iconClass: 'text-violet-800',
      iconBg: 'bg-violet-100/90',
    },
    {
      title: 'Pending Payments',
      description: 'Outstanding dues',
      icon: FileText,
      iconClass: 'text-rose-800',
      iconBg: 'bg-rose-100/90',
    },
    {
      title: 'Customer Report',
      description: 'Customer-wise sales',
      icon: TrendingUp,
      iconClass: 'text-sky-800',
      iconBg: 'bg-sky-100/90',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="section-label">Insights</span>
        <h1 className="page-title">Reports</h1>
        <p className="page-copy">Business analytics and reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.map((report) => (
          <Card key={report.title} className="cursor-pointer transition-transform duration-200 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-2xl p-3 shadow-inner ${report.iconBg}`}>
                  <report.icon className={`h-6 w-6 ${report.iconClass}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{report.title}</h3>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detailed reports with date range filters and export functionality will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
