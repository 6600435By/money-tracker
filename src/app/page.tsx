'use client'

import { Suspense } from 'react'
import HomeContent from './home-content'

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-32 bg-gray-200 rounded mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  )
}
