'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BusinessTypeSelector } from './business-type-selector'
import { SaaSModelForm } from './saas-model-form'
import { CPGModelForm } from './cpg-model-form'
import { ValuationResults } from './valuation-results'
import { FinancialProjectionsChart } from './financial-projections-chart'
import { SensitivityAnalysisView } from './sensitivity-analysis'
import { ScenarioAnalysisView } from './scenario-analysis'
import { BusinessAnalysis } from './business-analysis'
import {
  calculateDCF,
  calculateSaaSMetrics,
  calculateCPGMetrics,
  formatCurrency,
} from '@/lib/dcf-calculations'
import { loadFromLocalStorage, saveToLocalStorage } from '@/lib/local-storage'
import {
  DEFAULT_SAAS_MODEL,
  DEFAULT_CPG_MODEL,
} from '@/types/saas-valuator'
import type {
  BusinessType,
  FinancialModel,
  ValuationResult,
} from '@/types/saas-valuator'
import {
  TrendingUp,
  Package,
  DollarSign,
  ChartLine,
  Users,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
} from 'lucide-react'

const STORAGE_KEY = 'duerify-saas-valuator-data'

interface StoredData {
  model: FinancialModel
  showSelector: boolean
}

export function SaaSValuatorDashboard() {
  const [model, setModel] = useState<FinancialModel | null>(null)
  const [valuation, setValuation] = useState<ValuationResult | null>(null)
  const [showSelector, setShowSelector] = useState(true)
  const [activeTab, setActiveTab] = useState('valuation')
  const [isLoading, setIsLoading] = useState(true)

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = loadFromLocalStorage<StoredData | null>(STORAGE_KEY, null)
    if (stored?.model) {
      setModel(stored.model)
      setShowSelector(stored.showSelector ?? false)
      // Calculate valuation for loaded model
      if (stored.model.businessType) {
        const result = calculateDCF(stored.model)
        setValuation(result)
      }
    }
    setIsLoading(false)
  }, [])

  // Save data to localStorage whenever model changes
  useEffect(() => {
    if (model) {
      saveToLocalStorage(STORAGE_KEY, { model, showSelector })
    }
  }, [model, showSelector])

  // Handle business type selection
  const handleBusinessTypeSelect = useCallback((type: BusinessType) => {
    const defaultModel = type === 'saas'
      ? { ...DEFAULT_SAAS_MODEL, id: crypto.randomUUID(), businessType: type }
      : { ...DEFAULT_CPG_MODEL, id: crypto.randomUUID(), businessType: type }

    setModel(defaultModel as FinancialModel)
    setShowSelector(false)

    // Calculate initial valuation
    const result = calculateDCF(defaultModel as FinancialModel)
    setValuation(result)
  }, [])

  // Handle model updates
  const handleModelUpdate = useCallback((updates: Partial<FinancialModel>) => {
    if (!model) return

    const updatedModel = { ...model, ...updates }
    setModel(updatedModel)

    // Recalculate valuation
    const result = calculateDCF(updatedModel)
    setValuation(result)
  }, [model])

  // Switch business type
  const handleSwitchType = useCallback(() => {
    setShowSelector(true)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show business type selector
  if (showSelector || !model) {
    return (
      <BusinessTypeSelector
        selectedType={model?.businessType || null}
        onSelect={handleBusinessTypeSelect}
      />
    )
  }

  // Calculate metrics based on business type
  const metrics = model.businessType === 'saas'
    ? calculateSaaSMetrics(model)
    : calculateCPGMetrics(model)

  const currentRevenue = model.businessType === 'saas'
    ? (metrics as ReturnType<typeof calculateSaaSMetrics>).arr
    : (metrics as ReturnType<typeof calculateCPGMetrics>).annualRevenue

  return (
    <div className="space-y-6">
      {/* Header with business type badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm py-1 px-3">
            {model.businessType === 'saas' ? (
              <>
                <TrendingUp className="h-3 w-3 mr-1" />
                SaaS Model
              </>
            ) : (
              <>
                <Package className="h-3 w-3 mr-1" />
                CPG Model
              </>
            )}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleSwitchType}>
            Switch to {model.businessType === 'saas' ? 'CPG' : 'SaaS'}
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enterprise Value</p>
                <p className="text-2xl font-bold font-mono">
                  {valuation ? formatCurrency(valuation.enterpriseValue, true) : '$0'}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            {valuation && (
              <div className="mt-2 text-xs text-muted-foreground">
                Per Share: ${valuation.valuePerShare.toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {model.businessType === 'saas' ? 'ARR' : 'Annual Revenue'}
                </p>
                <p className="text-2xl font-bold font-mono">
                  {formatCurrency(currentRevenue, true)}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <ChartLine className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            {model.businessType === 'saas' && (
              <div className="mt-2 text-xs text-muted-foreground">
                MRR: {formatCurrency((metrics as ReturnType<typeof calculateSaaSMetrics>).mrr)}
              </div>
            )}
          </CardContent>
        </Card>

        {model.businessType === 'saas' ? (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer LTV</p>
                    <p className="text-2xl font-bold font-mono">
                      {formatCurrency((metrics as ReturnType<typeof calculateSaaSMetrics>).ltv)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  LTV/CAC: {(metrics as ReturnType<typeof calculateSaaSMetrics>).ltvCacRatio}x
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monthly Churn</p>
                    <p className="text-2xl font-bold font-mono">
                      {(model.churn || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Payback: {(metrics as ReturnType<typeof calculateSaaSMetrics>).paybackPeriod} months
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Wholesale Revenue</p>
                    <p className="text-2xl font-bold font-mono">
                      {formatCurrency((metrics as ReturnType<typeof calculateCPGMetrics>).wholesaleRevenue, true)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {(metrics as ReturnType<typeof calculateCPGMetrics>).channelMix.wholesale}% of revenue
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Retail Revenue</p>
                    <p className="text-2xl font-bold font-mono">
                      {formatCurrency((metrics as ReturnType<typeof calculateCPGMetrics>).retailRevenue, true)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {(metrics as ReturnType<typeof calculateCPGMetrics>).channelMix.retail}% of revenue
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model Inputs</CardTitle>
              <CardDescription>
                {model.businessType === 'saas'
                  ? 'Configure your SaaS metrics and assumptions'
                  : 'Configure your CPG unit economics'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {model.businessType === 'saas' ? (
                <SaaSModelForm model={model} onUpdate={handleModelUpdate} />
              ) : (
                <CPGModelForm model={model} onUpdate={handleModelUpdate} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="valuation">Valuation</TabsTrigger>
              <TabsTrigger value="projections">Projections</TabsTrigger>
              <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="valuation" className="mt-4">
              {valuation ? (
                <ValuationResults valuation={valuation} model={model} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Enter your model inputs to see valuation results</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="projections" className="mt-4">
              {valuation ? (
                <FinancialProjectionsChart projections={valuation.projections} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ChartLine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Financial projections will appear here</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sensitivity" className="mt-4">
              {model ? (
                <SensitivityAnalysisView model={model} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Sensitivity analysis will appear here</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="scenarios" className="mt-4">
              {model ? (
                <ScenarioAnalysisView model={model} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Scenario analysis will appear here</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="ai-analysis" className="mt-4">
              {model ? (
                <BusinessAnalysis model={model} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BrainCircuit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">AI analysis will appear here</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
