'use client'

import { useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import type { FinancialModel } from '@/types/saas-valuator'

interface SaaSModelFormProps {
  model: FinancialModel
  onUpdate: (updates: Partial<FinancialModel>) => void
}

export function SaaSModelForm({ model, onUpdate }: SaaSModelFormProps) {
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

  const currentMRR = (model.customers || 0) * (model.arpu || 0)

  return (
    <div className="space-y-6">
      {/* Current Metrics Section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
          Current Metrics
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="customers">Number of Active Customers</Label>
            <Input
              id="customers"
              type="number"
              className="font-mono"
              defaultValue={model.customers || 0}
              onChange={(e) => handleFieldChange('customers', Number(e.target.value))}
            />
            <div className="text-xs text-muted-foreground mt-1">
              Calculated MRR: ${currentMRR.toLocaleString()}
            </div>
          </div>

          <div>
            <Label htmlFor="churn">Monthly Churn Rate</Label>
            <div className="relative">
              <Input
                id="churn"
                type="number"
                step="0.1"
                className="pr-8 font-mono"
                defaultValue={model.churn || 0}
                onChange={(e) => handleFieldChange('churn', Number(e.target.value))}
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
            </div>
          </div>

          <div>
            <Label htmlFor="cac">Customer Acquisition Cost (CAC)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                id="cac"
                type="number"
                className="pl-8 font-mono"
                defaultValue={model.cac || 0}
                onChange={(e) => handleFieldChange('cac', Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="arpu">Average Revenue Per User (ARPU)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                id="arpu"
                type="number"
                className="pl-8 font-mono"
                defaultValue={model.arpu || 0}
                onChange={(e) => handleFieldChange('arpu', Number(e.target.value))}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Monthly revenue per user
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

          <div>
            <Label htmlFor="grossMargin">Gross Margin</Label>
            <div className="relative">
              <Input
                id="grossMargin"
                type="number"
                step="0.1"
                className="pr-8 font-mono"
                defaultValue={model.grossMargin}
                onChange={(e) => handleFieldChange('grossMargin', Number(e.target.value))}
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Operating Expenses Section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
          Operating Expenses
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="marketingSpendPct">Sales & Marketing Spend</Label>
            <div className="relative">
              <Input
                id="marketingSpendPct"
                type="number"
                step="0.1"
                className="pr-8 font-mono"
                defaultValue={model.marketingSpendPct || 20}
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
                defaultValue={model.rdSpendPct || 15}
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
                defaultValue={model.gaSpendPct || 10}
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
            <div className="text-xs text-muted-foreground mt-1">
              Thailand: 20% (standard rate)
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
              Capital expenditure as % of revenue
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
