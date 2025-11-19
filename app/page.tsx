import { Header } from '@/components/landing/header'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { DocumentTypes } from '@/components/landing/document-types'
import { AdvancedFeatures } from '@/components/landing/advanced-features'
import { CTA } from '@/components/landing/cta'
import { Footer } from '@/components/landing/footer'
import { Separator } from '@/components/ui/separator'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main>
        <Hero />

        <Features />

        <Separator className="container" />

        <DocumentTypes />

        <Separator className="container" />

        <AdvancedFeatures />

        <CTA />
      </main>

      <Footer />
    </div>
  )
}
