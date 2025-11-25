'use client'

import { ComponentConfig, DropZone } from '@measured/puck'

export interface ColumnsProps {
  columns: '2' | '3' | '4'
  gap: 'small' | 'medium' | 'large'
  verticalAlign: 'top' | 'center' | 'bottom'
}

export const Columns: ComponentConfig<ColumnsProps> = {
  label: 'Columns',
  fields: {
    columns: {
      type: 'select',
      label: 'Number of Columns',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    gap: {
      type: 'select',
      label: 'Gap Size',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
    verticalAlign: {
      type: 'select',
      label: 'Vertical Alignment',
      options: [
        { label: 'Top', value: 'top' },
        { label: 'Center', value: 'center' },
        { label: 'Bottom', value: 'bottom' },
      ],
    },
  },
  defaultProps: {
    columns: '2',
    gap: 'medium',
    verticalAlign: 'top',
  },
  render: ({ columns, gap, verticalAlign }) => {
    const columnCount = parseInt(columns, 10)

    const gridColsClasses = {
      '2': 'md:grid-cols-2',
      '3': 'md:grid-cols-3',
      '4': 'md:grid-cols-2 lg:grid-cols-4',
    }

    const gapClasses = {
      small: 'gap-4',
      medium: 'gap-6',
      large: 'gap-8',
    }

    const alignClasses = {
      top: 'items-start',
      center: 'items-center',
      bottom: 'items-end',
    }

    return (
      <div className="max-w-6xl mx-auto px-6">
        <div className={`grid grid-cols-1 ${gridColsClasses[columns]} ${gapClasses[gap]} ${alignClasses[verticalAlign]}`}>
          {Array.from({ length: columnCount }).map((_, index) => (
            <div key={index} className="min-h-[50px]">
              <DropZone zone={`column-${index}`} />
            </div>
          ))}
        </div>
      </div>
    )
  },
}
