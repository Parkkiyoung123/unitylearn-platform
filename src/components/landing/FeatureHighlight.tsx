"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Brain, UserCircle } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "실제 버그 사례 기반 학습",
    description: "이론이 아닌 실제 Unity 프로젝트에서 발생한 진짜 버그 사례들로 학습합니다. 콘솔 오류부터 물리 엔진 문제까지 다양한 시나리오를 경험핳세요.",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-100 dark:border-blue-900"
  },
  {
    icon: Brain,
    title: "AI 진단으로 맞춤 난이도 추천",
    description: "AI가 당신의 버그 진단 능력을 분석하고 적절한 난이도의 문제를 추천합니다. 효율적인 학습 경로로 실력을 빠르게 향상시키세요.",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-100 dark:border-purple-900"
  },
  {
    icon: UserCircle,
    title: "게스트 모드로 가입 없이 체험",
    description: "회원가입 없이도 게스트 모드로 바로 시작할 수 있습니다. 충분히 체험핳고 나서 계정을 만들어 진도를 저장하세요.",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-100 dark:border-green-900"
  }
]

export function FeatureHighlight() {
  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            핵심 기능
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            UnityLearn이 특별한 이유
          </p>
        </div>

        {/* 기능 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card 
                key={index}
                className={`group border-2 ${feature.borderColor} bg-white dark:bg-slate-900 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <CardContent className="p-8">
                  {/* 아이콘 */}
                  <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${feature.color}`} />
                  </div>

                  {/* 제목 */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>

                  {/* 설명 */}
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 추가 안내 */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            모든 기능은{" "}
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">묣으로</span>
            {" "}제공됩니다. 지금 바로 시작핳세요.
          </p>
        </div>
      </div>
    </section>
  )
}
