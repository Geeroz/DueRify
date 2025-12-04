'use client'

import { ComponentConfig } from '@measured/puck'
import { ImagePickerField } from '../fields/image-picker-field'

export interface HeroProps {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
  alignment: 'left' | 'center' | 'right'
  backgroundStyle: 'white' | 'gray' | 'gradient' | 'dark' | 'image'
  backgroundImage?: string
  overlayOpacity: 'none' | 'light' | 'medium' | 'heavy'
}

export const Hero: ComponentConfig<HeroProps> = {
  label: 'Hero Section',
  fields: {
    title: { type: 'text', label: 'Title' },
    subtitle: { type: 'textarea', label: 'Subtitle' },
    ctaText: { type: 'text', label: 'Primary Button Text' },
    ctaLink: { type: 'text', label: 'Primary Button Link' },
    secondaryCtaText: { type: 'text', label: 'Secondary Button Text (optional)' },
    secondaryCtaLink: { type: 'text', label: 'Secondary Button Link (optional)' },
    alignment: {
      type: 'select',
      label: 'Text Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    backgroundStyle: {
      type: 'select',
      label: 'Background Style',
      options: [
        { label: 'White', value: 'white' },
        { label: 'Light Gray', value: 'gray' },
        { label: 'Gradient', value: 'gradient' },
        { label: 'Dark', value: 'dark' },
        { label: 'Image', value: 'image' },
      ],
    },
    backgroundImage: {
      type: 'custom',
      label: 'Background Image',
      render: ({ value, onChange }) => (
        <ImagePickerField value={value || ''} onChange={onChange} />
      ),
    },
    overlayOpacity: {
      type: 'select',
      label: 'Image Overlay',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Light (30%)', value: 'light' },
        { label: 'Medium (50%)', value: 'medium' },
        { label: 'Heavy (70%)', value: 'heavy' },
      ],
    },
  },
  defaultProps: {
    title: 'Transform Your Ideas Into Reality',
    subtitle: 'We help startups build innovative products and scale their business to new heights.',
    ctaText: 'Get Started',
    ctaLink: '#',
    alignment: 'center',
    backgroundStyle: 'white',
    overlayOpacity: 'medium',
  },
  render: ({ title, subtitle, ctaText, ctaLink, secondaryCtaText, secondaryCtaLink, alignment, backgroundStyle, backgroundImage, overlayOpacity }) => {
    const bgClasses = {
      white: 'bg-white',
      gray: 'bg-zinc-50',
      gradient: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      dark: 'bg-zinc-900 text-white',
      image: '',
    }

    const alignClasses = {
      left: 'text-left items-start',
      center: 'text-center items-center',
      right: 'text-right items-end',
    }

    const overlayClasses = {
      none: '',
      light: 'bg-black/30',
      medium: 'bg-black/50',
      heavy: 'bg-black/70',
    }

    const hasBackgroundImage = backgroundStyle === 'image' && backgroundImage
    const useWhiteText = backgroundStyle === 'dark' || hasBackgroundImage

    return (
      <section
        className={`py-20 px-6 relative ${bgClasses[backgroundStyle]}`}
        style={hasBackgroundImage ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        {/* Overlay for background image */}
        {hasBackgroundImage && overlayOpacity !== 'none' && (
          <div className={`absolute inset-0 ${overlayClasses[overlayOpacity]}`} />
        )}

        <div className={`max-w-4xl mx-auto flex flex-col gap-6 ${alignClasses[alignment]} relative z-10`}>
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${useWhiteText ? 'text-white' : 'text-zinc-900'}`}>
            {title}
          </h1>
          <p className={`text-lg md:text-xl max-w-2xl ${useWhiteText ? 'text-zinc-200' : 'text-zinc-600'}`}>
            {subtitle}
          </p>
          <div className="flex gap-4 flex-wrap">
            {ctaText && (
              <a
                href={ctaLink}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                {ctaText}
              </a>
            )}
            {secondaryCtaText && (
              <a
                href={secondaryCtaLink || '#'}
                className={`inline-flex items-center justify-center px-6 py-3 rounded-lg border font-medium transition-colors ${
                  useWhiteText
                    ? 'border-white/50 text-white hover:bg-white/10'
                    : 'border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                {secondaryCtaText}
              </a>
            )}
          </div>
        </div>
      </section>
    )
  },
}
