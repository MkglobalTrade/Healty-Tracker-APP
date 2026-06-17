import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ToastProvider } from '@/components/toast-provider'
import { Navigation } from '@/components/Navigation'
import { BottomNav } from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'VitaTrack — Your Personal Health Companion',
  description: 'Track glucose, blood pressure, medications, lab results, and get AI-powered health insights.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <ToastProvider>
            <Navigation />
            <main className="pb-20 md:pb-0">
              {children}
            </main>
            <BottomNav />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
