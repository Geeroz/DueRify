import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Types
interface FinancialModel {
  businessType: 'saas' | 'cpg'
  businessDescription?: string
  customers?: number
  arpu?: number
  churn?: number
  cac?: number
  wholesaleUnitsPerMonth?: number
  wholesalePricePerUnit?: number
  retailUnitsPerMonth?: number
  retailPricePerUnit?: number
  cogsPerUnit?: number
  growthY1: number
  growthY5: number
  grossMargin: number
  discountRate: number
  terminalGrowth: number
  taxRate: number
  capexRate: number
  projectionYears: number
  marketingSpendPct?: number
  rdSpendPct?: number
  gaSpendPct?: number
  distributionCostPct?: number
}

interface Projection {
  year: number
  revenue: number
  grossProfit: number
  ebitda: number
  freeCashFlow: number
  presentValue: number
}

interface ValuationResult {
  enterpriseValue: number
  equityValue: number
  valuePerShare: number
  terminalValue: number
  projections: Projection[]
}

// DCF Calculation (same logic as client-side)
function calculateDCFValuation(model: FinancialModel): ValuationResult {
  const projections: Projection[] = []
  const projectionYears = model.projectionYears || 5

  let currentRevenue: number
  if (model.businessType === 'saas') {
    const customers = model.customers || 0
    const arpu = model.arpu || 0
    const mrr = customers * arpu
    currentRevenue = mrr * 12
  } else {
    const wholesaleRevenue = (model.wholesaleUnitsPerMonth || 0) * (model.wholesalePricePerUnit || 0) * 12
    const retailRevenue = (model.retailUnitsPerMonth || 0) * (model.retailPricePerUnit || 0) * 12
    currentRevenue = wholesaleRevenue + retailRevenue
  }

  for (let year = 1; year <= projectionYears; year++) {
    let growthRate: number
    if (year <= 5) {
      const t = (year - 1) / 4
      growthRate = model.growthY1 + t * (model.growthY5 - model.growthY1)
    } else {
      growthRate = model.growthY5
    }

    currentRevenue *= (1 + growthRate / 100)

    const grossProfit = currentRevenue * (model.grossMargin / 100)
    const marketingSpend = currentRevenue * ((model.marketingSpendPct || 20) / 100)
    const rdSpend = currentRevenue * ((model.rdSpendPct || 15) / 100)
    const gaSpend = currentRevenue * ((model.gaSpendPct || 10) / 100)
    const distributionCost = model.businessType === 'cpg'
      ? currentRevenue * ((model.distributionCostPct || 10) / 100)
      : 0

    const totalOpex = marketingSpend + rdSpend + gaSpend + distributionCost
    const ebitda = grossProfit - totalOpex
    const capexRate = (model.capexRate || 5) / 100
    const workingCapitalChange = currentRevenue * 0.02
    const taxes = Math.max(0, ebitda * ((model.taxRate || 20) / 100))
    const nopat = ebitda - taxes
    const freeCashFlow = nopat - (currentRevenue * capexRate) - workingCapitalChange
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

  const finalYearFCF = projections[projections.length - 1].freeCashFlow
  const terminalFCF = finalYearFCF * (1 + model.terminalGrowth / 100)
  const terminalValue = terminalFCF / (model.discountRate / 100 - model.terminalGrowth / 100)
  const terminalValuePV = terminalValue / Math.pow(1 + model.discountRate / 100, projectionYears)
  const sumOfPVs = projections.reduce((sum, p) => sum + p.presentValue, 0)
  const enterpriseValue = sumOfPVs + terminalValuePV
  const equityValue = enterpriseValue
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const model = body.model as FinancialModel

    if (!model) {
      return NextResponse.json(
        { error: 'Financial model data is required' },
        { status: 400 }
      )
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Calculate valuation
    const valuation = calculateDCFValuation(model)

    // Prepare financial data summary
    const financialSummary = {
      businessType: model.businessType,
      businessDescription: model.businessDescription || 'No description provided',
      currentMetrics: model.businessType === 'cpg' ? {
        monthlyRevenue: ((model.wholesaleUnitsPerMonth || 0) * (model.wholesalePricePerUnit || 0)) +
          ((model.retailUnitsPerMonth || 0) * (model.retailPricePerUnit || 0)),
        wholesaleUnits: model.wholesaleUnitsPerMonth,
        wholesalePrice: model.wholesalePricePerUnit,
        retailUnits: model.retailUnitsPerMonth,
        retailPrice: model.retailPricePerUnit,
        totalUnits: (model.wholesaleUnitsPerMonth || 0) + (model.retailUnitsPerMonth || 0),
        cogsPerUnit: model.cogsPerUnit,
        grossMargin: model.grossMargin,
      } : {
        mrr: (model.customers || 0) * (model.arpu || 0),
        customers: model.customers,
        arpu: model.arpu,
        churn: model.churn,
        cac: model.cac,
        ltv: model.arpu ? model.arpu / ((model.churn || 1) / 100) : 0
      },
      growthAssumptions: {
        year1Growth: model.growthY1,
        year5Growth: model.growthY5,
        terminalGrowth: model.terminalGrowth
      },
      financialAssumptions: {
        discountRate: model.discountRate,
        taxRate: model.taxRate,
        capexRate: model.capexRate,
        grossMargin: model.grossMargin
      },
      valuation: {
        enterpriseValue: valuation.enterpriseValue,
        equityValue: valuation.equityValue,
        terminalValue: valuation.terminalValue,
        projections: valuation.projections
      }
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // Create Big 4 style prompt
    const systemPrompt = `You are a senior partner at a top-tier consulting firm (similar to PwC, EY, Deloitte, or KPMG).
Generate a professional business analysis report based on the provided financial model and valuation data.

Your analysis should be:
1. Executive-level and strategic in nature
2. Data-driven with specific references to the financial metrics
3. Forward-looking with actionable recommendations
4. Written in a professional, authoritative tone similar to Big 4 consulting reports

Structure your analysis with the following sections:
1. Executive Summary - Key findings and strategic imperatives
2. Financial Performance Analysis - Current state and projected performance
3. Valuation Assessment - Commentary on enterprise value and key drivers
4. Risk Factors & Mitigation Strategies - Major risks and recommended actions
5. Strategic Recommendations - 3-5 high-impact recommendations
6. Market Positioning & Growth Opportunities - Industry context and expansion potential
7. Operational Excellence Initiatives - Efficiency improvements and optimization areas

Use professional formatting with bullet points, clear headers, and quantitative insights where applicable.`

    const userPrompt = `Please analyze the following ${model.businessType === 'cpg' ? 'Consumer Packaged Goods (CPG)' : 'Software-as-a-Service (SaaS)'} business:

${model.businessDescription ? `Business Description:\n${model.businessDescription}\n\n` : ''}Financial Data:
${JSON.stringify(financialSummary, null, 2)}

Generate a comprehensive business analysis report in the style of a Big 4 consulting firm. ${model.businessDescription ? 'Consider the business context and description provided when formulating your analysis and recommendations.' : ''}`

    // Generate AI analysis
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    })

    const analysis = completion.choices[0]?.message?.content || 'Unable to generate analysis at this time.'

    return NextResponse.json({
      analysis,
      generatedAt: new Date().toISOString(),
      model: model.businessType
    })

  } catch (error) {
    console.error('Error generating business analysis:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate business analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
