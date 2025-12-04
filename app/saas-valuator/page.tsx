import type { Metadata } from 'next'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { SaaSValuatorDashboard } from '@/components/saas-valuator/saas-valuator-dashboard'

export const metadata: Metadata = {
  title: 'SaaS Valuator - DCF Valuation Calculator | DueRify',
  description: 'Free DCF valuation calculator for SaaS and CPG businesses. Calculate enterprise value, equity value, and perform sensitivity analysis with real-time projections.',
}

export default function SaaSValuatorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Page Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                SaaS Valuator
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Professional DCF valuation for SaaS and CPG businesses.
                Calculate enterprise value, run sensitivity analysis, and generate financial projections.
              </p>
            </div>

            {/* Valuator Dashboard */}
            <SaaSValuatorDashboard />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
