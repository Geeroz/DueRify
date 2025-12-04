'use client'

import { ComponentConfig } from '@measured/puck'
import { ImagePickerField } from '../fields/image-picker-field'

export interface ImageProps {
  src: string
  alt: string
  rounded: 'none' | 'small' | 'medium' | 'large' | 'full'
  shadow: boolean
  maxWidth: 'small' | 'medium' | 'large' | 'full'
  alignment: 'left' | 'center' | 'right'
}

export const Image: ComponentConfig<ImageProps> = {
  label: 'Image',
  fields: {
    src: {
      type: 'custom',
      label: 'Image',
      render: ({ value, onChange }) => (
        <ImagePickerField value={value} onChange={onChange} />
      ),
    },
    alt: { type: 'text', label: 'Alt Text' },
    rounded: {
      type: 'select',
      label: 'Rounded Corners',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'Full', value: 'full' },
      ],
    },
    shadow: {
      type: 'radio',
      label: 'Shadow',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    maxWidth: {
      type: 'select',
      label: 'Max Width',
      options: [
        { label: 'Small (300px)', value: 'small' },
        { label: 'Medium (500px)', value: 'medium' },
        { label: 'Large (800px)', value: 'large' },
        { label: 'Full Width', value: 'full' },
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
    src: 'https://placehold.co/800x400/e2e8f0/64748b?text=Your+Image',
    alt: 'Image description',
    rounded: 'medium',
    shadow: true,
    maxWidth: 'full',
    alignment: 'center',
  },
  render: ({ src, alt, rounded, shadow, maxWidth, alignment }) => {
    const roundedClasses = {
      none: 'rounded-none',
      small: 'rounded',
      medium: 'rounded-lg',
      large: 'rounded-xl',
      full: 'rounded-full',
    }

    const maxWidthClasses = {
      small: 'max-w-[300px]',
      medium: 'max-w-[500px]',
      large: 'max-w-[800px]',
      full: 'max-w-full',
    }

    const alignClasses = {
      left: 'mr-auto',
      center: 'mx-auto',
      right: 'ml-auto',
    }

    return (
      <img
        src={src}
        alt={alt}
        className={`w-full h-auto ${roundedClasses[rounded]} ${shadow ? 'shadow-lg' : ''} ${maxWidthClasses[maxWidth]} ${alignClasses[alignment]}`}
      />
    )
  },
}
