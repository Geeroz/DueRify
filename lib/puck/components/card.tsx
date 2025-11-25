'use client'

import { ComponentConfig } from '@measured/puck'

export interface CardProps {
  title: string
  description: string
  icon: string
  iconColor: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

export const Card: ComponentConfig<CardProps> = {
  label: 'Card',
  fields: {
    title: { type: 'text', label: 'Title' },
    description: { type: 'textarea', label: 'Description' },
    icon: { type: 'text', label: 'Icon (emoji or text)' },
    iconColor: {
      type: 'select',
      label: 'Icon Background',
      options: [
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
        { label: 'Purple', value: 'purple' },
        { label: 'Orange', value: 'orange' },
        { label: 'Red', value: 'red' },
      ],
    },
  },
  defaultProps: {
    title: 'Feature Title',
    description: 'Describe your feature or benefit here. Keep it concise and compelling.',
    icon: '🚀',
    iconColor: 'blue',
  },
  render: ({ title, description, icon, iconColor }) => {
    const iconBgClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
    }

    return (
      <div className="p-6 bg-white rounded-xl border border-zinc-200 hover:shadow-lg transition-shadow">
        <div className={`w-12 h-12 rounded-lg ${iconBgClasses[iconColor]} flex items-center justify-center text-2xl mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{title}</h3>
        <p className="text-zinc-600 text-sm leading-relaxed">{description}</p>
      </div>
    )
  },
}
