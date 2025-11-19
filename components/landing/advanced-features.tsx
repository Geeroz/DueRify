import { ChartLine, FileText, Users, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const advancedFeatures = [
  {
    title: 'IDE READINESS ASSESSMENT',
    icon: ChartLine,
    iconColor: 'text-indigo-600',
    cardBg: 'bg-indigo-50 dark:bg-indigo-950/20',
    border: 'border-indigo-100 dark:border-indigo-900',
    features: [
      'Investment Readiness Scoring',
      'Document Completeness Tracking',
      'Gap Analysis & Recommendations',
      'Progress Visualization',
    ],
  },
  {
    title: 'ONE-PAGER CREATION',
    icon: FileText,
    iconColor: 'text-emerald-600',
    cardBg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-100 dark:border-emerald-900',
    features: [
      'Professional Pitch Summaries',
      'Visual Product Galleries',
      'Shareable Public Pages',
      'Engagement Analytics',
    ],
  },
  {
    title: 'STARTUP SOCIAL NETWORK',
    icon: Users,
    iconColor: 'text-purple-600',
    cardBg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-100 dark:border-purple-900',
    features: [
      'Founder Connections',
      'Investor Networking',
      'Incubator Communities',
      'Knowledge Sharing Hub',
    ],
  },
]

export function AdvancedFeatures() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Advanced Features for Modern Startups
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Beyond document management - comprehensive tools for startup growth and
            investor readiness.
          </p>
        </div>

        <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {advancedFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className={`${feature.cardBg} ${feature.border} transition-all hover:-translate-y-1 hover:shadow-lg`}
              >
                <CardHeader>
                  <div className="mb-4">
                    <Icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
