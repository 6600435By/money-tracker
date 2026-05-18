import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/nav-bar'

export const metadata: Metadata = {
  title: 'Money Tracker',
  description: 'Simple expense tracking application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="antialiased" suppressHydrationWarning>
        <NavBar />
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
