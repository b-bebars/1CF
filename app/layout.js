import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { LangProvider } from '@/lib/i18n'

export const metadata = {
  title: 'RoseUp Quest 2026 — Every Step Gives Hope',
  description: 'Join the global quest for Cystic Fibrosis awareness. Walk, share, and earn roses as you climb the leaderboard.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LangProvider>
          {children}
          <Toaster position="top-center" richColors />
        </LangProvider>
      </body>
    </html>
  )
}
