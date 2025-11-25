'use client'

import { ComponentConfig } from '@measured/puck'

export interface ButtonProps {
  text: string
  link: string
  variant: 'primary' | 'secondary' | 'outline'
  size: 'small' | 'medium' | 'large'
  alignment: 'left' | 'center' | 'right'
}

export const Button: ComponentConfig<ButtonProps> = {
  label: 'Button',
  fields: {
    text: { type: 'text', label: 'Button Text' },
    link: { type: 'text', label: 'Link URL' },
    variant: {
      type: 'select',
      label: 'Style',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
      ],
    },
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
  },
  defaultProps: {
    text: 'Click Here',
    link: '#',
    variant: 'primary',
    size: 'medium',
    alignment: 'left',
  },
  render: ({ text, link, variant, size, alignment }) => {
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-zinc-800 text-white hover:bg-zinc-900',
      outline: 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50',
    }

    const sizeClasses = {
      small: 'px-4 py-2 text-sm',
      medium: 'px-6 py-3 text-base',
      large: 'px-8 py-4 text-lg',
    }

    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    }

    return (
      <div className={`flex ${alignClasses[alignment]}`}>
        <a
          href={link}
          className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors ${variantClasses[variant]} ${sizeClasses[size]}`}
        >
          {text}
        </a>
      </div>
    )
  },
}
