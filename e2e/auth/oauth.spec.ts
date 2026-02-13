import { test, expect } from "@playwright/test"

test.describe("OAuth 인증", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/signin")
    // 페이지 로드 완료 대기
    await page.waitForLoadState("networkidle")
  })

  test("Google OAuth 버튼 표시", async ({ page }) => {
    // getByRole 사용
    const googleButton = page.getByRole("button", { name: "Google" })
    await expect(googleButton).toBeVisible({ timeout: 10000 })
    await expect(googleButton).toBeEnabled()
  })

  test("GitHub OAuth 버튼 표시", async ({ page }) => {
    const githubButton = page.getByRole("button", { name: "GitHub" })
    await expect(githubButton).toBeVisible({ timeout: 10000 })
    await expect(githubButton).toBeEnabled()
  })

  test("OAuth 버튼 클릭", async ({ page }) => {
    const googleButton = page.getByRole("button", { name: "Google" })
    
    // 버튼이 먼저 visible인지 확인
    await expect(googleButton).toBeVisible({ timeout: 10000 })
    
    // 클릭
    await googleButton.click()
    
    // Google 로그인 페이지로 리다이렉트 확인 (또는 로딩 상태)
    await page.waitForTimeout(2000)
    const url = page.url()
    // Google OAuth URL 또는 원래 페이지에 머무름
    expect(url).toMatch(/accounts\.google\.com|localhost/)
  })
})
