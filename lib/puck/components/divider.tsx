'use client'

import { ComponentConfig } from '@measured/puck'

export interface DividerProps {
  style: 'solid' | 'dashed' | 'dotted'
  color: 'light' | 'medium' | 'dark'
  width: 'full' | 'half' | 'quarter'
  marginY: 'small' | 'medium' | 'large'
}

export const Divider: ComponentConfig<DividerProps> = {
  label: 'Divider',
  fields: {
    style: {
      type: 'select',
      label: 'Style',
      options: [
        { label: 'Solid', value: 'solid' },
        { label: 'Dashed', value: 'dashed' },
        { label: 'Dotted', value: 'dotted' },
      ],
    },
    color: {
      type: 'select',
      label: 'Color',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Medium', value: 'medium' },
        { label: 'Dark', value: 'dark' },
      ],
    },
    width: {
      type: 'select',
      label: 'Width',
      options: [
        { label: 'Full', value: 'full' },
        { label: 'Half', value: 'half' },
        { label: 'Quarter', value: 'quarter' },
      ],
    },
    marginY: {
      type: 'select',
      label: 'Vertical Margin',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
  },
  defaultProps: {
    style: 'solid',
    color: 'light',
    width: 'full',
    marginY: 'medium',
  },
  render: ({ style, color, width, marginY }) => {
    const styleClasses = {
      solid: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    }

    const colorClasses = {
      light: 'border-zinc-200',
      medium: 'border-zinc-400',
      dark: 'border-zinc-600',
    }

    const widthClasses = {
      full: 'w-full',
      half: 'w-1/2',
      quarter: 'w-1/4',
    }

    const marginClasses = {
      small: 'my-4',
      medium: 'my-8',
      large: 'my-12',
    }

    return (
      <hr
        className={`border-t ${styleClasses[style]} ${colorClasses[color]} ${widthClasses[width]} ${marginClasses[marginY]} mx-auto`}
      />
    )
  },
}
