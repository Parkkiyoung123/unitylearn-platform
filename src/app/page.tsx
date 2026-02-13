"use client"

import { createGuestSession } from "@/lib/guest-session"
import { useRouter } from "next/navigation"
import { HeroSection } from "@/components/landing/HeroSection"
import { PreviewQuiz } from "@/components/landing/PreviewQuiz"
import { FeatureHighlight } from "@/components/landing/FeatureHighlight"

export default function Home() {
  const router = useRouter()

  const handleGuestMode = () => {
    createGuestSession()
    router.push("/quiz")
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection onGuestMode={handleGuestMode} />

      {/* Preview Quiz Section */}
      <PreviewQuiz />

      {/* Feature Highlight Section */}
      <FeatureHighlight />

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-2">UnityLearn</h3>
              <p className="text-slate-400 text-sm">
                Unity 버그 진단 능력을 향상시키는 학습 플랫폼
              </p>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <span>2026 UnityLearn. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
