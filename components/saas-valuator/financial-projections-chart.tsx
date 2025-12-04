'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { Projection } from '@/types/saas-valuator'

interface FinancialProjectionsChartProps {
  projections: Projection[]
}

export function FinancialProjectionsChart({ projections }: FinancialProjectionsChartProps) {
  if (!projections.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Projections</CardTitle>
          <CardDescription>Revenue and cash flow forecast</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No projection data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = projections.map((p) => ({
    year: p.year.toString(),
    Revenue: Number((p.revenue / 1000000).toFixed(2)),
    'Gross Profit': Number((p.grossProfit / 1000000).toFixed(2)),
    'Free Cash Flow': Number((p.freeCashFlow / 1000000).toFixed(2)),
  }))

  const totalPV = projections.reduce((sum, p) => sum + p.presentValue, 0)

  const formatValue = (value: number) => `$${value.toFixed(1)}M`

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center">
          Financial Projections
        </CardTitle>
        <CardDescription>{projections.length}-year revenue and cash flow forecast</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Chart */}
        <div className="h-[300px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}M`}
              />
              <Tooltip
                formatter={(value: number) => formatValue(value)}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Revenue"
                stroke="hsl(220, 90%, 50%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(220, 90%, 50%)', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Gross Profit"
                stroke="hsl(160, 85%, 39%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(160, 85%, 39%)', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Free Cash Flow"
                stroke="hsl(42, 93%, 50%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(42, 93%, 50%)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Projection Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Year</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Gross Profit</TableHead>
                <TableHead className="text-right">EBITDA</TableHead>
                <TableHead className="text-right">Free Cash Flow</TableHead>
                <TableHead className="text-right">PV of FCF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-xs">
              {projections.map((projection) => (
                <TableRow key={projection.year} className="hover:bg-accent/50">
                  <TableCell className="font-medium">{projection.year}</TableCell>
                  <TableCell className="text-right">
                    ${(projection.revenue / 1000000).toFixed(1)}M
                  </TableCell>
                  <TableCell className="text-right">
                    ${(projection.grossProfit / 1000000).toFixed(1)}M
                  </TableCell>
                  <TableCell className="text-right">
                    ${(projection.ebitda / 1000000).toFixed(1)}M
                  </TableCell>
                  <TableCell className="text-right">
                    ${(projection.freeCashFlow / 1000000).toFixed(1)}M
                  </TableCell>
                  <TableCell className="text-right">
                    ${(projection.presentValue / 1000000).toFixed(1)}M
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableBody className="border-t-2 border-border">
              <TableRow className="bg-accent font-bold">
                <TableCell>Total PV</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right text-primary">
                  ${(totalPV / 1000000).toFixed(1)}M
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
