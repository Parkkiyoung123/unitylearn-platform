"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bug, Lightbulb, Wrench, ChevronRight, AlertCircle } from "lucide-react"
import Link from "next/link"

const previewQuiz = {
  id: "preview-1",
  category: "Physics",
  difficulty: "중급",
  title: "Rigidbody가 충돌 후 움직이지 않음",
  symptom: "플레이어 캐릭터가 벽이나 다른 오브젝트와 충돌한 후 예상치 못하게 멈추거나, 물리 반응이 이상하게 작동합니다. 특히 벽에 끼었을 때 미끄러지지 않고 완전히 정지합니다.",
  cause: "Rigidbody의 Freeze Rotation 설정과 물리 재질(Physics Material)의 마찰 계수가 충돌 시 움직임을 완전히 제한하고 있습니다.",
  solution: "1) Freeze Rotation은 필요한 축만 선택 2) Physics Material의 마찰 계수 조정 3) Collision Detection 모드를 Continuous로 변경",
  tags: ["Rigidbody", "Physics", "Collision"]
}

export function PreviewQuiz() {
  return (
    <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-sm">
            미리보기
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            실제 Unity 버그 시나리오
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            실제 프로젝트에서 발생한 버그를 분석하고 해결하는 경험을 제공합니다.
          </p>
        </div>

        {/* 미리보기 카드 */}
        <Card className="max-w-3xl mx-auto overflow-hidden border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-b border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="default" className="bg-indigo-600">
                    {previewQuiz.category}
                  </Badge>
                  <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                    {previewQuiz.difficulty}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {previewQuiz.title}
                </h3>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <Bug className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* 버그 증상 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
                <AlertCircle className="w-5 h-5" />
                <span>버그 증상</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 pl-7 leading-relaxed">
                {previewQuiz.symptom}
              </p>
            </div>

            {/* 원인 분석 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
                <Lightbulb className="w-5 h-5" />
                <span>원인 분석</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 pl-7 leading-relaxed">
                {previewQuiz.cause}
              </p>
            </div>

            {/* 해결 방법 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                <Wrench className="w-5 h-5" />
                <span>해결 방법</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 pl-7 leading-relaxed">
                {previewQuiz.solution}
              </p>
            </div>

            {/* 태그 */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              {previewQuiz.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 더 많은 문제 보기 버튼 */}
        <div className="text-center mt-10">
          <Link href="/quiz">
            <Button 
              variant="outline" 
              size="lg"
              className="group rounded-xl px-8 py-6 text-lg border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
            >
              더 많은 문제 풀어보기
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
