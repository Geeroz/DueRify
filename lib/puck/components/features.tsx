'use client'

import { ComponentConfig } from '@measured/puck'

export interface FeaturesProps {
  title: string
  subtitle: string
  columns: '2' | '3' | '4'
  features: {
    icon: string
    title: string
    description: string
  }[]
}

export const Features: ComponentConfig<FeaturesProps> = {
  label: 'Features Grid',
  fields: {
    title: { type: 'text', label: 'Section Title' },
    subtitle: { type: 'textarea', label: 'Section Subtitle' },
    columns: {
      type: 'select',
      label: 'Columns',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    features: {
      type: 'array',
      label: 'Features',
      arrayFields: {
        icon: { type: 'text', label: 'Icon (emoji)' },
        title: { type: 'text', label: 'Feature Title' },
        description: { type: 'textarea', label: 'Description' },
      },
      defaultItemProps: {
        icon: '✨',
        title: 'Feature',
        description: 'Feature description',
      },
    },
  },
  defaultProps: {
    title: 'Why Choose Us',
    subtitle: 'Discover the features that set us apart from the competition.',
    columns: '3',
    features: [
      { icon: '⚡', title: 'Lightning Fast', description: 'Experience blazing-fast performance that keeps your workflow smooth.' },
      { icon: '🔒', title: 'Secure by Design', description: 'Enterprise-grade security to protect your most sensitive data.' },
      { icon: '🎯', title: 'Precision Built', description: 'Carefully crafted features that deliver exactly what you need.' },
      { icon: '📊', title: 'Analytics', description: 'Gain deep insights with powerful analytics and reporting tools.' },
      { icon: '🤝', title: 'Collaboration', description: 'Work seamlessly with your team in real-time.' },
      { icon: '🌐', title: 'Global Scale', description: 'Built to scale globally from day one.' },
    ],
  },
  render: ({ title, subtitle, columns, features }) => {
    const gridColsClasses = {
      '2': 'md:grid-cols-2',
      '3': 'md:grid-cols-3',
      '4': 'md:grid-cols-2 lg:grid-cols-4',
    }

    return (
      <section className="py-16 px-6 bg-zinc-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">{title}</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">{subtitle}</p>
          </div>
          <div className={`grid gap-8 ${gridColsClasses[columns]}`}>
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-white rounded-xl border border-zinc-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">{feature.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
}
