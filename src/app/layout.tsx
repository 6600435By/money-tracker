import type { Metadata } from 'next'
import './globals.css'

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
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
