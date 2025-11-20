// IDE Assessment Question Definitions

export interface AssessmentQuestion {
  id: string
  level: number
  title: string
  description: string
  examples?: string[]
}

// Technology Readiness Level (TRL) - 1-9 scale
// Measures technical maturity from basic research to proven operational system
export const TRL_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'trl1',
    level: 1,
    title: 'Basic Principles Observed',
    description: 'Scientific research begins, basic principles are observed and reported',
    examples: ['Initial scientific observation', 'Literature review', 'Theoretical concept']
  },
  {
    id: 'trl2',
    level: 2,
    title: 'Technology Concept Formulated',
    description: 'Practical applications are identified, technology concept is formulated',
    examples: ['Invention begins', 'Application hypothesis', 'Basic design']
  },
  {
    id: 'trl3',
    level: 3,
    title: 'Proof of Concept',
    description: 'Analytical and experimental critical function and/or characteristic proof of concept',
    examples: ['Lab experiments', 'Proof of concept demos', 'Initial prototype']
  },
  {
    id: 'trl4',
    level: 4,
    title: 'Lab Validation',
    description: 'Component validation in laboratory environment',
    examples: ['Working prototype', 'Lab testing completed', 'Components integrated']
  },
  {
    id: 'trl5',
    level: 5,
    title: 'Simulated Environment Validation',
    description: 'Component validation in relevant environment',
    examples: ['Prototype tested in simulated conditions', 'Realistic test environment']
  },
  {
    id: 'trl6',
    level: 6,
    title: 'Prototype Demo',
    description: 'System/subsystem model demonstration in relevant environment',
    examples: ['Fully functional prototype', 'Beta version', 'Field testing']
  },
  {
    id: 'trl7',
    level: 7,
    title: 'Operational Prototype',
    description: 'System prototype demonstration in operational environment',
    examples: ['Pilot program', 'Alpha/Beta users', 'Real-world testing']
  },
  {
    id: 'trl8',
    level: 8,
    title: 'System Complete',
    description: 'Actual system completed and qualified through test and demonstration',
    examples: ['Production ready', 'Final testing complete', 'Launch ready']
  },
  {
    id: 'trl9',
    level: 9,
    title: 'System Proven',
    description: 'Actual system proven through successful mission operations',
    examples: ['Live production', 'Customers using product', 'Proven reliable']
  }
]

// Manufacturing Readiness Level (MRL) - 1-10 scale
// Measures production capability and scalability
export const MRL_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'mrl1',
    level: 1,
    title: 'Manufacturing Feasibility',
    description: 'Basic manufacturing implications identified',
    examples: ['Conceptual design', 'No manufacturing process defined']
  },
  {
    id: 'mrl2',
    level: 2,
    title: 'Manufacturing Concept',
    description: 'Manufacturing concepts identified',
    examples: ['Initial process concepts', 'Rough cost estimates']
  },
  {
    id: 'mrl3',
    level: 3,
    title: 'Proof of Concept',
    description: 'Manufacturing proof of concept developed',
    examples: ['Lab-scale production', 'Initial prototypes made']
  },
  {
    id: 'mrl4',
    level: 4,
    title: 'Lab Environment',
    description: 'Capability to produce the technology in a laboratory environment',
    examples: ['Small batch production', 'Manual assembly']
  },
  {
    id: 'mrl5',
    level: 5,
    title: 'Production Environment',
    description: 'Capability to produce prototype components in a production relevant environment',
    examples: ['Pilot production line', 'Quality control established']
  },
  {
    id: 'mrl6',
    level: 6,
    title: 'Production Representative',
    description: 'Capability to produce a prototype system in a production relevant environment',
    examples: ['Representative production', 'Process documented']
  },
  {
    id: 'mrl7',
    level: 7,
    title: 'Low-Rate Production',
    description: 'Capability to produce systems in a low rate production environment',
    examples: ['Small-scale manufacturing', 'Initial production runs']
  },
  {
    id: 'mrl8',
    level: 8,
    title: 'Pilot Production',
    description: 'Capability demonstrated through pilot line capability',
    examples: ['Moderate-scale production', 'Supply chain established']
  },
  {
    id: 'mrl9',
    level: 9,
    title: 'Full-Rate Production',
    description: 'Capability to conduct low rate production',
    examples: ['Scaled production', 'Consistent quality']
  },
  {
    id: 'mrl10',
    level: 10,
    title: 'Full Production',
    description: 'Full rate production demonstrated',
    examples: ['Mass production', 'Optimized processes', 'Global supply chain']
  }
]

// Commercial Readiness Level (CRL) - 1-6 scale
// Measures market readiness and commercial viability
export const CRL_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'crl1',
    level: 1,
    title: 'Market Research',
    description: 'Initial market research and opportunity identification',
    examples: ['Market hypothesis', 'Target customer identified', 'Problem validated']
  },
  {
    id: 'crl2',
    level: 2,
    title: 'Business Case',
    description: 'Business case and value proposition developed',
    examples: ['Business model defined', 'Revenue model identified', 'Competitive analysis']
  },
  {
    id: 'crl3',
    level: 3,
    title: 'Market Validation',
    description: 'Market validation and customer discovery completed',
    examples: ['Customer interviews', 'Market feedback', 'Pricing validation']
  },
  {
    id: 'crl4',
    level: 4,
    title: 'Early Customers',
    description: 'Initial customers acquired and using product',
    examples: ['First paying customers', 'Pilot deployments', 'Revenue generated']
  },
  {
    id: 'crl5',
    level: 5,
    title: 'Market Traction',
    description: 'Significant market traction and repeatable sales process',
    examples: ['Growing customer base', 'Sales process established', 'Market fit validated']
  },
  {
    id: 'crl6',
    level: 6,
    title: 'Market Leadership',
    description: 'Established market position and sustainable growth',
    examples: ['Market leader', 'Scalable sales', 'Strong brand recognition']
  }
]

// Business Readiness Level (BRL) - Custom scale 1-10
// Measures business infrastructure and operational maturity
export const BRL_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'brl1',
    level: 1,
    title: 'Idea Stage',
    description: 'Business concept exists, no formal structure',
    examples: ['Idea only', 'No legal entity', 'Solo founder']
  },
  {
    id: 'brl2',
    level: 2,
    title: 'Formation',
    description: 'Legal entity formed, basic structure established',
    examples: ['Company incorporated', 'Co-founders identified', 'Basic agreements']
  },
  {
    id: 'brl3',
    level: 3,
    title: 'Early Operations',
    description: 'Basic operations and financial management',
    examples: ['Bank account', 'Basic accounting', 'Initial funding']
  },
  {
    id: 'brl4',
    level: 4,
    title: 'Team Building',
    description: 'Core team assembled, roles defined',
    examples: ['Key hires made', 'Advisory board', 'Clear responsibilities']
  },
  {
    id: 'brl5',
    level: 5,
    title: 'Financial Stability',
    description: 'Financial systems and fundraising in place',
    examples: ['Seed funding', 'Financial projections', 'Burn rate managed']
  },
  {
    id: 'brl6',
    level: 6,
    title: 'Operations Scaled',
    description: 'Operational processes documented and scalable',
    examples: ['Standard processes', 'HR policies', 'Scalable infrastructure']
  },
  {
    id: 'brl7',
    level: 7,
    title: 'Growth Stage',
    description: 'Strong business operations and governance',
    examples: ['Board of directors', 'Series A+', 'Department structure']
  },
  {
    id: 'brl8',
    level: 8,
    title: 'Mature Operations',
    description: 'Mature business with established processes',
    examples: ['Profitable or clear path', 'Strong governance', 'Compliance systems']
  },
  {
    id: 'brl9',
    level: 9,
    title: 'Scale Operations',
    description: 'Scaled operations with strategic focus',
    examples: ['Multiple locations', 'Strategic partnerships', 'Exit strategy']
  },
  {
    id: 'brl10',
    level: 10,
    title: 'Market Leader',
    description: 'Established market leader with strong business foundation',
    examples: ['IPO ready or acquired', 'Industry leader', 'Sustainable growth']
  }
]

// Scoring functions
export function calculateOverallScore(
  trlScore?: number | null,
  mrlScore?: number | null,
  crlScore?: number | null,
  brlScore?: number | null
): number | null {
  const scores = [trlScore, mrlScore, crlScore, brlScore].filter((s): s is number => s !== null && s !== undefined)
  if (scores.length === 0) return null
  return scores.reduce((sum, score) => sum + score, 0) / scores.length
}

export function normalizeScore(rawScore: number, maxLevel: number): number {
  return (rawScore / maxLevel) * 100
}

export function generateRecommendations(scores: {
  trlScore?: number | null
  mrlScore?: number | null
  crlScore?: number | null
  brlScore?: number | null
}): string[] {
  const recommendations: string[] = []

  if (scores.trlScore !== null && scores.trlScore !== undefined && scores.trlScore < 50) {
    recommendations.push('Focus on technology development and validation to improve TRL score')
  }

  if (scores.mrlScore !== null && scores.mrlScore !== undefined && scores.mrlScore < 50) {
    recommendations.push('Develop manufacturing capabilities and production processes to improve MRL score')
  }

  if (scores.crlScore !== null && scores.crlScore !== undefined && scores.crlScore < 50) {
    recommendations.push('Increase market validation and customer acquisition efforts to improve CRL score')
  }

  if (scores.brlScore !== null && scores.brlScore !== undefined && scores.brlScore < 50) {
    recommendations.push('Strengthen business operations, governance, and financial management to improve BRL score')
  }

  if (recommendations.length === 0) {
    recommendations.push('Great work! Continue to maintain and improve across all dimensions')
  }

  return recommendations
}
