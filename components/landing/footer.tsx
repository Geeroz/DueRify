import Image from 'next/image'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-6 max-w-4xl mx-auto">
          <Image
            src="/duerify-logo-new.png"
            alt="DueRify"
            width={120}
            height={48}
            className="h-12 w-auto"
          />

          <Separator className="bg-blue-400 w-full" />

          <div className="text-center space-y-2">
            <p className="text-sm text-blue-200">
              © 2025 DueRify. All rights reserved.
            </p>
            <p className="text-xs text-blue-200 max-w-2xl">
              No. 25 Alma Link Building, Level 17, Soi Chidlom, Ploenchit Road,
              <br />
              Lumpini, Pathumwan Bangkok 10330. Thailand.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
