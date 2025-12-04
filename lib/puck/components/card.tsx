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

export interface CardProps {
  title: string
  description: string
  icon: string
  iconColor: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

export const Card: ComponentConfig<CardProps> = {
  label: 'Card',
  fields: {
    title: { type: 'text', label: 'Title' },
    description: { type: 'textarea', label: 'Description' },
    icon: {
      type: 'select',
      label: 'Icon',
      options: iconOptions,
    },
    iconColor: {
      type: 'select',
      label: 'Icon Background',
      options: [
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
        { label: 'Purple', value: 'purple' },
        { label: 'Orange', value: 'orange' },
        { label: 'Red', value: 'red' },
      ],
    },
  },
  defaultProps: {
    title: 'Feature Title',
    description: 'Describe your feature or benefit here. Keep it concise and compelling.',
    icon: 'rocket',
    iconColor: 'blue',
  },
  render: ({ title, description, icon, iconColor }) => {
    const iconBgClasses = {
      blue: 'bg-blue-100',
      green: 'bg-green-100',
      purple: 'bg-purple-100',
      orange: 'bg-orange-100',
      red: 'bg-red-100',
    }

    const iconTextClasses = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      red: 'text-red-600',
    }

    const IconComponent = iconMap[icon] || Star

    return (
      <div className="p-6 bg-white rounded-xl border border-zinc-200 hover:shadow-lg transition-shadow">
        <div className={`w-12 h-12 rounded-lg ${iconBgClasses[iconColor]} flex items-center justify-center mb-4`}>
          <IconComponent className={`w-6 h-6 ${iconTextClasses[iconColor]}`} />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{title}</h3>
        <p className="text-zinc-600 text-sm leading-relaxed">{description}</p>
      </div>
    )
  },
}
