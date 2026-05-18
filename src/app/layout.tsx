import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/nav-bar'
import { Toaster } from '@/components/ui/sonner'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="ru" className={cn("font-sans", geist.variable)}>
      <body className="antialiased" suppressHydrationWarning>
        <NavBar />
        <div id="root">{children}</div>
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
