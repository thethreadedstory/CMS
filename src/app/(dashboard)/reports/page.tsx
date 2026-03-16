import { FileText, TrendingUp, DollarSign, Package, Users, ArrowRight } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

interface ReportCard {
  title: string
  description: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
  accentColor: string
}

export default function ReportsPage() {
  const reportCards: ReportCard[] = [
    {
      title: 'Sales Report',
      description: 'Revenue and sales analysis',
      icon: TrendingUp,
      iconColor: '#059669',
      iconBg: 'rgba(5,150,105,0.1)',
      accentColor: '#059669',
    },
    {
      title: 'Purchase Report',
      description: 'Expenses and purchases',
      icon: DollarSign,
      iconColor: '#d97706',
      iconBg: 'rgba(217,119,6,0.1)',
      accentColor: '#d97706',
    },
    {
      title: 'Profit Report',
      description: 'Profit margins and analysis',
      icon: FileText,
      iconColor: '#0d9488',
      iconBg: 'rgba(13,148,136,0.1)',
      accentColor: '#0d9488',
    },
    {
      title: 'Inventory Report',
      description: 'Stock levels and valuation',
      icon: Package,
      iconColor: '#7c3aed',
      iconBg: 'rgba(124,58,237,0.1)',
      accentColor: '#7c3aed',
    },
    {
      title: 'Pending Payments',
      description: 'Outstanding dues',
      icon: FileText,
      iconColor: '#e11d48',
      iconBg: 'rgba(225,29,72,0.1)',
      accentColor: '#e11d48',
    },
    {
      title: 'Customer Report',
      description: 'Customer-wise sales',
      icon: Users,
      iconColor: '#0284c7',
      iconBg: 'rgba(2,132,199,0.1)',
      accentColor: '#0284c7',
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
          <div
            key={report.title}
            className="group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(30,39,64,0.1),0_2px_6px_rgba(30,39,64,0.06)]"
            style={{
              background: 'white',
              borderRadius: '14px',
              border: '1px solid rgba(30,39,64,0.09)',
              boxShadow: '0 1px 3px rgba(30,39,64,0.06), 0 1px 2px rgba(30,39,64,0.04)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Top accent bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: report.accentColor,
                borderRadius: '14px 14px 0 0',
              }}
            />

            <div style={{ padding: '20px', marginTop: '3px' }}>
              {/* Icon + arrow row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: report.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <report.icon style={{ width: '20px', height: '20px', color: report.iconColor }} />
                </div>
                <ArrowRight
                  style={{
                    width: '16px',
                    height: '16px',
                    color: 'rgba(107,114,128,0.5)',
                    marginTop: '4px',
                    flexShrink: 0,
                  }}
                />
              </div>

              {/* Text */}
              <h3
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#1e2740',
                  margin: '0 0 4px 0',
                  lineHeight: 1.3,
                }}
              >
                {report.title}
              </h3>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {report.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Coming soon banner */}
      <div
        style={{
          background: 'white',
          borderRadius: '14px',
          border: '1px solid rgba(30,39,64,0.09)',
          boxShadow: '0 1px 3px rgba(30,39,64,0.06)',
          padding: '24px',
        }}
      >
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#1e2740',
            margin: '0 0 8px 0',
          }}
        >
          Coming Soon
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
          Detailed reports with date range filters and export functionality will be available soon.
        </p>
      </div>
    </div>
  )
}
