'use client'

/**
 * 퀴즈 목록 스켈레톤 UI
 * 
 * @description Suspense fallback으로 사용되는 로딩 상태 컴포넌트
 */

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function QuizzesSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b bg-card/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Level Tabs Skeleton */}
        <section>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className={cn(
                  'h-20 rounded-xl',
                  i === 0 ? 'flex-[2]' : 'flex-1'
                )} 
              />
            ))}
          </div>
        </section>

        {/* Progress Cards Skeleton */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        </section>

        {/* Filter Skeleton */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-20" />
            ))}
          </div>
        </section>

        {/* Quiz Grid Skeleton */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <QuizCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function QuizCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-5 w-5" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}
