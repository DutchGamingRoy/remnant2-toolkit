import { Inter } from 'next/font/google'

import { NavBar } from '@/features/navigation/NavBar'
import { Footer } from '@/features/ui/Footer'
import { cn } from '@/lib/classnames'
export { metadata } from './metadata'
import './globals.css'
import 'react-toastify/dist/ReactToastify.min.css'

import { Analytics } from '@vercel/analytics/react'
import { Viewport } from 'next'
import { ToastContainer } from 'react-toastify'

import { PreloadResources } from '@/features/ui/PreloadResources'

import { SessionProvider } from '../features/auth/components/SessionProvider'
import { ReportBugButton } from '../features/bug-reports/ReportBugButton'
import { BackToTopButton } from '../features/ui/BackToTopButton'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#581c87',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          'relative flex min-h-screen flex-col items-center justify-start',
          inter.className,
        )}
      >
        <PreloadResources />
        <SessionProvider>
          <div className="fixed bottom-[8px] right-[8px] z-20">
            <BackToTopButton />
          </div>
          <div className="fixed bottom-[8px] right-[52px] z-20">
            <ReportBugButton />
          </div>
          {/* <div className="bg-secondary-900 w-full p-1 text-center text-sm">
            <a
              href="https://remnant.wiki"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Remnant.Wiki
            </a>
            , a community-built alternative to Fextralife, needs contributors!
            No ads or embedded streams. Thank you!
          </div> */}
          <div className="flex w-full max-w-7xl grow flex-col items-start justify-start">
            <header className="w-full">
              <NavBar />
            </header>

            <main className="flex h-full min-h-screen w-full grow flex-col items-center justify-start p-4">
              <ToastContainer theme="dark" />
              {children}
            </main>
          </div>

          <Footer />
        </SessionProvider>
        <Analytics />
        {/* <SpeedInsights /> */}
      </body>
    </html>
  )
}
