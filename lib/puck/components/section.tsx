'use client'

import { ComponentConfig, DropZone } from '@measured/puck'

export interface SectionProps {
  backgroundColor: 'white' | 'gray' | 'dark' | 'gradient'
  paddingY: 'small' | 'medium' | 'large'
  paddingX: 'none' | 'small' | 'medium' | 'large'
  maxWidth: 'full' | 'xl' | '2xl' | '4xl' | '6xl'
}

export const Section: ComponentConfig<SectionProps> = {
  label: 'Section',
  fields: {
    backgroundColor: {
      type: 'select',
      label: 'Background',
      options: [
        { label: 'White', value: 'white' },
        { label: 'Gray', value: 'gray' },
        { label: 'Dark', value: 'dark' },
        { label: 'Gradient', value: 'gradient' },
      ],
    },
    paddingY: {
      type: 'select',
      label: 'Vertical Padding',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
    paddingX: {
      type: 'select',
      label: 'Horizontal Padding',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
    maxWidth: {
      type: 'select',
      label: 'Max Width',
      options: [
        { label: 'Full Width', value: 'full' },
        { label: 'Extra Large', value: 'xl' },
        { label: '2XL', value: '2xl' },
        { label: '4XL', value: '4xl' },
        { label: '6XL', value: '6xl' },
      ],
    },
  },
  defaultProps: {
    backgroundColor: 'white',
    paddingY: 'medium',
    paddingX: 'medium',
    maxWidth: '6xl',
  },
  render: ({ backgroundColor, paddingY, paddingX, maxWidth }) => {
    const bgClasses = {
      white: 'bg-white',
      gray: 'bg-zinc-50',
      dark: 'bg-zinc-900',
      gradient: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    }

    const paddingYClasses = {
      small: 'py-8',
      medium: 'py-16',
      large: 'py-24',
    }

    const paddingXClasses = {
      none: 'px-0',
      small: 'px-4',
      medium: 'px-6',
      large: 'px-8',
    }

    const maxWidthClasses = {
      full: 'max-w-full',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '4xl': 'max-w-4xl',
      '6xl': 'max-w-6xl',
    }

    return (
      <section className={`${bgClasses[backgroundColor]} ${paddingYClasses[paddingY]} ${paddingXClasses[paddingX]}`}>
        <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
          <DropZone zone="content" />
        </div>
      </section>
    )
  },
}
