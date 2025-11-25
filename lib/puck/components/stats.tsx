'use client'

import { ComponentConfig } from '@measured/puck'

export interface StatsProps {
  stats: {
    value: string
    label: string
  }[]
  columns: '2' | '3' | '4'
  style: 'simple' | 'card' | 'highlight'
}

export const Stats: ComponentConfig<StatsProps> = {
  label: 'Stats',
  fields: {
    stats: {
      type: 'array',
      label: 'Statistics',
      arrayFields: {
        value: { type: 'text', label: 'Value' },
        label: { type: 'text', label: 'Label' },
      },
      defaultItemProps: {
        value: '100+',
        label: 'Stat Label',
      },
    },
    columns: {
      type: 'select',
      label: 'Columns',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    style: {
      type: 'select',
      label: 'Style',
      options: [
        { label: 'Simple', value: 'simple' },
        { label: 'Card', value: 'card' },
        { label: 'Highlight', value: 'highlight' },
      ],
    },
  },
  defaultProps: {
    stats: [
      { value: '10K+', label: 'Active Users' },
      { value: '99.9%', label: 'Uptime' },
      { value: '$2M+', label: 'Revenue Generated' },
      { value: '24/7', label: 'Support' },
    ],
    columns: '4',
    style: 'simple',
  },
  render: ({ stats, columns, style }) => {
    const gridColsClasses = {
      '2': 'grid-cols-2',
      '3': 'grid-cols-3',
      '4': 'grid-cols-2 md:grid-cols-4',
    }

    if (style === 'highlight') {
      return (
        <div className="bg-blue-600 rounded-2xl py-12 px-6">
          <div className={`grid ${gridColsClasses[columns]} gap-8 max-w-4xl mx-auto`}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (style === 'card') {
      return (
        <div className={`grid ${gridColsClasses[columns]} gap-6`}>
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl border border-zinc-200 p-6 text-center">
              <p className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2">{stat.value}</p>
              <p className="text-zinc-600">{stat.label}</p>
            </div>
          ))}
        </div>
      )
    }

    // Simple style (default)
    return (
      <div className={`grid ${gridColsClasses[columns]} gap-8`}>
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-zinc-900 mb-2">{stat.value}</p>
            <p className="text-zinc-600">{stat.label}</p>
          </div>
        ))}
      </div>
    )
  },
}
