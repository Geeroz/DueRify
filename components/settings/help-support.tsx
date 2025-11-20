'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, MessageCircle, Mail, ExternalLink, Github } from 'lucide-react'

export function HelpSupport() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Help Center</CardTitle>
          <CardDescription>
            Find answers to common questions and learn how to use DueRify
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="justify-start h-auto p-4" asChild>
              <a href="/docs" target="_blank" rel="noopener noreferrer">
                <BookOpen className="h-5 w-5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium">Documentation</p>
                  <p className="text-xs text-muted-foreground">
                    Comprehensive guides and tutorials
                  </p>
                </div>
              </a>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4" disabled>
              <MessageCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium">Live Chat</p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>Get help from our support team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">
                  Get help via email within 24-48 hours
                </p>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href="mailto:support@duerify.com">support@duerify.com</a>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <Github className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">Report an Issue</p>
                <p className="text-sm text-muted-foreground">
                  Found a bug? Let us know on GitHub
                </p>
                <Button variant="link" className="p-0 h-auto flex items-center gap-1" asChild>
                  <a
                    href="https://github.com/yourusername/duerify/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open an Issue
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>Learn more about DueRify and best practices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/docs/getting-started" target="_blank">
                Getting Started Guide
                <ExternalLink className="h-4 w-4 ml-auto" />
              </a>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/docs/ide-assessment" target="_blank">
                IDE Assessment Guide
                <ExternalLink className="h-4 w-4 ml-auto" />
              </a>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/docs/document-management" target="_blank">
                Document Management Best Practices
                <ExternalLink className="h-4 w-4 ml-auto" />
              </a>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/docs/api" target="_blank">
                API Documentation
                <ExternalLink className="h-4 w-4 ml-auto" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Technical details about your environment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Version</span>
              <span className="font-mono">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Environment</span>
              <span className="font-mono">
                {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Last Updated</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
