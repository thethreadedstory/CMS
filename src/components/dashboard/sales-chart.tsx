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
        <span className="section-label w-fit">Revenue</span>
        <CardTitle>Sales & Purchase Trend</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid stroke="#d9d1c5" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#6b7280" />
            <YAxis tickLine={false} axisLine={false} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                borderRadius: '18px',
                border: '1px solid #d9d1c5',
                boxShadow: '0 18px 40px rgba(34,48,51,0.12)',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#1b6b70" strokeWidth={3} dot={{ r: 4 }} name="Sales" />
            <Line type="monotone" dataKey="purchases" stroke="#b67a36" strokeWidth={3} dot={{ r: 4 }} name="Purchases" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
