'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/dcf-calculations'
import type { ValuationResult, FinancialModel } from '@/types/saas-valuator'

interface ValuationResultsProps {
  valuation: ValuationResult
  model: FinancialModel
}

export function ValuationResults({ valuation, model }: ValuationResultsProps) {
  const customers = model.customers ?? 0
  const arpu = model.arpu ?? 0
  const churn = model.churn ?? 1
  const cac = model.cac ?? 1

  const currentMRR = customers * arpu
  const currentARR = currentMRR * 12
  const ltv = churn > 0 ? arpu / (churn / 100) : 0
  const ltvCacRatio = cac > 0 ? ltv / cac : 0
  const paybackMonths = arpu > 0 ? cac / arpu : 0
  const ruleOf40 = model.growthY1 + (model.grossMargin - 50) // Simplified rule of 40

  const scenarios = [
    {
      scenario: 'Pessimistic',
      growthRate: Math.max(0, model.growthY1 - 10),
      discountRate: model.discountRate + 3,
      valuation: Math.round(valuation.enterpriseValue * 0.73),
      color: 'text-destructive',
    },
    {
      scenario: 'Base Case',
      growthRate: model.growthY1,
      discountRate: model.discountRate,
      valuation: valuation.enterpriseValue,
      color: 'text-primary font-medium',
    },
    {
      scenario: 'Optimistic',
      growthRate: model.growthY1 + 15,
      discountRate: Math.max(5, model.discountRate - 2),
      valuation: Math.round(valuation.enterpriseValue * 1.31),
      color: 'text-green-600',
    },
  ]

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center">
          Valuation Results
        </CardTitle>
        <CardDescription>DCF analysis and company valuation</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Main Valuation Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-accent rounded-lg">
            <div className="text-3xl font-bold text-foreground font-mono">
              {formatCurrency(valuation.enterpriseValue, true)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Enterprise Value</div>
          </div>
          <div className="text-center p-4 bg-accent rounded-lg">
            <div className="text-3xl font-bold text-foreground font-mono">
              {formatCurrency(valuation.equityValue, true)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Equity Value</div>
          </div>
          <div className="text-center p-4 bg-accent rounded-lg">
            <div className="text-3xl font-bold text-foreground font-mono">
              ${valuation.valuePerShare?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Value per Share</div>
          </div>
        </div>

        {/* Terminal Value */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Terminal Value (PV)</span>
            <span className="font-mono font-bold">{formatCurrency(valuation.terminalValue, true)}</span>
          </div>
        </div>

        {/* Scenario Analysis */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
            Quick Scenario Analysis
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Scenario</TableHead>
                  <TableHead className="text-right">Growth Rate</TableHead>
                  <TableHead className="text-right">Discount Rate</TableHead>
                  <TableHead className="text-right">Valuation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-mono">
                {scenarios.map((scenario, index) => (
                  <TableRow
                    key={index}
                    className={scenario.scenario === 'Base Case' ? 'bg-accent/50' : ''}
                  >
                    <TableCell className={scenario.color}>{scenario.scenario}</TableCell>
                    <TableCell className="text-right">{scenario.growthRate.toFixed(0)}%</TableCell>
                    <TableCell className="text-right">{scenario.discountRate.toFixed(0)}%</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(scenario.valuation, true)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Key Assumptions - Only show for SaaS */}
        {model.businessType === 'saas' && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Key Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Current ARR</span>
                <span className="font-mono">{formatCurrency(currentARR, true)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">LTV/CAC Ratio</span>
                <span className="font-mono">{ltvCacRatio.toFixed(1)}x</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Payback Period</span>
                <span className="font-mono">{paybackMonths.toFixed(1)} months</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Rule of 40</span>
                <span className={`font-mono ${ruleOf40 >= 40 ? 'text-green-600' : 'text-destructive'}`}>
                  {ruleOf40.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Key Assumptions - CPG version */}
        {model.businessType === 'cpg' && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Key Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Annual Revenue</span>
                <span className="font-mono">
                  {formatCurrency(
                    ((model.wholesaleUnitsPerMonth || 0) * (model.wholesalePricePerUnit || 0) +
                      (model.retailUnitsPerMonth || 0) * (model.retailPricePerUnit || 0)) *
                      12,
                    true
                  )}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Gross Margin</span>
                <span className="font-mono">{model.grossMargin.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Y1 Growth Rate</span>
                <span className="font-mono">{model.growthY1}%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Y5 Growth Rate</span>
                <span className="font-mono">{model.growthY5}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
