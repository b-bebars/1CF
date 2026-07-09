import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'RoseUp Quest 2026 — Every Step Gives Hope',
  description: 'Join the global quest for Cystic Fibrosis awareness. Walk, share, and earn roses as you climb the leaderboard.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
