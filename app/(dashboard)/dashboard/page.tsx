import { auth } from '@/lib/auth'
import { getUserStartups, getCurrentStartup } from '@/lib/tenant'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { DocumentCompletion } from '@/components/dashboard/document-completion'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()

  // Handle investor view
  if (session?.user.role === 'INVESTOR_VIEWER') {
    const investorGrants = await prisma.investorGrant.findMany({
      where: { investorId: session.user.id },
      include: {
        startup: {
          select: {
            id: true,
            name: true,
            industry: true,
            description: true,
          },
        },
      },
    })

    // For investors, show list of startups they have access to
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Investor Dashboard
            </h1>
            <p className="mt-2 text-sm md:text-base text-zinc-600 dark:text-zinc-400">
              View startups you have access to
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900">
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              View Only Access
            </span>
          </div>
        </div>

        {investorGrants.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-center text-sm md:text-base text-zinc-600 dark:text-zinc-400">
                You don't have access to any startups yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {investorGrants.map((grant) => (
              <Card key={grant.id}>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">{grant.startup.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {grant.startup.industry || 'No industry set'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/dashboard?startup=${grant.startup.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  const startups = await getUserStartups()

  // Get current startup context if available
  let currentStartup = null
  let stats = null
  let documentCategories = null
  let activities = null

  try {
    currentStartup = await getCurrentStartup()

    if (currentStartup) {
      // Fetch document statistics
      const documents = await prisma.document.findMany({
        where: { startupId: currentStartup.id },
        select: {
          id: true,
          category: true,
          verificationStatus: true,
          createdAt: true,
          filename: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      const totalDocuments = documents.length
      const verifiedDocuments = documents.filter(d => d.verificationStatus === 'VERIFIED').length
      const pendingDocuments = documents.filter(d => d.verificationStatus === 'PENDING').length

      // Fetch latest assessment
      const assessment = await prisma.assessment.findFirst({
        where: { startupId: currentStartup.id },
        orderBy: { createdAt: 'desc' },
        select: { overallScore: true },
      })

      stats = {
        totalDocuments,
        verifiedDocuments,
        pendingDocuments,
        overallScore: assessment?.overallScore || null,
      }

      // Calculate document categories
      const requiredCategories = ['FINANCIAL', 'LEGAL', 'PRODUCT_SERVICE', 'TEAM']
      const categoryCounts = documents.reduce((acc, doc) => {
        acc[doc.category] = (acc[doc.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      documentCategories = [
        { name: 'Financial', count: categoryCounts['FINANCIAL'] || 0, required: true },
        { name: 'Legal', count: categoryCounts['LEGAL'] || 0, required: true },
        { name: 'Product/Service', count: categoryCounts['PRODUCT_SERVICE'] || 0, required: true },
        { name: 'Team', count: categoryCounts['TEAM'] || 0, required: true },
        { name: 'Market Research', count: categoryCounts['MARKET_RESEARCH'] || 0, required: false },
        { name: 'Custom', count: categoryCounts['CUSTOM'] || 0, required: false },
      ]

      // Build recent activities from various sources
      const recentActivities: any[] = []

      // Recent document uploads
      documents.slice(0, 3).forEach(doc => {
        recentActivities.push({
          id: `doc-${doc.id}`,
          type: 'document_uploaded',
          title: 'Document Uploaded',
          description: doc.filename,
          timestamp: doc.createdAt,
        })
      })

      // Recent verified documents
      const verifiedDocs = documents
        .filter(d => d.verificationStatus === 'VERIFIED')
        .slice(0, 2)
      verifiedDocs.forEach(doc => {
        recentActivities.push({
          id: `verified-${doc.id}`,
          type: 'document_verified',
          title: 'Document Verified',
          description: doc.filename,
          timestamp: doc.createdAt,
        })
      })

      // Assessment completion
      if (assessment) {
        const assessmentRecord = await prisma.assessment.findFirst({
          where: { startupId: currentStartup.id },
          orderBy: { updatedAt: 'desc' },
          select: { updatedAt: true, completedAt: true },
        })

        if (assessmentRecord) {
          recentActivities.push({
            id: 'assessment',
            type: 'assessment_completed',
            title: assessmentRecord.completedAt ? 'Assessment Completed' : 'Assessment Updated',
            description: `Readiness score: ${assessment.overallScore?.toFixed(0)}`,
            timestamp: assessmentRecord.updatedAt,
          })
        }
      }

      // One-pager updates
      const onePager = await prisma.onePager.findFirst({
        where: { startupId: currentStartup.id },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      })

      if (onePager) {
        recentActivities.push({
          id: 'onepager',
          type: 'one_pager_updated',
          title: 'One-Pager Updated',
          description: 'Company profile has been updated',
          timestamp: onePager.updatedAt,
        })
      }

      // Sort by timestamp and take top 5
      activities = recentActivities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5)
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-2 text-sm md:text-base text-zinc-600 dark:text-zinc-400">
          Welcome to your DueRify dashboard
        </p>
      </div>

      {/* Stats Cards - Show only if there's a current startup */}
      {stats && (
        <StatsCards
          totalDocuments={stats.totalDocuments}
          verifiedDocuments={stats.verifiedDocuments}
          pendingDocuments={stats.pendingDocuments}
          overallScore={stats.overallScore}
        />
      )}

      {/* Analytics Grid - Show only if there's a current startup */}
      {currentStartup && documentCategories && activities && (
        <div className="grid gap-6 lg:grid-cols-2">
          <DocumentCompletion
            categories={documentCategories}
            totalDocuments={stats!.totalDocuments}
            verifiedDocuments={stats!.verifiedDocuments}
          />
          <ActivityFeed activities={activities} />
        </div>
      )}

      {/* User info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Your Profile</CardTitle>
          <CardDescription className="text-sm">Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Name:
            </span>
            <span className="text-sm text-zinc-900 dark:text-zinc-50 break-words">
              {session?.user?.name || 'N/A'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Email:
            </span>
            <span className="text-sm text-zinc-900 dark:text-zinc-50 break-all">
              {session?.user?.email}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Role:
            </span>
            <span className="text-sm text-zinc-900 dark:text-zinc-50">
              {session?.user?.role.replace(/_/g, ' ')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Startups section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Your Startups
          </h2>
        </div>

        {startups.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
              <p className="text-center text-sm md:text-base text-zinc-600 dark:text-zinc-400 mb-4">
                You don&apos;t have access to any startups yet.
              </p>
              <p className="text-xs md:text-sm text-center text-zinc-500 dark:text-zinc-500">
                Contact your incubator admin to get access to a startup.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {startups.map((startup) => (
              <Card key={startup.id}>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">{startup.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {startup.industry || 'No industry set'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/dashboard?startup=${startup.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Quick Actions
        </h2>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm md:text-base">Upload Document</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                Add files to your data room
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm md:text-base">Edit One-Pager</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                Update your startup profile
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm md:text-base">Take Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                Complete readiness evaluation
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm md:text-base">Invite Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                Add team members
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
