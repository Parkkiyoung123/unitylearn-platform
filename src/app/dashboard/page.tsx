import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Target, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  ArrowRight,
  Play,
  AlertTriangle,
  Lock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react'

import { getAuthenticatedSession } from '@/lib/server-session'
import { 
  getDashboardStats,
  getQuizzesByLevel, 
  getRecommendedQuizzes,
  getContinueLearning 
} from '@/lib/dashboard-queries'
import { 
  LEVEL_DISPLAY_NAMES, 
  USER_LEVEL_DISPLAY_NAMES,
  QUIZ_LEVEL_CONFIG,
  userLevelToQuizLevel
} from '@/types/dashboard'
import type { QuizLevel, UserLevel } from '@/types/dashboard'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/quiz/ProgressBar'
import { StreakDisplay } from '@/components/dashboard/StreakDisplay'

// ============================================================================
// StatCard Component
// ============================================================================

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

function StatCard({ title, value, description, icon, trend, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'border-slate-200 dark:border-slate-800',
    success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10',
    warning: 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10',
    danger: 'border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-900/10',
  }

  const iconStyles = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    danger: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  }

  return (
    <Card className={variantStyles[variant]}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className="mt-2 flex items-center gap-1 text-sm">
                <span className={trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-muted-foreground">vs 지난 주</span>
              </div>
            )}
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconStyles[variant]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// LevelBadge Component
// ============================================================================

interface LevelBadgeProps {
  level: UserLevel
  size?: 'sm' | 'md' | 'lg'
}

function LevelBadge({ level, size = 'md' }: LevelBadgeProps) {
  const config = {
    Beginner: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: '🌱' },
    Intermediate: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '🌿' },
    Advanced: { color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', icon: '🌳' },
    Expert: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: '⭐' },
    Master: { color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: '👑' },
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config[level].color} ${sizeClasses[size]}`}>
      <span>{config[level].icon}</span>
      <span>{USER_LEVEL_DISPLAY_NAMES[level]}</span>
    </span>
  )
}

// ============================================================================
// ContinueBanner Component
// ============================================================================

interface ContinueBannerProps {
  quizId: string
  quizTitle: string
  progressPercent: number
}

function ContinueBanner({ quizId, quizTitle, progressPercent }: ContinueBannerProps) {
  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                이어서 학습하기
              </span>
            </div>
            <h3 className="mt-1 text-lg font-semibold">{quizTitle}</h3>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 max-w-[200px]">
                <ProgressBar 
                  current={progressPercent} 
                  total={100} 
                  showLabel={false}
                  size="sm"
                  color="warning"
                />
              </div>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercent)}% 완료</span>
            </div>
          </div>
          <Link href={`/quiz/${quizId}`}>
            <Button className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700">
              계속하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// RecommendedCard Component
// ============================================================================

interface RecommendedCardProps {
  id: string
  title: string
  category: string
  reason: string
}

function RecommendedCard({ id, title, category, reason }: RecommendedCardProps) {
  return (
    <Link href={`/quiz/${id}`} className="block group">
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 group-hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Badge variant="secondary" className="mb-2">
                {category}
              </Badge>
              <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {reason}
              </p>
            </div>
            <div className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// ============================================================================
// QuizListItem Component
// ============================================================================

interface QuizListItemProps {
  id: string
  title: string
  category: string
  level: QuizLevel
  isCompleted: boolean
  isLocked: boolean
}

function QuizListItem({ id, title, category, level, isCompleted, isLocked }: QuizListItemProps) {
  const levelConfig = QUIZ_LEVEL_CONFIG[level]

  if (isLocked) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-60">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800">
          <Lock className="h-5 w-5 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-muted-foreground line-clamp-1">{title}</h4>
          <p className="text-sm text-muted-foreground">{category}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${levelConfig.bgColor} ${levelConfig.color}`}>
          {LEVEL_DISPLAY_NAMES[level]}
        </span>
      </div>
    )
  }

  return (
    <Link href={`/quiz/${id}`} className="block group">
      <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-card hover:border-primary/50 hover:shadow-sm transition-all duration-200">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary/10'}`}>
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <Play className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium line-clamp-1 ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {title}
          </h4>
          <p className="text-sm text-muted-foreground">{category}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${levelConfig.bgColor} ${levelConfig.color}`}>
          {LEVEL_DISPLAY_NAMES[level]}
        </span>
        <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  )
}

// ============================================================================
// WeakCategoriesSection Component
// ============================================================================

interface WeakCategoriesSectionProps {
  categories: string[]
}

function WeakCategoriesSection({ categories }: WeakCategoriesSectionProps) {
  if (categories.length === 0) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">훌륭해요!</h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                현재 취약한 카테고리가 없습니다. 꾸준한 학습을 이어가세요.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-900/10">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30 shrink-0">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-rose-800 dark:text-rose-300">취약 카테고리</h3>
            <p className="text-sm text-rose-700 dark:text-rose-400 mt-1">
              다음 카테고리의 정답률이 낮습니다. 집중 학습이 필요해요.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge 
                  key={category} 
                  variant="outline" 
                  className="border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Main Dashboard Page
// ============================================================================

export default async function DashboardPage() {
  // 인증 확인
  const session = await getAuthenticatedSession()
  
  if (!session) {
    redirect('/auth/signin?redirect=/dashboard')
  }

  // 병렬로 데이터 조회
  const [stats, continueLearning, recommendedQuizzes] = await Promise.all([
    getDashboardStats(session.userId),
    getContinueLearning(session.userId),
    getRecommendedQuizzes(session.userId),
  ])

  // 현재 레벨에 맞는 퀴즈 조회 (3개만)
  const currentQuizLevel = userLevelToQuizLevel(stats.currentLevel)
  const levelQuizzes = await getQuizzesByLevel(currentQuizLevel, session.userId)
  const previewQuizzes = levelQuizzes.slice(0, 3)

  // 완료한 퀴즈 수
  const completedQuizzes = levelQuizzes.filter(q => q.isCompleted).length
  const totalQuizzes = levelQuizzes.length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                안녕하세요, {session.name || '학습자'}님! 👋
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                오늘도 Unity 학습을 이어가볼까요?
              </p>
            </div>
            <LevelBadge level={stats.currentLevel} size="lg" />
          </div>
        </section>

        {/* Stats Section */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="정답률"
              value={`${stats.accuracy.toFixed(1)}%`}
              description={`${stats.correctCount} / ${stats.totalAttempts}문제 정답`}
              icon={<Target className="h-6 w-6" />}
              variant={stats.accuracy >= 70 ? 'success' : stats.accuracy >= 40 ? 'warning' : 'default'}
            />
            <StatCard
              title="완료한 퀴즈"
              value={stats.totalAttempts}
              description="총 학습 퀴즈 수"
              icon={<BookOpen className="h-6 w-6" />}
            />
            <StreakDisplay 
              streakDays={stats.streakDays} 
              className="border-slate-200 dark:border-slate-800"
            />
            <StatCard
              title="이번 주 진행"
              value={`${stats.weeklyProgress}문제`}
              description="이번 주에 푼 문제"
              icon={<Calendar className="h-6 w-6" />}
              variant="success"
            />
          </div>
        </section>

        {/* Continue Learning Banner */}
        {continueLearning.hasUnfinished && continueLearning.lastQuizId && continueLearning.lastQuizTitle && (
          <section>
            <ContinueBanner
              quizId={continueLearning.lastQuizId}
              quizTitle={continueLearning.lastQuizTitle}
              progressPercent={continueLearning.progressPercent || 0}
            />
          </section>
        )}

        {/* Recommended Learning Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              추천 학습
            </h2>
            <Link href="/quizzes">
              <Button variant="ghost" size="sm" className="gap-1">
                모든 문제 보기
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {recommendedQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedQuizzes.slice(0, 3).map((quiz) => (
                <RecommendedCard
                  key={quiz.id}
                  id={quiz.id}
                  title={quiz.title}
                  category={quiz.category}
                  reason={quiz.reason}
                />
              ))}
            </div>
          ) : (
            <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
                  축하합니다! 🎉
                </h3>
                <p className="mt-2 text-emerald-700 dark:text-emerald-400">
                  모든 퀴즈를 완료했습니다. 새로운 콘텐츠가 추가될 때까지 기다려주세요.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Level-Based Learning Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                레벨별 학습
              </h2>
              <Badge variant="secondary">
                {LEVEL_DISPLAY_NAMES[currentQuizLevel]}
              </Badge>
            </div>
            <Link href={`/quizzes?level=${currentQuizLevel}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                레벨별 문제 풀기
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {/* Progress Summary */}
            <Card className="bg-slate-100/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      현재 레벨 진행률
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {completedQuizzes} / {totalQuizzes} 완료
                  </span>
                </div>
                <div className="mt-3">
                  <ProgressBar
                    current={completedQuizzes}
                    total={totalQuizzes || 1}
                    showLabel={false}
                    size="sm"
                    color="primary"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quiz List */}
            <div className="grid grid-cols-1 gap-3">
              {previewQuizzes.map((quiz) => (
                <QuizListItem
                  key={quiz.id}
                  id={quiz.id}
                  title={quiz.title}
                  category={quiz.category}
                  level={quiz.level}
                  isCompleted={quiz.isCompleted}
                  isLocked={quiz.isLocked}
                />
              ))}
            </div>

            {previewQuizzes.length === 0 && (
              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    현재 레벨에 등록된 퀴즈가 없습니다.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Weak Categories Section */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            학습 분석
          </h2>
          <WeakCategoriesSection categories={stats.weakCategories} />
        </section>

      </div>
    </div>
  )
}
