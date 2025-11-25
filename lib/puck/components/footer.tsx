'use client'

import { ComponentConfig } from '@measured/puck'

export interface FooterProps {
  companyName: string
  description?: string
  links: {
    label: string
    url: string
  }[]
  socialLinks?: {
    platform: string
    url: string
  }[]
  copyright?: string
}

export const Footer: ComponentConfig<FooterProps> = {
  label: 'Footer',
  fields: {
    companyName: { type: 'text', label: 'Company Name' },
    description: { type: 'textarea', label: 'Description (optional)' },
    links: {
      type: 'array',
      label: 'Links',
      arrayFields: {
        label: { type: 'text', label: 'Label' },
        url: { type: 'text', label: 'URL' },
      },
      defaultItemProps: {
        label: 'Link',
        url: '#',
      },
    },
    socialLinks: {
      type: 'array',
      label: 'Social Links',
      arrayFields: {
        platform: { type: 'text', label: 'Platform Name' },
        url: { type: 'text', label: 'URL' },
      },
      defaultItemProps: {
        platform: 'Twitter',
        url: '#',
      },
    },
    copyright: { type: 'text', label: 'Copyright Text (optional)' },
  },
  defaultProps: {
    companyName: 'Your Startup',
    description: 'Building the future of innovation, one product at a time.',
    links: [
      { label: 'About', url: '#' },
      { label: 'Features', url: '#' },
      { label: 'Pricing', url: '#' },
      { label: 'Contact', url: '#' },
    ],
    socialLinks: [
      { platform: 'Twitter', url: '#' },
      { platform: 'LinkedIn', url: '#' },
      { platform: 'GitHub', url: '#' },
    ],
  },
  render: ({ companyName, description, links, socialLinks, copyright }) => {
    const currentYear = new Date().getFullYear()

    return (
      <footer className="bg-zinc-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-3">{companyName}</h3>
              {description && <p className="text-zinc-400 text-sm">{description}</p>}
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    <a href={link.url} className="text-zinc-400 hover:text-white transition-colors text-sm">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {socialLinks && socialLinks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Connect</h4>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      className="text-zinc-400 hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-zinc-800 pt-8 text-center text-zinc-500 text-sm">
            {copyright || `© ${currentYear} ${companyName}. All rights reserved.`}
          </div>
        </div>
      </footer>
    )
  },
}
