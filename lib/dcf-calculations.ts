import type {
  FinancialModel,
  ValuationResult,
  Projection,
  SensitivityAnalysis,
  ScenarioAnalysis,
  SaaSMetrics,
  CPGMetrics,
} from '@/types/saas-valuator'

/**
 * Calculate DCF valuation for a financial model
 */
export function calculateDCF(model: FinancialModel): ValuationResult {
  const projections: Projection[] = []
  const projectionYears = model.projectionYears || 5

  // Calculate initial revenue based on business type
  let currentRevenue: number
  if (model.businessType === 'saas') {
    const customers = model.customers || 0
    const arpu = model.arpu || 0
    const mrr = customers * arpu
    currentRevenue = mrr * 12 // Convert MRR to ARR
  } else {
    // CPG model
    const wholesaleRevenue = (model.wholesaleUnitsPerMonth || 0) * (model.wholesalePricePerUnit || 0) * 12
    const retailRevenue = (model.retailUnitsPerMonth || 0) * (model.retailPricePerUnit || 0) * 12
    currentRevenue = wholesaleRevenue + retailRevenue
  }

  // Calculate projections for each year
  for (let year = 1; year <= projectionYears; year++) {
    // Calculate growth rate (linear interpolation from Y1 to Y5)
    let growthRate: number
    if (year <= 5) {
      const t = (year - 1) / 4 // Normalize to 0-1 for years 1-5
      growthRate = model.growthY1 + t * (model.growthY5 - model.growthY1)
    } else {
      growthRate = model.growthY5 // Use Y5 growth rate for years beyond 5
    }

    currentRevenue *= (1 + growthRate / 100)

    const grossProfit = currentRevenue * (model.grossMargin / 100)

    // Calculate operating expenses
    const marketingSpend = currentRevenue * ((model.marketingSpendPct || 20) / 100)
    const rdSpend = currentRevenue * ((model.rdSpendPct || 15) / 100)
    const gaSpend = currentRevenue * ((model.gaSpendPct || 10) / 100)
    const distributionCost = model.businessType === 'cpg'
      ? currentRevenue * ((model.distributionCostPct || 10) / 100)
      : 0

    const totalOpex = marketingSpend + rdSpend + gaSpend + distributionCost
    const ebitda = grossProfit - totalOpex

    // Calculate free cash flow
    const capexRate = (model.capexRate || 5) / 100
    const workingCapitalChange = currentRevenue * 0.02 // 2% of revenue
    const taxes = Math.max(0, ebitda * ((model.taxRate || 20) / 100))
    const nopat = ebitda - taxes
    const freeCashFlow = nopat - (currentRevenue * capexRate) - workingCapitalChange

    // Present value calculation
    const discountFactor = Math.pow(1 + model.discountRate / 100, year)
    const presentValue = freeCashFlow / discountFactor

    projections.push({
      year: new Date().getFullYear() + year - 1,
      revenue: Math.round(currentRevenue),
      grossProfit: Math.round(grossProfit),
      ebitda: Math.round(ebitda),
      freeCashFlow: Math.round(freeCashFlow),
      presentValue: Math.round(presentValue),
    })
  }

  // Calculate terminal value
  const finalYearFCF = projections[projections.length - 1].freeCashFlow
  const terminalFCF = finalYearFCF * (1 + model.terminalGrowth / 100)
  const terminalValue = terminalFCF / (model.discountRate / 100 - model.terminalGrowth / 100)
  const terminalValuePV = terminalValue / Math.pow(1 + model.discountRate / 100, projectionYears)

  // Sum up present values
  const sumOfPVs = projections.reduce((sum, p) => sum + p.presentValue, 0)
  const enterpriseValue = sumOfPVs + terminalValuePV

  // Simplified equity value calculation (assuming no net debt)
  const equityValue = enterpriseValue

  // Value per share (assuming 1.2M shares outstanding)
  const sharesOutstanding = 1200000
  const valuePerShare = equityValue / sharesOutstanding

  return {
    enterpriseValue: Math.round(enterpriseValue),
    equityValue: Math.round(equityValue),
    valuePerShare: Math.round(valuePerShare * 100) / 100,
    terminalValue: Math.round(terminalValuePV),
    projections,
  }
}

/**
 * Calculate sensitivity analysis for growth rate and discount rate
 */
export function calculateSensitivity(model: FinancialModel): SensitivityAnalysis {
  const baseValuation = calculateDCF(model)
  const baseEV = baseValuation.enterpriseValue

  // Growth rate sensitivity (-10% to +10%)
  const growthSensitivity = [-10, -5, 0, 5, 10].map(delta => {
    const adjustedModel = {
      ...model,
      growthY1: model.growthY1 + delta,
      growthY5: model.growthY5 + delta,
    }
    const result = calculateDCF(adjustedModel)
    return {
      scenario: delta === 0 ? 'Base' : `${delta > 0 ? '+' : ''}${delta}%`,
      value: model.growthY1 + delta,
      valuation: result.enterpriseValue,
      change: Math.round(((result.enterpriseValue - baseEV) / baseEV) * 100 * 10) / 10,
    }
  })

  // Discount rate sensitivity (-2% to +2%)
  const discountRateSensitivity = [-2, -1, 0, 1, 2].map(delta => {
    const adjustedModel = {
      ...model,
      discountRate: model.discountRate + delta,
    }
    const result = calculateDCF(adjustedModel)
    return {
      scenario: delta === 0 ? 'Base' : `${delta > 0 ? '+' : ''}${delta}%`,
      value: model.discountRate + delta,
      valuation: result.enterpriseValue,
      change: Math.round(((result.enterpriseValue - baseEV) / baseEV) * 100 * 10) / 10,
    }
  })

  return {
    growthSensitivity,
    discountRateSensitivity,
  }
}

/**
 * Calculate scenario analysis (bear, base, bull cases)
 */
export function calculateScenarios(model: FinancialModel): ScenarioAnalysis {
  // Bear case: Lower growth, higher discount rate
  const bearModel = {
    ...model,
    growthY1: model.growthY1 * 0.7,
    growthY5: model.growthY5 * 0.7,
    discountRate: model.discountRate + 2,
  }
  const bearResult = calculateDCF(bearModel)

  // Base case
  const baseResult = calculateDCF(model)

  // Bull case: Higher growth, lower discount rate
  const bullModel = {
    ...model,
    growthY1: model.growthY1 * 1.3,
    growthY5: model.growthY5 * 1.3,
    discountRate: Math.max(model.discountRate - 2, model.terminalGrowth + 1),
  }
  const bullResult = calculateDCF(bullModel)

  return {
    bearCase: {
      name: 'Bear Case',
      enterpriseValue: bearResult.enterpriseValue,
      equityValue: bearResult.equityValue,
      valuePerShare: bearResult.valuePerShare,
      assumptions: {
        growthY1: bearModel.growthY1,
        growthY5: bearModel.growthY5,
        discountRate: bearModel.discountRate,
      },
    },
    baseCase: {
      name: 'Base Case',
      enterpriseValue: baseResult.enterpriseValue,
      equityValue: baseResult.equityValue,
      valuePerShare: baseResult.valuePerShare,
      assumptions: {
        growthY1: model.growthY1,
        growthY5: model.growthY5,
        discountRate: model.discountRate,
      },
    },
    bullCase: {
      name: 'Bull Case',
      enterpriseValue: bullResult.enterpriseValue,
      equityValue: bullResult.equityValue,
      valuePerShare: bullResult.valuePerShare,
      assumptions: {
        growthY1: bullModel.growthY1,
        growthY5: bullModel.growthY5,
        discountRate: bullModel.discountRate,
      },
    },
  }
}

/**
 * Calculate SaaS-specific metrics
 */
export function calculateSaaSMetrics(model: FinancialModel): SaaSMetrics {
  const customers = model.customers || 0
  const arpu = model.arpu || 0
  const churn = model.churn || 0
  const cac = model.cac || 0

  const mrr = customers * arpu
  const arr = mrr * 12

  // LTV calculation: ARPU * Gross Margin / Churn Rate
  const monthlyChurnDecimal = churn / 100
  const ltv = monthlyChurnDecimal > 0
    ? (arpu * (model.grossMargin / 100)) / monthlyChurnDecimal
    : 0

  const ltvCacRatio = cac > 0 ? ltv / cac : 0
  const paybackPeriod = arpu > 0 ? cac / arpu : 0

  return {
    mrr,
    arr,
    ltv: Math.round(ltv),
    ltvCacRatio: Math.round(ltvCacRatio * 10) / 10,
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
  }
}

/**
 * Calculate CPG-specific metrics
 */
export function calculateCPGMetrics(model: FinancialModel): CPGMetrics {
  const wholesaleUnits = model.wholesaleUnitsPerMonth || 0
  const wholesalePrice = model.wholesalePricePerUnit || 0
  const retailUnits = model.retailUnitsPerMonth || 0
  const retailPrice = model.retailPricePerUnit || 0

  const wholesaleMonthly = wholesaleUnits * wholesalePrice
  const retailMonthly = retailUnits * retailPrice
  const monthlyRevenue = wholesaleMonthly + retailMonthly
  const annualRevenue = monthlyRevenue * 12

  const totalRevenue = wholesaleMonthly + retailMonthly
  const wholesalePct = totalRevenue > 0 ? (wholesaleMonthly / totalRevenue) * 100 : 0
  const retailPct = totalRevenue > 0 ? (retailMonthly / totalRevenue) * 100 : 0

  return {
    monthlyRevenue,
    annualRevenue,
    wholesaleRevenue: wholesaleMonthly * 12,
    retailRevenue: retailMonthly * 12,
    channelMix: {
      wholesale: Math.round(wholesalePct),
      retail: Math.round(retailPct),
    },
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`
    }
    if (Math.abs(value) >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`
    }
    if (Math.abs(value) >= 1e3) {
      return `$${(value / 1e3).toFixed(0)}K`
    }
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}
