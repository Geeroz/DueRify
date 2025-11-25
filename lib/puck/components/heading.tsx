'use client'

import { ComponentConfig } from '@measured/puck'

export interface HeadingProps {
  text: string
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  alignment: 'left' | 'center' | 'right'
}

export const Heading: ComponentConfig<HeadingProps> = {
  label: 'Heading',
  fields: {
    text: { type: 'text', label: 'Text' },
    level: {
      type: 'select',
      label: 'Heading Level',
      options: [
        { label: 'H1', value: 'h1' },
        { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' },
        { label: 'H5', value: 'h5' },
        { label: 'H6', value: 'h6' },
      ],
    },
    alignment: {
      type: 'select',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  },
  defaultProps: {
    text: 'Your Heading Here',
    level: 'h2',
    alignment: 'left',
  },
  render: ({ text, level, alignment }) => {
    const sizeClasses = {
      h1: 'text-4xl md:text-5xl font-bold',
      h2: 'text-3xl md:text-4xl font-bold',
      h3: 'text-2xl md:text-3xl font-semibold',
      h4: 'text-xl md:text-2xl font-semibold',
      h5: 'text-lg md:text-xl font-medium',
      h6: 'text-base md:text-lg font-medium',
    }

    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }

    const Tag = level

    return (
      <Tag className={`${sizeClasses[level]} ${alignClasses[alignment]} text-zinc-900`}>
        {text}
      </Tag>
    )
  },
}
