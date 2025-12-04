'use client'

import { ComponentConfig } from '@measured/puck'
import {
  Zap,
  Shield,
  Target,
  BarChart3,
  Users,
  Globe,
  Rocket,
  Heart,
  Star,
  CheckCircle,
  Clock,
  Settings,
  Lock,
  Eye,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Briefcase,
  TrendingUp,
  Award,
  Lightbulb,
  Layers,
  type LucideIcon,
} from 'lucide-react'

// Icon mapping for dropdown picker
const iconMap: Record<string, LucideIcon> = {
  zap: Zap,
  shield: Shield,
  target: Target,
  'bar-chart': BarChart3,
  users: Users,
  globe: Globe,
  rocket: Rocket,
  heart: Heart,
  star: Star,
  'check-circle': CheckCircle,
  clock: Clock,
  settings: Settings,
  lock: Lock,
  eye: Eye,
  'message-circle': MessageCircle,
  mail: Mail,
  phone: Phone,
  'map-pin': MapPin,
  calendar: Calendar,
  'credit-card': CreditCard,
  briefcase: Briefcase,
  'trending-up': TrendingUp,
  award: Award,
  lightbulb: Lightbulb,
  layers: Layers,
}

const iconOptions = [
  { label: 'Zap (Lightning)', value: 'zap' },
  { label: 'Shield (Security)', value: 'shield' },
  { label: 'Target (Precision)', value: 'target' },
  { label: 'Bar Chart (Analytics)', value: 'bar-chart' },
  { label: 'Users (Team)', value: 'users' },
  { label: 'Globe (Global)', value: 'globe' },
  { label: 'Rocket (Launch)', value: 'rocket' },
  { label: 'Heart (Love)', value: 'heart' },
  { label: 'Star (Featured)', value: 'star' },
  { label: 'Check Circle (Success)', value: 'check-circle' },
  { label: 'Clock (Time)', value: 'clock' },
  { label: 'Settings (Config)', value: 'settings' },
  { label: 'Lock (Secure)', value: 'lock' },
  { label: 'Eye (Vision)', value: 'eye' },
  { label: 'Message (Chat)', value: 'message-circle' },
  { label: 'Mail (Email)', value: 'mail' },
  { label: 'Phone (Contact)', value: 'phone' },
  { label: 'Map Pin (Location)', value: 'map-pin' },
  { label: 'Calendar (Schedule)', value: 'calendar' },
  { label: 'Credit Card (Payment)', value: 'credit-card' },
  { label: 'Briefcase (Business)', value: 'briefcase' },
  { label: 'Trending Up (Growth)', value: 'trending-up' },
  { label: 'Award (Achievement)', value: 'award' },
  { label: 'Lightbulb (Ideas)', value: 'lightbulb' },
  { label: 'Layers (Stack)', value: 'layers' },
]

export interface FeaturesProps {
  title: string
  subtitle: string
  columns: '2' | '3' | '4'
  features: {
    icon: string
    title: string
    description: string
  }[]
}

export const Features: ComponentConfig<FeaturesProps> = {
  label: 'Features Grid',
  fields: {
    title: { type: 'text', label: 'Section Title' },
    subtitle: { type: 'textarea', label: 'Section Subtitle' },
    columns: {
      type: 'select',
      label: 'Columns',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    features: {
      type: 'array',
      label: 'Features',
      arrayFields: {
        icon: {
          type: 'select',
          label: 'Icon',
          options: iconOptions,
        },
        title: { type: 'text', label: 'Feature Title' },
        description: { type: 'textarea', label: 'Description' },
      },
      defaultItemProps: {
        icon: 'star',
        title: 'Feature',
        description: 'Feature description',
      },
    },
  },
  defaultProps: {
    title: 'Why Choose Us',
    subtitle: 'Discover the features that set us apart from the competition.',
    columns: '3',
    features: [
      { icon: 'zap', title: 'Lightning Fast', description: 'Experience blazing-fast performance that keeps your workflow smooth.' },
      { icon: 'shield', title: 'Secure by Design', description: 'Enterprise-grade security to protect your most sensitive data.' },
      { icon: 'target', title: 'Precision Built', description: 'Carefully crafted features that deliver exactly what you need.' },
      { icon: 'bar-chart', title: 'Analytics', description: 'Gain deep insights with powerful analytics and reporting tools.' },
      { icon: 'users', title: 'Collaboration', description: 'Work seamlessly with your team in real-time.' },
      { icon: 'globe', title: 'Global Scale', description: 'Built to scale globally from day one.' },
    ],
  },
  render: ({ title, subtitle, columns, features }) => {
    const gridColsClasses = {
      '2': 'md:grid-cols-2',
      '3': 'md:grid-cols-3',
      '4': 'md:grid-cols-2 lg:grid-cols-4',
    }

    return (
      <section className="py-16 px-6 bg-zinc-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">{title}</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">{subtitle}</p>
          </div>
          <div className={`grid gap-8 ${gridColsClasses[columns]}`}>
            {features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || Star
              return (
                <div key={index} className="p-6 bg-white rounded-xl border border-zinc-200 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">{feature.title}</h3>
                  <p className="text-zinc-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  },
}
