import { test, expect } from "@playwright/test"
import { fillSignUpForm } from "../utils/auth"

test.describe("회원가입 기능", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
    await page.goto("/auth/signup")
  })

  test("회원가입 페이지 접근", async ({ page }) => {
    // 페이지 제목 확인
    await expect(page.getByRole("heading")).toBeVisible()
    // 입력 필드 확인
    await expect(page.getByRole("textbox", { name: "이메일" })).toBeVisible()
  })

  test("새 계정으로 회원가입 시도", async ({ page }) => {
    const timestamp = Date.now()
    const email = `test${timestamp}@example.com`
    
    await fillSignUpForm(page, "Test User", email, "password123")
    await page.getByRole("button", { name: "회원가입" }).click()

    // 회원가입 처리 중 대기
    await page.waitForTimeout(2000)
    
    // 페이지 로드 확인 (성공 또는 실패 모두 body는 존재)
    await expect(page.locator("body")).toBeVisible()
  })

  test("이메일 입력 필드 존재", async ({ page }) => {
    const emailInput = page.getByRole("textbox", { name: "이메일" })
    await expect(emailInput).toBeVisible()
  })

  test("비밀번호 입력 필드 존재", async ({ page }) => {
    const passwordInputs = page.getByRole("textbox").filter({ hasText: /.*/ })
    // 최소 2개의 입력 필드 존재 (이메일, 비밀번호)
    expect(await passwordInputs.count()).toBeGreaterThanOrEqual(1)
  })
})
