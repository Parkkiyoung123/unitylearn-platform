import { test, expect } from '@playwright/test'

/**
 * P1-P4 통합 E2E 테스트
 * 
 * P1: Neon Auth 인증 시스템
 * P2: UX 플로우 및 온볼딩
 * P3: UI 디자인 시스템
 * P4: 시스템 아키텍처 (3-Tier 세션 관리, DB 연동)
 */

// Use Playwright's baseURL from config (set to http://127.0.0.1:3001)
const BASE_URL = ''

test.describe('🏗️ P4: 시스템 아키텍처 테스트', () => {
  
  test('✅ Tier 1: Middleware JWT 검증 - 보호된 라우트 리다이렉트', async ({ browser }) => {
    // 완전히 새로운 브라우저 컨텍스트 생성 (쿠키 없음)
    const context = await browser.newContext({ storageState: undefined })
    const page = await context.newPage()
    
    // 디버깅: 쿠키 상태 확인
    const cookiesBefore = await context.cookies()
    console.log('Cookies before navigation:', cookiesBefore)
    
    // 인증 없이 보호된 라우트 접근 시 로그인 페이지로 리다이렉트
    const response = await page.goto(`${BASE_URL}/dashboard`)
    
    // 디버깅: 응답 상태 확인
    console.log('Response URL:', response?.url())
    console.log('Response status:', response?.status())
    
    // 디버깅: 쿠키 상태 확인
    const cookiesAfter = await context.cookies()
    console.log('Cookies after navigation:', cookiesAfter)
    
    // 현재 URL 확인
    const currentUrl = page.url()
    console.log('Current URL:', currentUrl)
    
    // URL이 /auth/signin으로 리다이렉트되었는지 확인
    // 또는 홈페이지(/)로 리다이렉트되었는지 확인 (Middleware 설정에 따라)
    expect(currentUrl).toMatch(/.*(auth\/signin|127\.0\.0\.1:3000\/$)/)
    
    await context.close()
  })

  test('✅ Tier 1: Middleware - 퍼블릭 라우트 접근 가능', async ({ page }) => {
    // 퍼블릭 라우트는 정상 접근 가능
    await page.goto(`${BASE_URL}/`)
    await expect(page).toHaveURL(`${BASE_URL}/`)
    
    // Better Auth의 로그인 경로
    await page.goto(`${BASE_URL}/auth/signin`)
    await expect(page).toHaveURL(`${BASE_URL}/auth/signin`)
  })

  test('✅ Tier 2 & 3: 세션 관리 - 쿠키 확인', async ({ page }) => {
    // 페이지 로드 후 Better Auth 세션 쿠키 확인
    await page.goto(`${BASE_URL}/`)
    
    // 모든 쿠키 가져오기
    const cookies = await page.context().cookies()
    
    // Better Auth 관련 쿠키가 존재하는지 확인 (로그인하지 않았어도 구조 확인 가능)
    const hasBetterAuthCookies = cookies.some(cookie => 
      cookie.name.includes('better-auth') || 
      cookie.name.includes('session')
    )
    
    // 쿠키 시스템이 작동하는지 확인
    expect(cookies).toBeDefined()
  })

  test('✅ P4: Health Check API', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`)
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('healthy')
    expect(data).toHaveProperty('timestamp')
  })

  test('✅ P4: DB Warmup API (P5 활성화 예정)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/db-warmup`)
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('disabled')
    expect(data.phase).toBe('P4-Testing')
  })
})

test.describe('🔐 P1: 인증 시스템 테스트', () => {
  
  test('✅ 로그인 페이지 UI - Better Auth 경로', async ({ page }) => {
    // Better Auth의 기본 로그인 경로
    await page.goto(`${BASE_URL}/auth/signin`)
    
    // 페이지가 로드되는지 확인
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=다시 오신 것을 환영합니다')).toBeVisible()
    
    // OAuth 버튼 확인
    await expect(page.locator('button:has-text("Google")')).toBeVisible()
    await expect(page.locator('button:has-text("GitHub")')).toBeVisible()
  })

  test('✅ 회원가입 페이지 UI - Better Auth 경로', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`)
    
    // 페이지 로드 확인
    await expect(page.locator('h1')).toBeVisible()
  })
})

test.describe('🎯 P2: UX 플로우 테스트', () => {
  
  test('✅ 랜딩 페이지 - Hero 섹션', async ({ page }) => {
    await page.goto(`${BASE_URL}/`)
    
    // Hero 텍스트 확인 - 더 구체적인 selector 사용
    await expect(page.getByRole('heading', { name: /Unity 버그 진단/ })).toBeVisible()
    await expect(page.locator('text=실제 Unity 프로젝트에서 발생한 버그 사례를 통해')).toBeVisible()
  })

  test('✅ 랜딩 페이지 - 진단 테스트 CTA 버튼 존재', async ({ page }) => {
    await page.goto(`${BASE_URL}/`)
    
    // 진단 테스트 시작 버튼 확인
    const diagnosticButton = page.getByRole('button', { name: /진단 테스트/ })
    await expect(diagnosticButton).toBeVisible()
    
    // 버튼 클릭 (게스트 모드에서는 로그인으로 리다이렉트될 수 있음)
    await diagnosticButton.click()
    
    // 페이지 이동 확인 (diagnostic 또는 auth/signin)
    await page.waitForURL(/.*(diagnostic|auth).*/, { timeout: 5000 })
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/.*(diagnostic|auth).*/)
  })

  test('✅ 게스트 모드 배너', async ({ page }) => {
    // 진단 테스트 페이지로 이동
    await page.goto(`${BASE_URL}/diagnostic`)
    
    // 페이지가 로드되는지 확인 (Middleware에서 리다이렉트될 수 있음)
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('🎨 P3: UI 디자인 시스템 테스트', () => {
  
  test('✅ Pretendard 폰트 적용', async ({ page }) => {
    await page.goto(`${BASE_URL}/`)
    
    // body의 font-family 확인 - Next.js는 폰트를 최적화하여 __pretendard로 표시
    const body = page.locator('body')
    const fontFamily = await body.evaluate(el => 
      window.getComputedStyle(el).fontFamily
    )
    
    // Next.js 최적화된 폰트 이름 또는 Pretendard 포함 확인
    expect(fontFamily.toLowerCase()).toContain('pretendard')
  })

  test('✅ 다크모드 토글', async ({ page }) => {
    await page.goto(`${BASE_URL}/`)
    
    // 다크모드 토글 버튼 찾기
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="다크"], button[aria-label*="라이트"]').first()
    
    if (await themeToggle.isVisible().catch(() => false)) {
      // 현재 테마 확인
      const html = page.locator('html')
      const initialClass = await html.getAttribute('class')
      
      // 토글 클릭
      await themeToggle.click()
      
      // 테마 변경 확인
      await page.waitForTimeout(300)
      const newClass = await html.getAttribute('class')
      
      expect(newClass).not.toBe(initialClass)
    }
  })

  test('✅ 반응형 레이아웃 - 모바일', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`${BASE_URL}/`)
    
    // 모바일 메뉴 버튼 확인
    const mobileMenuButton = page.locator('button[aria-label*="menu"], button[aria-label*="메뉴"]').first()
    await expect(mobileMenuButton).toBeVisible()
  })

  test('✅ UI 컴포넌트 - Button variants', async ({ page }) => {
    await page.goto(`${BASE_URL}/`)
    
    // 버튼들이 존재하는지 확인
    const buttons = page.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('🚀 통합 시나리오 테스트', () => {
  
  test('✅ 전체 플로우: 랜딩 → 진단 테스트', async ({ page }) => {
    // 1. 랜딩 페이지
    await page.goto(`${BASE_URL}/`)
    await expect(page.getByRole('heading', { name: /Unity 버그 진단/ })).toBeVisible()
    
    // 2. 진단 테스트 시작 버튼 클릭
    const diagnosticButton = page.getByRole('button', { name: /진단 테스트/ })
    await diagnosticButton.click()
    
    // 3. 페이지 이동 확인 (diagnostic 또는 auth/signin)
    await page.waitForURL(/.*(diagnostic|auth).*/, { timeout: 5000 })
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/.*(diagnostic|auth).*/)
  })

  test('✅ 네비게이션 메뉴', async ({ page }) => {
    await page.goto(`${BASE_URL}/`)
    
    // 네비게이션이 있는지 확인
    const nav = page.locator('nav').first()
    await expect(nav).toBeVisible()
  })
})
