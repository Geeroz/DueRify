'use client'

import type { Config, Data } from '@measured/puck'

// Layout Components
import { Section, type SectionProps } from './components/section'
import { Columns, type ColumnsProps } from './components/columns'
import { Spacer, type SpacerProps } from './components/spacer'
import { Divider, type DividerProps } from './components/divider'

// Content Components
import { Hero, type HeroProps } from './components/hero'
import { Heading, type HeadingProps } from './components/heading'
import { Text, type TextProps } from './components/text'
import { Button, type ButtonProps } from './components/button'
import { Image, type ImageProps } from './components/image'
import { Card, type CardProps } from './components/card'
import { Features, type FeaturesProps } from './components/features'
import { Testimonial, type TestimonialProps } from './components/testimonial'
import { Stats, type StatsProps } from './components/stats'
import { CTABanner, type CTABannerProps } from './components/cta-banner'
import { Footer, type FooterProps } from './components/footer'

// Define all component props
type Props = {
  Section: SectionProps
  Columns: ColumnsProps
  Spacer: SpacerProps
  Divider: DividerProps
  Hero: HeroProps
  Heading: HeadingProps
  Text: TextProps
  Button: ButtonProps
  Image: ImageProps
  Card: CardProps
  Features: FeaturesProps
  Testimonial: TestimonialProps
  Stats: StatsProps
  CTABanner: CTABannerProps
  Footer: FooterProps
}

// Puck configuration
export const config: Config<Props> = {
  categories: {
    layout: {
      title: 'Layout',
      components: ['Section', 'Columns', 'Spacer', 'Divider'],
    },
    hero: {
      title: 'Hero',
      components: ['Hero'],
    },
    content: {
      title: 'Content',
      components: ['Heading', 'Text', 'Button', 'Image', 'Card'],
    },
    sections: {
      title: 'Sections',
      components: ['Features', 'Stats', 'Testimonial', 'CTABanner'],
    },
    footer: {
      title: 'Footer',
      components: ['Footer'],
    },
  },
  components: {
    Section,
    Columns,
    Spacer,
    Divider,
    Hero,
    Heading,
    Text,
    Button,
    Image,
    Card,
    Features,
    Testimonial,
    Stats,
    CTABanner,
    Footer,
  },
}

// Initial data for a new landing page
export const initialData: Data = {
  content: [],
  root: {},
}

// Export types
export type { Props, Data }
