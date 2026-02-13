/**
 * Next.js Middleware - Simplified Authentication Check
 * 
 * 핵심 원칙: 인증되지 않은 사용자는 보호된 라우트에 접근 불가
 * 개발 모드: dev_session 쿠키로 개발용 세션 우회 가능
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 보호된 라우트 목록
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/settings']
const PUBLIC_ROUTES = ['/', '/auth/signin', '/auth/signup', '/about', '/contact']

// 개발용 테스트 사용자 정보
const DEV_USER_EMAIL = 'demo@unitylearn.com'
const DEV_USER_ID = 'c3a1585f-d4a8-42e2-b88e-18b4d1bf0577'

/**
 * 간소화된 미들웨어 핸들러
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  
  console.log(`[Middleware] Checking: ${pathname}`)
  
  // 1. Public 라우트는 즉시 통과
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    console.log(`[Middleware] Public route, passing through`)
    return NextResponse.next()
  }
  
  // 2. API routes는 통과 (Better Auth가 처리)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // 3. 정적 파일 통과
  if (pathname.includes('_next') || pathname.includes('favicon')) {
    return NextResponse.next()
  }
  
  // 4. 보호된 라우트 확인
  const isProtected = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  if (!isProtected) {
    // 보호되지 않은 라우트도 통과
    return NextResponse.next()
  }
  
  // 5. 보호된 라우트 - 세션 쿠키 확인
  const sessionCookie = request.cookies.get('better-auth.session_token')?.value
  const devSessionCookie = request.cookies.get('dev_session')?.value
  
  console.log(`[Middleware] Protected route. Session cookie: ${sessionCookie ? 'present' : 'missing'}`)
  
  // 개발 모드: dev_session 쿠키가 있으면 접근 허용
  if (!sessionCookie && devSessionCookie === DEV_USER_EMAIL && process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Development mode - allowing access for ${DEV_USER_EMAIL}`)
    return NextResponse.next()
  }
  
  if (!sessionCookie) {
    // 인증되지 않음 - 로그인 페이지로 리다이렉트
    const loginUrl = new URL('/auth/signin', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    console.log(`[Middleware] Redirecting to: ${loginUrl.toString()}`)
    return NextResponse.redirect(loginUrl)
  }
  
  // 인증됨 - 통과
  console.log(`[Middleware] Authenticated, allowing access`)
  return NextResponse.next()
}

/**
 * 미들웨어 매처 설정
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
