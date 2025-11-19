import { auth } from '@/lib/auth'
import { getUserStartups } from '@/lib/tenant'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()
  const startups = await getUserStartups()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Welcome to your DueRify dashboard
        </p>
      </div>

      {/* User info card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Name:
            </span>
            <span className="text-sm text-zinc-900 dark:text-zinc-50">
              {session?.user?.name || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Email:
            </span>
            <span className="text-sm text-zinc-900 dark:text-zinc-50">
              {session?.user?.email}
            </span>
          </div>
          <div className="flex justify-between">
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
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Your Startups
          </h2>
        </div>

        {startups.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-center text-zinc-600 dark:text-zinc-400 mb-4">
                You don&apos;t have access to any startups yet.
              </p>
              <p className="text-sm text-center text-zinc-500 dark:text-zinc-500">
                Contact your incubator admin to get access to a startup.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {startups.map((startup) => (
              <Card key={startup.id}>
                <CardHeader>
                  <CardTitle>{startup.name}</CardTitle>
                  <CardDescription>
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
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Quick Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base">Upload Document</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Add files to your data room
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base">Edit One-Pager</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Update your startup profile
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base">Take Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Complete readiness evaluation
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base">Invite Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Add team members
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
