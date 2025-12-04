'use client'

import { useEffect, useRef, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import type { FinancialModel } from '@/types/saas-valuator'

interface CPGModelFormProps {
  model: FinancialModel
  onUpdate: (updates: Partial<FinancialModel>) => void
}

export function CPGModelForm({ model, onUpdate }: CPGModelFormProps) {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-save with debouncing
  const handleFieldChange = (field: keyof FinancialModel, value: number | string) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = setTimeout(() => {
      onUpdate({ [field]: value })
    }, 500)
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  // Calculate derived metrics
  const calculatedMetrics = useMemo(() => {
    const wholesaleRevenue = (model.wholesaleUnitsPerMonth || 0) * (model.wholesalePricePerUnit || 0)
    const retailRevenue = (model.retailUnitsPerMonth || 0) * (model.retailPricePerUnit || 0)
    const totalUnits = (model.wholesaleUnitsPerMonth || 0) + (model.retailUnitsPerMonth || 0)
    const monthlyRevenue = wholesaleRevenue + retailRevenue
    const monthlyGrossProfit =
      ((model.wholesaleUnitsPerMonth || 0) * ((model.wholesalePricePerUnit || 0) - (model.cogsPerUnit || 0))) +
      ((model.retailUnitsPerMonth || 0) * ((model.retailPricePerUnit || 0) - (model.cogsPerUnit || 0)))
    const weightedAveragePrice = totalUnits > 0 ? monthlyRevenue / totalUnits : 0
    const calculatedGrossMargin = weightedAveragePrice > 0
      ? ((weightedAveragePrice - (model.cogsPerUnit || 0)) / weightedAveragePrice * 100)
      : 0

    return {
      wholesaleRevenue,
      retailRevenue,
      monthlyRevenue,
      monthlyGrossProfit,
      calculatedGrossMargin,
    }
  }, [model])

  return (
    <div className="space-y-6">
      {/* Wholesale Channel Section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
          Wholesale Channel
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="wholesaleUnitsPerMonth">Wholesale Units Per Month</Label>
            <Input
              id="wholesaleUnitsPerMonth"
              type="number"
              className="font-mono"
              defaultValue={model.wholesaleUnitsPerMonth || 0}
              onChange={(e) => handleFieldChange('wholesaleUnitsPerMonth', Number(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="wholesalePricePerUnit">Wholesale Price Per Unit</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                id="wholesalePricePerUnit"
                type="number"
                step="0.01"
                className="pl-8 font-mono"
                defaultValue={model.wholesalePricePerUnit || 0}
                onChange={(e) => handleFieldChange('wholesalePricePerUnit', Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Retail Channel Section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
          Retail Channel
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="retailUnitsPerMonth">Retail Units Per Month</Label>
            <Input
              id="retailUnitsPerMonth"
              type="number"
              className="font-mono"
              defaultValue={model.retailUnitsPerMonth || 0}
              onChange={(e) => handleFieldChange('retailUnitsPerMonth', Number(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="retailPricePerUnit">Retail Price Per Unit</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                id="retailPricePerUnit"
                type="number"
                step="0.01"
                className="pl-8 font-mono"
                defaultValue={model.retailPricePerUnit || 0}
                onChange={(e) => handleFieldChange('retailPricePerUnit', Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Cost & Margins Section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
          Cost & Margins
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="cogsPerUnit">Cost of Goods Sold (COGS) Per Unit</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                id="cogsPerUnit"
                type="number"
                step="0.01"
                className="pl-8 font-mono"
                defaultValue={model.cogsPerUnit || 0}
                onChange={(e) => handleFieldChange('cogsPerUnit', Number(e.target.value))}
              />
            </div>
          </div>

          {/* Calculated Metrics Display */}
          <div className="p-3 bg-accent rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wholesale Revenue:</span>
              <span className="font-mono font-medium">
                ${calculatedMetrics.wholesaleRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retail Revenue:</span>
              <span className="font-mono font-medium">
                ${calculatedMetrics.retailRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-muted-foreground">Total Monthly Revenue:</span>
              <span className="font-mono font-medium">
                ${calculatedMetrics.monthlyRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Gross Profit:</span>
              <span className="font-mono font-medium">
                ${calculatedMetrics.monthlyGrossProfit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Blended Gross Margin:</span>
              <span className="font-mono font-medium">
                {calculatedMetrics.calculatedGrossMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Operations Section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
          Operations & Distribution
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="distributionCostPct">Distribution Cost</Label>
            <div className="relative">
              <Input
                id="distributionCostPct"
                type="number"
                step="0.1"
                className="pr-8 font-mono"
                defaultValue={model.distributionCostPct || 10}
                onChange={(e) => handleFieldChange('distributionCostPct', Number(e.target.value))}
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              As percentage of revenue
            </div>
          </div>

          <div>
            <Label htmlFor="marketingSpendPct">Sales & Marketing Spend</Label>
            <div className="relative">
              <Input
                id="marketingSpendPct"
                type="number"
                step="0.1"
                className="pr-8 font-mono"
                defaultValue={model.marketingSpendPct || 15}
                onChange={(e) => handleFieldChange('marketingSpendPct', Number(e.target.value))}
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              As percentage of revenue
            </div>
          </div>

          <div>
            <Label htmlFor="rdSpendPct">R&D Spend</Label>
            <div className="relative">
              <Input
                id="rdSpendPct"
                type="number"
                step="0.1"
                className="pr-8 font-mono"
                defaultValue={model.rdSpendPct || 5}
                onChange={(e) => handleFieldChange('rdSpendPct', Number(e.target.value))}
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              As percentage of revenue
            </div>
          </div>

          <div>
            <Label htmlFor="gaSpendPct">General & Admin Costs</Label>
            <div className="relative">
              <Input
                id="gaSpendPct"
                type="number"
                step="0.1"
                className="pr-8 font-mono"
                defaultValue={model.gaSpendPct || 12}
                onChange={(e) => handleFieldChange('gaSpendPct', Number(e.target.value))}
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              As percentage of revenue
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Growth Assumptions Section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
          Growth Assumptions
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="growthY1">Revenue Growth Rate (Year 1)</Label>
            <div className="relative">
              <Input
                id="growthY1"
                type="number"
                step="0.1"
                className="pr-8 font-mono"
                defaultValue={model.growthY1}
                onChange={(e) => handleFieldChange('growthY1', Number(e.target.value))}
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
            </div>
          </div>

          <div>
            <Label htmlFor="growthY5">Revenue Growth Rate (Year 5)</Label>
            <div className="relative">
              <Input
                id="growthY5"
                type="number"
                step="0.1"
                className="pr-8 font-mono"
                defaultValue={model.growthY5}
                onChange={(e) => handleFieldChange('growthY5', Number(e.target.value))}
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* DCF Parameters Section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
          DCF Parameters
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="discountRate">Discount Rate (WACC)</Label>
            <div className="relative">
              <Input
                id="discountRate"
                type="number"
                step="0.1"
                className="pr-8 font-mono"
                defaultValue={model.discountRate}
                onChange={(e) => handleFieldChange('discountRate', Number(e.target.value))}
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
            </div>
          </div>

          <div>
            <Label htmlFor="terminalGrowth">Terminal Growth Rate</Label>
            <div className="relative">
              <Input
                id="terminalGrowth"
                type="number"
                step="0.1"
                className="pr-8 font-mono"
                defaultValue={model.terminalGrowth}
                onChange={(e) => handleFieldChange('terminalGrowth', Number(e.target.value))}
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
            </div>
          </div>

          <div>
            <Label htmlFor="projectionYears">Projection Period</Label>
            <Select
              value={model.projectionYears.toString()}
              onValueChange={(value) => onUpdate({ projectionYears: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Years</SelectItem>
                <SelectItem value="7">7 Years</SelectItem>
                <SelectItem value="10">10 Years</SelectItem>
                <SelectItem value="15">15 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="taxRate">Corporate Tax Rate</Label>
            <div className="relative">
              <Input
                id="taxRate"
                type="number"
                step="0.1"
                className="pr-8 font-mono"
                defaultValue={model.taxRate}
                onChange={(e) => handleFieldChange('taxRate', Number(e.target.value))}
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
            </div>
          </div>

          <div>
            <Label htmlFor="capexRate">CAPEX Rate</Label>
            <div className="relative">
              <Input
                id="capexRate"
                type="number"
                step="0.1"
                className="pr-8 font-mono"
                defaultValue={model.capexRate}
                onChange={(e) => handleFieldChange('capexRate', Number(e.target.value))}
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Capital expenditure as % of revenue (typically higher for CPG)
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground pt-4">
        Model recalculates automatically when you update inputs
      </div>
    </div>
  )
}
