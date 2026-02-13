import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * 개발 모드 세션 API
 * 
 * 개발 환경에서만 사용 가능한 세션 관리 API
 * - POST: 개발 모드 세션 활성화
 * - DELETE: 개발 모드 세션 비활성화
 */

const DEV_COOKIE_NAME = 'dev_session'
const DEV_COOKIE_VALUE = 'demo@unitylearn.com'

// 개발 환경 체크
function checkDevelopment(): NextResponse | null {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }
  return null
}

/**
 * POST /api/dev/session
 * 개발 모드 세션 활성화
 */
export async function POST() {
  const envCheck = checkDevelopment()
  if (envCheck) return envCheck

  const cookieStore = cookies()
  
  // 7일 유효한 쿠키 설정
  cookieStore.set(DEV_COOKIE_NAME, DEV_COOKIE_VALUE, {
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    httpOnly: false, // JavaScript에서 접근 가능
    secure: false,
    sameSite: 'lax',
  })

  return NextResponse.json({ 
    success: true, 
    message: 'Development session enabled',
    user: {
      email: DEV_COOKIE_VALUE,
      name: '데모 사용자',
    }
  })
}

/**
 * DELETE /api/dev/session
 * 개발 모드 세션 비활성화
 */
export async function DELETE() {
  const envCheck = checkDevelopment()
  if (envCheck) return envCheck

  const cookieStore = cookies()
  cookieStore.delete(DEV_COOKIE_NAME)

  return NextResponse.json({ 
    success: true, 
    message: 'Development session disabled' 
  })
}

/**
 * GET /api/dev/session
 * 현재 개발 모드 세션 상태 확인
 */
export async function GET() {
  const envCheck = checkDevelopment()
  if (envCheck) return envCheck

  const cookieStore = cookies()
  const devCookie = cookieStore.get(DEV_COOKIE_NAME)

  return NextResponse.json({
    enabled: devCookie?.value === DEV_COOKIE_VALUE,
    user: devCookie?.value === DEV_COOKIE_VALUE ? {
      email: DEV_COOKIE_VALUE,
      name: '데모 사용자',
    } : null
  })
}
