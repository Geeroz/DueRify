'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateSensitivity } from '@/lib/dcf-calculations'
import type { FinancialModel } from '@/types/saas-valuator'

interface SensitivityAnalysisViewProps {
  model: FinancialModel
}

export function SensitivityAnalysisView({ model }: SensitivityAnalysisViewProps) {
  const sensitivity = useMemo(() => calculateSensitivity(model), [model])

  const getVariantClass = (change: number) => {
    if (change >= 15) return 'bg-green-500/10 border border-green-500 text-green-600'
    if (change >= 5) return 'bg-green-500/5 text-green-600'
    if (change <= -15) return 'bg-destructive/10 border border-destructive text-destructive'
    if (change <= -5) return 'bg-destructive/5 text-destructive'
    return 'bg-muted'
  }

  const getBaseClass = (scenario: string) => {
    return scenario.includes('Base') ? 'bg-primary/10 border border-primary' : ''
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center">
          Sensitivity Analysis
        </CardTitle>
        <CardDescription>Impact of key variables on valuation</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Growth Rate Sensitivity */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Growth Rate Impact</h3>
            <div className="space-y-2 text-sm">
              {sensitivity.growthSensitivity.map((item, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center py-2 px-3 rounded ${getBaseClass(item.scenario)} ${!item.scenario.includes('Base') ? getVariantClass(item.change) : ''}`}
                >
                  <span className={item.scenario.includes('Base') ? 'font-medium' : ''}>
                    {item.scenario}
                  </span>
                  <div className="text-right">
                    <div className="font-mono font-bold">
                      ${(item.valuation / 1000000).toFixed(1)}M
                    </div>
                    {!item.scenario.includes('Base') && (
                      <div className="text-xs">
                        ({item.change > 0 ? '+' : ''}
                        {item.change}%)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discount Rate Sensitivity */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Discount Rate Impact</h3>
            <div className="space-y-2 text-sm">
              {sensitivity.discountRateSensitivity.map((item, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center py-2 px-3 rounded ${getBaseClass(item.scenario)} ${!item.scenario.includes('Base') ? getVariantClass(item.change) : ''}`}
                >
                  <span className={item.scenario.includes('Base') ? 'font-medium' : ''}>
                    {item.scenario}
                  </span>
                  <div className="text-right">
                    <div className="font-mono font-bold">
                      ${(item.valuation / 1000000).toFixed(1)}M
                    </div>
                    {!item.scenario.includes('Base') && (
                      <div className="text-xs">
                        ({item.change > 0 ? '+' : ''}
                        {item.change}%)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-accent rounded-lg">
          <h4 className="text-sm font-semibold text-foreground mb-2">Key Insights</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Growth rate changes have a significant impact on valuation</p>
            <p>• Higher discount rates reduce enterprise value substantially</p>
            <p>• Consider scenario planning for key assumptions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
