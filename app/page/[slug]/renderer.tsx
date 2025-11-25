'use client'

import { Render, type Data } from '@measured/puck'
import { config } from '@/lib/puck/config'
import '@measured/puck/puck.css'

interface LandingPageRendererProps {
  data: Data
  title: string
  startupName: string
}

export function LandingPageRenderer({ data, title, startupName }: LandingPageRendererProps) {
  // If no content, show a placeholder
  if (!data || !data.content || data.content.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-zinc-900">{title}</h1>
          <p className="text-zinc-600">by {startupName}</p>
          <p className="text-sm text-zinc-500 mt-8">
            This landing page is coming soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Render config={config} data={data} />
    </div>
  )
}
