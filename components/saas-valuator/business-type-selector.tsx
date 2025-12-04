'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Package, Check } from 'lucide-react'
import type { BusinessType } from '@/types/saas-valuator'

interface BusinessTypeSelectorProps {
  selectedType: BusinessType | null
  onSelect: (type: BusinessType) => void
}

export function BusinessTypeSelector({ selectedType: initialType, onSelect }: BusinessTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<BusinessType | null>(initialType)

  const handleContinue = () => {
    if (selectedType) {
      onSelect(selectedType)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Business Model</h2>
        <p className="text-muted-foreground">Select the type of business you want to evaluate</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SaaS Option */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedType === 'saas' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedType('saas')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              {selectedType === 'saas' && (
                <Badge variant="default" className="bg-primary">
                  <Check className="h-3 w-3 mr-1" />
                  Selected
                </Badge>
              )}
            </div>
            <CardTitle className="mt-4">SaaS Business</CardTitle>
            <CardDescription>Software as a Service</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Recurring subscription revenue (MRR/ARR)
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Customer acquisition cost (CAC) and churn metrics
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                High gross margins (70-90%)
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Low capital requirements
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>Best for:</strong> Software companies, digital services, subscription businesses
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CPG Option */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedType === 'cpg' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedType('cpg')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-500" />
              </div>
              {selectedType === 'cpg' && (
                <Badge variant="default" className="bg-primary">
                  <Check className="h-3 w-3 mr-1" />
                  Selected
                </Badge>
              )}
            </div>
            <CardTitle className="mt-4">CPG Business</CardTitle>
            <CardDescription>Consumer Packaged Goods</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Unit-based sales and pricing
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Inventory and distribution costs
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Moderate gross margins (30-50%)
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Higher CAPEX for manufacturing
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>Best for:</strong> Consumer goods, retail products, food & beverage, manufacturing
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selectedType}
        >
          Continue with {selectedType === 'saas' ? 'SaaS' : selectedType === 'cpg' ? 'CPG' : 'Selected'} Model
        </Button>
      </div>
    </div>
  )
}
