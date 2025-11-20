import { Rocket, Building, ChartLine, Cog, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    title: 'FOR STARTUPS',
    icon: Rocket,
    iconBg: 'bg-emerald-600',
    cardBg: 'bg-slate-50 dark:bg-slate-950',
    border: 'border-slate-200 dark:border-slate-800',
    features: [
      'Document Upload & Management',
      'One-Pager Creation',
      'Investor Connections',
      'Progress Tracking',
    ],
  },
  {
    title: 'FOR INCUBATORS',
    icon: Building,
    iconBg: 'bg-primary',
    cardBg: 'bg-slate-50 dark:bg-slate-950',
    border: 'border-slate-200 dark:border-slate-800',
    features: [
      'Document Verification',
      'Portfolio Management',
      'Analytics Dashboard',
      'Startup Oversight',
    ],
  },
  {
    title: 'FOR INVESTORS',
    icon: ChartLine,
    iconBg: 'bg-purple-600',
    cardBg: 'bg-slate-50 dark:bg-slate-950',
    border: 'border-slate-200 dark:border-slate-800',
    features: [
      'Verified Document Access',
      'Due Diligence Tools',
      'Investment Analytics',
      'Deal Flow Management',
    ],
  },
  {
    title: 'FOR ADMINS',
    icon: Cog,
    iconBg: 'bg-orange-500',
    cardBg: 'bg-slate-50 dark:bg-slate-950',
    border: 'border-slate-200 dark:border-slate-800',
    features: [
      'Platform Management',
      'User Role Control',
      'System Analytics',
      'Audit Trails',
    ],
  },
]

export function Features() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Built for Every Stakeholder
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Comprehensive features designed for startups, incubators, and investors
            to collaborate securely.
          </p>
        </div>

        <div className="mx-auto max-w-7xl grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className={`${feature.cardBg} ${feature.border} transition-all hover:-translate-y-1 hover:shadow-lg`}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
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
