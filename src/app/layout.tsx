import { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { BottomNav } from '@/components/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VitaTrack - Your Health Companion',
  description: 'Personal health tracker with AI doctor, lab uploads, blood sugar monitoring, blood pressure tracking, medications, and longevity news.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-health-bg flex flex-col">
          <Navigation />
          <main className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
