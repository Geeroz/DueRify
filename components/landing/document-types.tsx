import { Briefcase, Calculator, Gavel, FileText, FileSpreadsheet, File, ChartLine, Shield, Building, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const documentCategories = [
  {
    title: 'BUSINESS DOCUMENTS',
    icon: Briefcase,
    iconColor: 'text-primary',
    documents: [
      { name: 'Business Plans', icon: FileText, color: 'text-red-500' },
      { name: 'Pitch Decks', icon: File, color: 'text-orange-500' },
      { name: 'Executive Summaries', icon: FileText, color: 'text-blue-500' },
      { name: 'Market Research', icon: ChartLine, color: 'text-green-500' },
    ],
  },
  {
    title: 'FINANCIAL DOCUMENTS',
    icon: Calculator,
    iconColor: 'text-accent',
    documents: [
      { name: 'Financial Projections', icon: FileSpreadsheet, color: 'text-green-600' },
      { name: 'Income Statements', icon: FileText, color: 'text-blue-600' },
      { name: 'Balance Sheets', icon: FileSpreadsheet, color: 'text-purple-600' },
      { name: 'Cap Tables', icon: ChartLine, color: 'text-orange-600' },
      { name: 'Co-Founder Equity Split', icon: Users, color: 'text-pink-600' },
    ],
  },
  {
    title: 'LEGAL DOCUMENTS',
    icon: Gavel,
    iconColor: 'text-gray-700 dark:text-gray-300',
    documents: [
      { name: 'Legal Agreements', icon: FileText, color: 'text-red-600' },
      { name: 'Privacy Policies', icon: Shield, color: 'text-blue-600' },
      { name: 'Patent Filings', icon: FileText, color: 'text-yellow-600' },
      { name: 'Incorporation Docs', icon: Building, color: 'text-gray-600' },
    ],
  },
]

export function DocumentTypes() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Comprehensive Document Management
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Support for all document types with secure categorization and version control.
          </p>
        </div>

        <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {documentCategories.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`h-8 w-8 ${category.iconColor}`} />
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {category.documents.map((doc) => {
                      const DocIcon = doc.icon
                      return (
                        <Badge
                          key={doc.name}
                          variant="secondary"
                          className="flex items-center gap-1.5 px-3 py-1.5"
                        >
                          <DocIcon className={`h-3.5 w-3.5 ${doc.color}`} />
                          <span className="text-xs">{doc.name}</span>
                        </Badge>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
