'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { calculateDCF, calculateScenarios } from '@/lib/dcf-calculations'
import type { FinancialModel } from '@/types/saas-valuator'

interface ScenarioAnalysisViewProps {
  model: FinancialModel
}

export function ScenarioAnalysisView({ model }: ScenarioAnalysisViewProps) {
  const scenarios = useMemo(() => calculateScenarios(model), [model])
  const baseValuation = scenarios.baseCase.enterpriseValue

  const [customScenario, setCustomScenario] = useState({
    customers: model.customers ?? 0,
    churn: model.churn ?? 0,
    growthY1: model.growthY1,
    growthY5: model.growthY5,
    discountRate: model.discountRate,
  })

  const customValuation = useMemo(() => {
    return calculateDCF({
      ...model,
      ...customScenario,
    }).enterpriseValue
  }, [model, customScenario])

  const scenarioData = [
    {
      name: 'Bear Case',
      description: 'Economic downturn, increased competition',
      valuation: scenarios.bearCase.enterpriseValue,
      change: ((scenarios.bearCase.enterpriseValue - baseValuation) / baseValuation) * 100,
      assumptions: scenarios.bearCase.assumptions,
    },
    {
      name: 'Base Case',
      description: 'Current model assumptions',
      valuation: baseValuation,
      change: 0,
      assumptions: scenarios.baseCase.assumptions,
      isBase: true,
    },
    {
      name: 'Bull Case',
      description: 'Market expansion, product-market fit',
      valuation: scenarios.bullCase.enterpriseValue,
      change: ((scenarios.bullCase.enterpriseValue - baseValuation) / baseValuation) * 100,
      assumptions: scenarios.bullCase.assumptions,
    },
  ]

  const customChange = baseValuation > 0
    ? ((customValuation - baseValuation) / baseValuation) * 100
    : 0

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center">
          Scenario Analysis
        </CardTitle>
        <CardDescription>
          Compare different business scenarios and their impact on valuation
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Predefined Scenarios */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
            Predefined Scenarios
          </h3>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scenario</TableHead>
                  <TableHead className="text-right">Valuation</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead>Key Assumptions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenarioData.map((scenario) => {
                  const isPositive = scenario.change > 0

                  return (
                    <TableRow
                      key={scenario.name}
                      className={scenario.isBase ? 'bg-primary/10 border border-primary' : ''}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{scenario.name}</div>
                          <div className="text-sm text-muted-foreground">{scenario.description}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        ${(scenario.valuation / 1000000).toFixed(1)}M
                      </TableCell>
                      <TableCell className="text-right">
                        {scenario.isBase ? (
                          <Badge variant="secondary">Baseline</Badge>
                        ) : (
                          <Badge
                            variant={isPositive ? 'default' : 'destructive'}
                            className={isPositive ? 'bg-green-500 text-white' : ''}
                          >
                            {isPositive ? '+' : ''}
                            {scenario.change.toFixed(0)}%
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        Growth Y1: {scenario.assumptions.growthY1.toFixed(0)}%, WACC:{' '}
                        {scenario.assumptions.discountRate.toFixed(0)}%
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Custom Scenario Builder */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
            Custom Scenario Builder
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {model.businessType === 'saas' && (
              <>
                <div>
                  <Label htmlFor="custom-customers" className="text-sm">
                    Customers
                  </Label>
                  <Input
                    id="custom-customers"
                    type="number"
                    value={customScenario.customers ?? 0}
                    onChange={(e) =>
                      setCustomScenario((prev) => ({ ...prev, customers: Number(e.target.value) }))
                    }
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="custom-churn" className="text-sm">
                    Churn Rate
                  </Label>
                  <div className="relative">
                    <Input
                      id="custom-churn"
                      type="number"
                      step="0.1"
                      value={customScenario.churn ?? 0}
                      onChange={(e) =>
                        setCustomScenario((prev) => ({ ...prev, churn: Number(e.target.value) }))
                      }
                      className="pr-8 font-mono"
                    />
                    <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="custom-growth-y1" className="text-sm">
                Growth Y1
              </Label>
              <div className="relative">
                <Input
                  id="custom-growth-y1"
                  type="number"
                  step="0.1"
                  value={customScenario.growthY1}
                  onChange={(e) =>
                    setCustomScenario((prev) => ({ ...prev, growthY1: Number(e.target.value) }))
                  }
                  className="pr-8 font-mono"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">%</span>
              </div>
            </div>

            <div>
              <Label htmlFor="custom-growth-y5" className="text-sm">
                Growth Y5
              </Label>
              <div className="relative">
                <Input
                  id="custom-growth-y5"
                  type="number"
                  step="0.1"
                  value={customScenario.growthY5}
                  onChange={(e) =>
                    setCustomScenario((prev) => ({ ...prev, growthY5: Number(e.target.value) }))
                  }
                  className="pr-8 font-mono"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">%</span>
              </div>
            </div>

            <div>
              <Label htmlFor="custom-discount" className="text-sm">
                Discount Rate
              </Label>
              <div className="relative">
                <Input
                  id="custom-discount"
                  type="number"
                  step="0.1"
                  value={customScenario.discountRate}
                  onChange={(e) =>
                    setCustomScenario((prev) => ({ ...prev, discountRate: Number(e.target.value) }))
                  }
                  className="pr-8 font-mono"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">%</span>
              </div>
            </div>
          </div>

          {/* Custom Scenario Result */}
          <div className="p-4 bg-accent rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Custom Scenario Result</h4>
                <p className="text-sm text-muted-foreground">Based on your adjusted assumptions</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold font-mono">
                  ${(customValuation / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm">
                  <Badge
                    variant={customChange > 0 ? 'default' : customChange < 0 ? 'destructive' : 'secondary'}
                    className={customChange > 0 ? 'bg-green-500 text-white' : ''}
                  >
                    {customChange > 0 ? '+' : ''}
                    {customChange.toFixed(0)}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
