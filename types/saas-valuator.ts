// Business Type
export type BusinessType = 'saas' | 'cpg'

// Financial Model - Main data structure
export interface FinancialModel {
  id: string
  name: string
  businessType: BusinessType
  businessDescription?: string

  // SaaS Metrics
  customers?: number        // Number of active customers
  churn?: number            // Monthly churn rate (%)
  cac?: number              // Customer Acquisition Cost
  arpu?: number             // Average Revenue Per User

  // CPG Metrics
  cogsPerUnit?: number      // Cost of goods sold per unit

  // Wholesale Channel (CPG)
  wholesaleUnitsPerMonth?: number
  wholesalePricePerUnit?: number

  // Retail Channel (CPG)
  retailUnitsPerMonth?: number
  retailPricePerUnit?: number
  inventoryTurnover?: number      // Times per year
  distributionCostPct?: number    // Distribution as % of revenue

  // Operating Expenses (Both)
  marketingSpendPct?: number      // Marketing as % of revenue
  rdSpendPct?: number             // R&D as % of revenue
  gaSpendPct?: number             // General & Admin as % of revenue

  // Growth Assumptions
  growthY1: number          // Year 1 growth rate (%)
  growthY5: number          // Year 5 growth rate (%)
  grossMargin: number       // Gross margin (%)

  // DCF Parameters
  discountRate: number      // WACC (%)
  terminalGrowth: number    // Terminal growth rate (%)
  projectionYears: number   // Number of projection years
  taxRate: number           // Tax rate percentage
  capexRate: number         // CAPEX as % of revenue

  // Calculated Results
  enterpriseValue?: number
  equityValue?: number
  valuePerShare?: number

  createdAt?: Date
  updatedAt?: Date
}

// Projection for a single year
export interface Projection {
  year: number
  revenue: number
  grossProfit: number
  ebitda: number
  freeCashFlow: number
  presentValue: number
}

// DCF Calculation Result
export interface ValuationResult {
  enterpriseValue: number
  equityValue: number
  valuePerShare: number
  terminalValue: number
  projections: Projection[]
}

// Sensitivity Analysis
export interface SensitivityScenario {
  scenario: string
  value: number
  valuation: number
  change: number
}

export interface SensitivityAnalysis {
  growthSensitivity: SensitivityScenario[]
  discountRateSensitivity: SensitivityScenario[]
}

// Scenario Analysis
export interface ScenarioCase {
  name: string
  enterpriseValue: number
  equityValue: number
  valuePerShare: number
  assumptions: {
    growthY1: number
    growthY5: number
    discountRate: number
  }
}

export interface ScenarioAnalysis {
  bearCase: ScenarioCase
  baseCase: ScenarioCase
  bullCase: ScenarioCase
}

// SaaS Metrics Summary
export interface SaaSMetrics {
  mrr: number               // Monthly Recurring Revenue
  arr: number               // Annual Recurring Revenue
  ltv: number               // Customer Lifetime Value
  ltvCacRatio: number       // LTV/CAC Ratio
  paybackPeriod: number     // Months to recover CAC
}

// CPG Metrics Summary
export interface CPGMetrics {
  monthlyRevenue: number
  annualRevenue: number
  wholesaleRevenue: number
  retailRevenue: number
  channelMix: {
    wholesale: number
    retail: number
  }
}

// Income Statement
export interface IncomeStatementRow {
  label: string
  values: number[]
  isSubtotal?: boolean
  isTotal?: boolean
}

// Balance Sheet
export interface BalanceSheetRow {
  label: string
  values: number[]
  isSubtotal?: boolean
  isTotal?: boolean
}

// Cash Flow Statement
export interface CashFlowStatementRow {
  label: string
  values: number[]
  isSubtotal?: boolean
  isTotal?: boolean
}

// Default values for new models
export const DEFAULT_SAAS_MODEL: Partial<FinancialModel> = {
  name: 'New SaaS Model',
  businessType: 'saas',
  customers: 1000,
  churn: 3,
  cac: 500,
  arpu: 100,
  growthY1: 40,
  growthY5: 15,
  grossMargin: 80,
  discountRate: 12,
  terminalGrowth: 2.5,
  projectionYears: 5,
  taxRate: 20,
  capexRate: 5,
  marketingSpendPct: 20,
  rdSpendPct: 15,
  gaSpendPct: 10,
}

export const DEFAULT_CPG_MODEL: Partial<FinancialModel> = {
  name: 'New CPG Model',
  businessType: 'cpg',
  wholesaleUnitsPerMonth: 5000,
  wholesalePricePerUnit: 15,
  retailUnitsPerMonth: 2000,
  retailPricePerUnit: 25,
  cogsPerUnit: 8,
  inventoryTurnover: 6,
  distributionCostPct: 10,
  growthY1: 30,
  growthY5: 10,
  grossMargin: 45,
  discountRate: 15,
  terminalGrowth: 2,
  projectionYears: 5,
  taxRate: 20,
  capexRate: 8,
  marketingSpendPct: 15,
  rdSpendPct: 5,
  gaSpendPct: 12,
}
