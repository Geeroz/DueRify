import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTA() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to Secure Your Data Room?
          </h2>

          <p className="text-xl text-blue-100">
            Join thousands of startups, incubators, and investors who trust DueRify
            for their document management needs.
          </p>

          <div className="flex justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup" className="flex items-center gap-2">
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
