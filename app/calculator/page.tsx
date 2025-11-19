import type { Metadata } from 'next'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import FinancialTools from '@/components/calculators/financial-tools'

export const metadata: Metadata = {
  title: 'Co-Founder Equity & Cap Table Calculator | DueRify',
  description: 'Free co-founder equity split calculator and cap table management tool. Calculate fair equity distribution based on contributions and simulate funding round dilution.',
}

export default function CalculatorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Page Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Financial Calculators for Startups
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Free tools to help you calculate founder equity splits and manage your cap table.
                All calculations are saved locally in your browser.
              </p>
            </div>

            {/* Calculator Tools */}
            <FinancialTools />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
