'use client'

import { ComponentConfig } from '@measured/puck'
import { ImagePickerField } from '../fields/image-picker-field'

export interface TestimonialProps {
  quote: string
  authorName: string
  authorRole: string
  authorCompany: string
  authorImage?: string
  style: 'simple' | 'card' | 'featured'
}

export const Testimonial: ComponentConfig<TestimonialProps> = {
  label: 'Testimonial',
  fields: {
    quote: { type: 'textarea', label: 'Quote' },
    authorName: { type: 'text', label: 'Author Name' },
    authorRole: { type: 'text', label: 'Author Role' },
    authorCompany: { type: 'text', label: 'Company' },
    authorImage: {
      type: 'custom',
      label: 'Author Image (optional)',
      render: ({ value, onChange }) => (
        <ImagePickerField value={value || ''} onChange={onChange} />
      ),
    },
    style: {
      type: 'select',
      label: 'Style',
      options: [
        { label: 'Simple', value: 'simple' },
        { label: 'Card', value: 'card' },
        { label: 'Featured', value: 'featured' },
      ],
    },
  },
  defaultProps: {
    quote: 'This product has completely transformed how we work. The team collaboration features are outstanding, and the support has been incredible.',
    authorName: 'Sarah Johnson',
    authorRole: 'CEO',
    authorCompany: 'TechStartup Inc.',
    style: 'card',
  },
  render: ({ quote, authorName, authorRole, authorCompany, authorImage, style }) => {
    if (style === 'simple') {
      return (
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xl md:text-2xl text-zinc-700 italic mb-6">&ldquo;{quote}&rdquo;</p>
          <div className="flex items-center justify-center gap-3">
            {authorImage && (
              <img src={authorImage} alt={authorName} className="w-10 h-10 rounded-full object-cover" />
            )}
            <div className="text-left">
              <p className="font-semibold text-zinc-900">{authorName}</p>
              <p className="text-sm text-zinc-600">{authorRole}, {authorCompany}</p>
            </div>
          </div>
        </div>
      )
    }

    if (style === 'featured') {
      return (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-5xl mb-6">&ldquo;</div>
            <p className="text-xl md:text-2xl mb-8 leading-relaxed">{quote}</p>
            <div className="flex items-center justify-center gap-4">
              {authorImage ? (
                <img src={authorImage} alt={authorName} className="w-14 h-14 rounded-full object-cover border-2 border-white/30" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                  {authorName.charAt(0)}
                </div>
              )}
              <div className="text-left">
                <p className="font-semibold text-lg">{authorName}</p>
                <p className="text-blue-200">{authorRole}, {authorCompany}</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Card style (default)
    return (
      <div className="bg-white rounded-xl border border-zinc-200 p-6 md:p-8 shadow-sm">
        <p className="text-lg text-zinc-700 mb-6 leading-relaxed">&ldquo;{quote}&rdquo;</p>
        <div className="flex items-center gap-4">
          {authorImage ? (
            <img src={authorImage} alt={authorName} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold">
              {authorName.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-zinc-900">{authorName}</p>
            <p className="text-sm text-zinc-600">{authorRole}, {authorCompany}</p>
          </div>
        </div>
      </div>
    )
  },
}
