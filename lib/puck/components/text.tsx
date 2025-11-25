'use client'

import { ComponentConfig } from '@measured/puck'

export interface TextProps {
  text: string
  size: 'small' | 'medium' | 'large'
  alignment: 'left' | 'center' | 'right'
  color: 'default' | 'muted' | 'primary'
}

export const Text: ComponentConfig<TextProps> = {
  label: 'Text',
  fields: {
    text: { type: 'textarea', label: 'Text' },
    size: {
      type: 'select',
      label: 'Size',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
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
    color: {
      type: 'select',
      label: 'Color',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Muted', value: 'muted' },
        { label: 'Primary', value: 'primary' },
      ],
    },
  },
  defaultProps: {
    text: 'Add your text content here. You can write multiple paragraphs and format your content as needed.',
    size: 'medium',
    alignment: 'left',
    color: 'default',
  },
  render: ({ text, size, alignment, color }) => {
    const sizeClasses = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    }

    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }

    const colorClasses = {
      default: 'text-zinc-700',
      muted: 'text-zinc-500',
      primary: 'text-blue-600',
    }

    return (
      <p className={`${sizeClasses[size]} ${alignClasses[alignment]} ${colorClasses[color]} leading-relaxed`}>
        {text}
      </p>
    )
  },
}
