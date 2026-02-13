"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import Link from "next/link"

interface HeroSectionProps {
  onGuestMode: () => void
}

export function HeroSection({ onGuestMode }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/50 dark:bg-indigo-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-200/50 dark:bg-purple-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* 배지 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>실제 버그 사례 기반 학습 플랫폼</span>
          </div>

          {/* 헤드라인 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
            Unity 버그 진단
            <span className="text-indigo-600 dark:text-indigo-400"> 마스터</span>되기
          </h1>

          {/* 부제목 */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-4 max-w-2xl mx-auto">
            실제 Unity 프로젝트에서 발생한 버그 사례를 통해
            <br className="hidden sm:block" />
            문제 해결 능력을 체계적으로 키워보세요.
          </p>

          <p className="text-base text-slate-500 dark:text-slate-400 mb-10">
            AI 진단 테스트로 내 실력을 파악하고, 맞춤형 학습 경로를 추천받으세요.
          </p>

          {/* CTA 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signin">
              <Button 
                size="lg" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:shadow-xl hover:shadow-indigo-600/30 hover:-translate-y-0.5"
              >
                <Play className="w-5 h-5 mr-2" />
                진단 테스트 시작하기
              </Button>
            </Link>

            <Button 
              variant="outline" 
              size="lg"
              onClick={onGuestMode}
              className="px-8 py-6 text-lg rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              data-testid="guest-mode-button"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              게스트로 체험하기
            </Button>
          </div>

          {/* 신뢰 지표 */}
          <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              이미 많은 Unity 개발자들이 함께하고 있습니다
            </p>
            <div className="flex justify-center items-center gap-8 text-slate-600 dark:text-slate-400">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">100+</div>
                <div className="text-sm">버그 사례</div>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">AI</div>
                <div className="text-sm">맞춤 추천</div>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">Free</div>
                <div className="text-sm">게스트 모드</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
