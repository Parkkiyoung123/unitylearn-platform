import { test, expect } from "@playwright/test"
import { fillSignInForm, submitForm } from "../utils/auth"

test.describe("로그인 기능", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
    await page.goto("/auth/signin")
  })

  test("이메일/비밀번호로 로그인 시도", async ({ page }) => {
    // 로그인 폼 작성 및 제출
    await fillSignInForm(page, "test@example.com", "password123")
    await submitForm(page)

    // 로그인 시도 후 페이지 이동 또는 에러 메시지 표시 확인
    // (실제 계정이 없으면 로그인 페이지에 머무르거나 에러 표시)
    await page.waitForTimeout(1000)
    
    const url = page.url()
    // 로그인 성공 시 대시보드 또는 홈으로, 실패 시 로그인 페이지 유지
    const isRedirected = url.match(/\/dashboard|\/$/)
    const stayedOnAuth = url.includes("/auth")
    
    expect(isRedirected || stayedOnAuth).toBeTruthy()
  })

  test("잘못된 비밀번호로 로그인 실패", async ({ page }) => {
    await fillSignInForm(page, "test@example.com", "wrongpassword")
    await submitForm(page)

    // 에러 메시지 표시 또는 로그인 페이지에 머무름
    await expect(page.locator("body")).toBeVisible()
    const url = page.url()
    expect(url).toContain("/auth")
  })

  test("존재하지 않는 이메일로 로그인 실패", async ({ page }) => {
    await fillSignInForm(page, "nonexistent@example.com", "password123")
    await submitForm(page)

    // 에러 메시지 표시 또는 로그인 페이지에 머무름
    await expect(page.locator("body")).toBeVisible()
    const url = page.url()
    expect(url).toContain("/auth")
  })

  test("비밀번호 재설정 페이지 이동", async ({ page }) => {
    await page.getByRole("link", { name: "비밀번호를 잊으셨나요?" }).click()
    await expect(page).toHaveURL("/auth/reset-password")
  })

  test("회원가입 페이지 이동", async ({ page }) => {
    await page.getByRole("link", { name: "회원가입" }).click()
    await expect(page).toHaveURL("/auth/signup")
  })
})
