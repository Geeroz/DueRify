import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { PortfolioGrid } from '@/components/portfolio/portfolio-grid'

export const metadata = {
  title: 'Portfolio | DueRify',
  description: 'Manage your incubator portfolio',
}

export default async function PortfolioPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Check if user is INCUBATOR_ADMIN
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user || user.role !== 'INCUBATOR_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">
            Only incubator admins can access the portfolio dashboard.
          </p>
        </div>
      </div>
    )
  }

  return <PortfolioGrid />
}
