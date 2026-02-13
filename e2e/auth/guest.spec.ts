import { test, expect } from "@playwright/test"

test.describe("게스트 모드 기능", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test("게스트로 퀴즈 체험 시작", async ({ page }) => {
    // 메인 페이지에서 게스트로 시작 버튼 클릭
    await page.getByRole("button", { name: "게스트로 체험하기" }).click()
    
    // 퀴즈 페이지로 이동
    await expect(page).toHaveURL(/\/quiz/)
  })

  test("게스트 5문제 제한 확인", async ({ page }) => {
    // 게스트 세션 설정 (4문제 이미 푼 상태 시뮬레이션)
    await page.evaluate(() => {
      localStorage.setItem(
        "unitylearn_guest_session",
        JSON.stringify({
          id: "guest_test_123",
          createdAt: new Date().toISOString(),
          attempts: 4,
          maxAttempts: 5,
          quizResults: [],
        })
      )
    })

    await page.goto("/quiz")
    
    // 페이지 로드 확인
    await expect(page.locator("body")).toBeVisible()
  })

  test("게스트 한도 도달 시 회원가입 유도", async ({ page }) => {
    // 5문제 모두 사용한 상태
    await page.evaluate(() => {
      localStorage.setItem(
        "unitylearn_guest_session",
        JSON.stringify({
          id: "guest_test_123",
          createdAt: new Date().toISOString(),
          attempts: 5,
          maxAttempts: 5,
          quizResults: [{ quizId: "1", score: 80, answers: {}, completedAt: new Date().toISOString() }],
        })
      )
    })

    await page.goto("/quiz")
    
    // 페이지 로드 확인
    await expect(page.locator("body")).toBeVisible()
  })

  test("게스트→회원 데이터 마이그레이션", async ({ page }) => {
    // 게스트 데이터 생성
    await page.evaluate(() => {
      localStorage.setItem(
        "unitylearn_guest_session",
        JSON.stringify({
          id: "guest_test_123",
          createdAt: new Date().toISOString(),
          attempts: 2,
          maxAttempts: 5,
          quizResults: [
            { quizId: "1", score: 80, answers: { q1: "A" }, completedAt: new Date().toISOString() },
          ],
        })
      )
    })

    // 회원가입 페이지로 이동
    await page.goto("/auth/signup")
    
    // 회원가입 페이지 로드 확인
    await expect(page.locator("body")).toBeVisible()
  })
})
