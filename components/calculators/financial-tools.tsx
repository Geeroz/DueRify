'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, Building2 } from 'lucide-react'
import FounderEquityCalculator from './founder-equity-calculator'
import CapTableCalculator from './cap-table-calculator'

export default function FinancialTools() {
  return (
    <Tabs defaultValue="equity" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="equity" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          <span>Founder Equity Split</span>
        </TabsTrigger>
        <TabsTrigger value="captable" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span>Cap Table</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="equity">
        <FounderEquityCalculator />
      </TabsContent>

      <TabsContent value="captable">
        <CapTableCalculator />
      </TabsContent>
    </Tabs>
  )
}
