'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface OrdersByStatusProps {
  data: Array<{
    orderStatus: string
    _count: number
  }>
}

const COLORS = ['#1b6b70', '#26806e', '#b67a36', '#b24534', '#6c5f98', '#9f6a80']

export function OrdersByStatus({ data }: OrdersByStatusProps) {
  const chartData = data.map((item) => ({
    name: item.orderStatus.replace('_', ' '),
    value: item._count,
  }))

  return (
    <Card data-testid="orders-by-status-chart">
      <CardHeader>
        <span className="section-label w-fit">Distribution</span>
        <CardTitle>Orders by Status</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={88}
              innerRadius={34}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '18px',
                border: '1px solid #d9d1c5',
                boxShadow: '0 18px 40px rgba(34,48,51,0.12)',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
