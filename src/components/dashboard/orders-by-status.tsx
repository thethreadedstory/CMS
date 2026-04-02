'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface OrdersByStatusProps {
  data: Array<{
    orderStatus: string
    _count: number
  }>
}

function toFadedFill(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, 0.15)`
}

const STATUS_CONFIG: Record<string, { color: string }> = {
  DELIVERED:           { color: '#1b6b70' },
  PARTIALLY_DELIVERED: { color: '#26806e' },
  IN_PROGRESS:         { color: '#b67a36' },
  PENDING:             { color: '#6c5f98' },
  READY:               { color: '#b24534' },
  SHIPPED:             { color: '#2563eb' },
  CONFIRMED:           { color: '#9f6a80' },
  CANCELLED:           { color: '#dc2626' },
}

export function OrdersByStatus({ data }: OrdersByStatusProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const chartData = data.map((item) => ({
    name: item.orderStatus.replace(/_/g, ' '),
    rawName: item.orderStatus,
    value: item._count,
    color: STATUS_CONFIG[item.orderStatus]?.color ?? '#6b7280',
  }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card data-testid="orders-by-status-chart">
      <CardHeader>
        <span className="section-label w-fit">Distribution</span>
        <CardTitle>Orders by Status</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-6">

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 flex-1">
            {chartData.map((item, index) => {
              const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'
              const isFaded = activeIndex !== null && activeIndex !== index

              return (
                <div
                  key={item.rawName}
                  className="flex items-start gap-2.5"
                  style={{
                    opacity: isFaded ? 0.25 : 1,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  {/* Colored vertical bar */}
                  <div
                    style={{
                      width: '3px',
                      minHeight: '36px',
                      borderRadius: '2px',
                      backgroundColor: item.color,
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  />
                  <div>
                    <p style={{
                      fontSize: '0.68rem',
                      color: '#9ca3af',
                      lineHeight: 1.3,
                      marginBottom: '3px',
                      textTransform: 'capitalize',
                    }}>
                      {item.name}
                    </p>
                    <p style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#1e2740',
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {percent}%
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Donut Chart */}
          <div style={{ width: 190, height: 190, flexShrink: 0, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="white"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => {
                    const isFaded = activeIndex !== null && activeIndex !== index
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isFaded ? toFadedFill(entry.color) : entry.color}
                        style={{ cursor: 'pointer', outline: 'none' }}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                      />
                    )
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              {activeIndex !== null ? (
                <>
                  <p style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#1e2740',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {chartData[activeIndex].value}
                  </p>
                  <p style={{
                    fontSize: '0.6rem',
                    color: '#9ca3af',
                    marginTop: '5px',
                    textAlign: 'center',
                    maxWidth: '72px',
                    lineHeight: 1.3,
                    textTransform: 'capitalize',
                  }}>
                    {chartData[activeIndex].name}
                  </p>
                </>
              ) : (
                <>
                  <p style={{
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    color: '#1e2740',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {total}
                  </p>
                  <p style={{
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    color: '#9ca3af',
                    marginTop: '5px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}>
                    Total Orders
                  </p>
                </>
              )}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
