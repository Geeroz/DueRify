'use client'

import { ComponentConfig } from '@measured/puck'

export interface CTABannerProps {
  title: string
  description: string
  buttonText: string
  buttonLink: string
  style: 'simple' | 'gradient' | 'dark'
}

export const CTABanner: ComponentConfig<CTABannerProps> = {
  label: 'CTA Banner',
  fields: {
    title: { type: 'text', label: 'Title' },
    description: { type: 'textarea', label: 'Description' },
    buttonText: { type: 'text', label: 'Button Text' },
    buttonLink: { type: 'text', label: 'Button Link' },
    style: {
      type: 'select',
      label: 'Style',
      options: [
        { label: 'Simple', value: 'simple' },
        { label: 'Gradient', value: 'gradient' },
        { label: 'Dark', value: 'dark' },
      ],
    },
  },
  defaultProps: {
    title: 'Ready to Get Started?',
    description: 'Join thousands of satisfied customers and transform your business today.',
    buttonText: 'Start Free Trial',
    buttonLink: '#',
    style: 'gradient',
  },
  render: ({ title, description, buttonText, buttonLink, style }) => {
    const styleClasses = {
      simple: 'bg-zinc-100',
      gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
      dark: 'bg-zinc-900',
    }

    const textColorClasses = {
      simple: 'text-zinc-900',
      gradient: 'text-white',
      dark: 'text-white',
    }

    const subtextColorClasses = {
      simple: 'text-zinc-600',
      gradient: 'text-blue-100',
      dark: 'text-zinc-400',
    }

    const buttonClasses = {
      simple: 'bg-blue-600 text-white hover:bg-blue-700',
      gradient: 'bg-white text-blue-600 hover:bg-blue-50',
      dark: 'bg-white text-zinc-900 hover:bg-zinc-100',
    }

    return (
      <section className={`py-16 px-6 ${styleClasses[style]}`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textColorClasses[style]}`}>
            {title}
          </h2>
          <p className={`text-lg mb-8 ${subtextColorClasses[style]}`}>
            {description}
          </p>
          <a
            href={buttonLink}
            className={`inline-flex items-center justify-center px-8 py-4 rounded-lg font-medium text-lg transition-colors ${buttonClasses[style]}`}
          >
            {buttonText}
          </a>
        </div>
      </section>
    )
  },
}
