'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// Sample data - in real app, this would come from props
const data = [
  { month: 'Jan', sales: 45000, purchases: 28000 },
  { month: 'Feb', sales: 52000, purchases: 32000 },
  { month: 'Mar', sales: 48000, purchases: 29000 },
  { month: 'Apr', sales: 61000, purchases: 35000 },
  { month: 'May', sales: 55000, purchases: 31000 },
  { month: 'Jun', sales: 67000, purchases: 38000 },
]

export function SalesChart() {
  return (
    <Card data-testid="sales-chart">
      <CardHeader>
        <CardTitle>Sales & Purchase Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} name="Sales" />
            <Line type="monotone" dataKey="purchases" stroke="#f59e0b" strokeWidth={2} name="Purchases" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
