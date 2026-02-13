'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Bug, 
  CheckCircle, 
  XCircle, 
  LogIn, 
  LogOut, 
  AlertTriangle,
  Copy
} from 'lucide-react'

// 개발용 테스트 사용자 정보
const DEV_USER = {
  id: 'c3a1585f-d4a8-42e2-b88e-18b4d1bf0577',
  email: 'demo@unitylearn.com',
  name: '데모 사용자',
  level: 'Intermediate',
}

const COOKIE_NAME = 'dev_session'
const COOKIE_VALUE = DEV_USER.email

/**
 * 개발 도구 페이지
 * 
 * 개발 환경에서 인증 없이 대시보드를 테스트하기 위한 도구
 * - 개발 모드 활성화/비활성화
 * - 쿠키 수동 설정/제거
 * - 테스트 계정 정보 확인
 */
export default function DevToolsPage() {
  const [isDevMode, setIsDevMode] = useState(false)
  const [copied, setCopied] = useState(false)

  // 페이지 로드 시 쿠키 상태 확인
  useEffect(() => {
    const hasDevCookie = document.cookie.includes(`${COOKIE_NAME}=${COOKIE_VALUE}`)
    setIsDevMode(hasDevCookie)
  }, [])

  // 개발 모드 활성화
  const enableDevMode = () => {
    // 쿠키 설정 (7일 유효)
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
    document.cookie = `${COOKIE_NAME}=${COOKIE_VALUE}; path=/; expires=${expires}`
    setIsDevMode(true)
  }

  // 개발 모드 비활성화
  const disableDevMode = () => {
    // 쿠키 삭제
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    setIsDevMode(false)
  }

  // 콘솔 명령어 복사
  const copyConsoleCommand = () => {
    const command = `document.cookie = "${COOKIE_NAME}=${COOKIE_VALUE}; path=/"`
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Bug className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">개발 도구</h1>
            <p className="text-muted-foreground">Development Tools</p>
          </div>
        </div>

        {/* Environment Alert */}
        {process.env.NODE_ENV === 'production' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              이 페이지는 프로덕션 환경에서도 접근 가능합니다. 
              개발 모드 쿠키는 개발 환경에서만 동작합니다.
            </AlertDescription>
          </Alert>
        )}

        {/* Dev Mode Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              개발 모드 상태
              {isDevMode ? (
                <Badge variant="default" className="bg-emerald-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  활성화
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" />
                  비활성화
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              개발 모드가 활성화되면 인증 없이 대시보드에 접근할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isDevMode ? (
              <Button 
                variant="danger" 
                onClick={disableDevMode}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                개발 모드 비활성화
              </Button>
            ) : (
              <Button 
                onClick={enableDevMode}
                className="w-full"
              >
                <LogIn className="h-4 w-4 mr-2" />
                개발 모드 활성화
              </Button>
            )}
            
            <div className="text-sm text-muted-foreground">
              <p>개발 모드가 활성화되면 다음 페이지에 접근할 수 있습니다:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>/dashboard - 대시보드</li>
                <li>/profile - 프로필</li>
                <li>/settings - 설정</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Test Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>테스트 계정 정보</CardTitle>
            <CardDescription>
              개발 모드에서 사용되는 테스트 사용자 정보입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">ID</span>
                <code className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {DEV_USER.id}
                </code>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Email</span>
                <code className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {DEV_USER.email}
                </code>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{DEV_USER.name}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Level</span>
                <Badge variant="outline">{DEV_USER.level}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Cookie Setup */}
        <Card>
          <CardHeader>
            <CardTitle>수동 쿠키 설정</CardTitle>
            <CardDescription>
              브라우저 개발자 도구 콘솔에서 직접 쿠키를 설정할 수도 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <code>
                document.cookie = &quot;{COOKIE_NAME}={COOKIE_VALUE}; path=/&quot;
              </code>
            </div>
            <Button 
              variant="outline" 
              onClick={copyConsoleCommand}
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? '복사됨!' : '명령어 복사'}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {isDevMode && (
          <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10">
            <CardHeader>
              <CardTitle className="text-emerald-800 dark:text-emerald-300">
                빠른 이동
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" asChild>
                  <a href="/dashboard">대시보드</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/profile">프로필</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/quizzes">퀴즈</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          개발 환경에서만 사용하세요. 프로덕션에서는 동작하지 않습니다.
        </p>

      </div>
    </div>
  )
}
