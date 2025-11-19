import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground md:py-32">
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Smart Data Room Management
            <br />
            <span className="text-blue-200">for Startups & Investors</span>
          </h1>

          <p className="mx-auto max-w-3xl text-xl text-blue-100 md:text-2xl">
            Streamline your data room with role-based access, document verification,
            and comprehensive analytics for startups, incubators, and investors.
          </p>

          <div className="flex justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">Get Started Now</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-900/20" />
    </section>
  )
}
