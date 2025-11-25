'use client'

import { ComponentConfig } from '@measured/puck'

export interface SpacerProps {
  height: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export const Spacer: ComponentConfig<SpacerProps> = {
  label: 'Spacer',
  fields: {
    height: {
      type: 'select',
      label: 'Height',
      options: [
        { label: 'Extra Small (8px)', value: 'xs' },
        { label: 'Small (16px)', value: 'sm' },
        { label: 'Medium (32px)', value: 'md' },
        { label: 'Large (48px)', value: 'lg' },
        { label: 'Extra Large (64px)', value: 'xl' },
        { label: '2XL (96px)', value: '2xl' },
      ],
    },
  },
  defaultProps: {
    height: 'md',
  },
  render: ({ height }) => {
    const heightClasses = {
      xs: 'h-2',
      sm: 'h-4',
      md: 'h-8',
      lg: 'h-12',
      xl: 'h-16',
      '2xl': 'h-24',
    }

    return <div className={`${heightClasses[height]} w-full`} aria-hidden="true" />
  },
}
